import 'server-only'

import { cache } from 'react'

import {
  DEFAULT_SETTINGS,
  type Application,
  type PortalSettings,
  type Vote,
} from '@/lib/applications'
import { isMockBackend } from '@/lib/backend-mode'
import { mockFileUrl, readMockDb } from '@/lib/mock/store'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'applications'
/** Long enough to sit on a page while voting, short enough not to leak. */
const SIGNED_URL_TTL = 60 * 60

export type ApplicationListItem = Pick<
  Application,
  'id' | 'name' | 'year' | 'major' | 'grad_term' | 'gpa' | 'created_at'
> & { photoUrl: string | null }

export type VoteTally = { yes: number; no: number; abstain: number; total: number }

export type MemberVote = { memberId: string; name: string; vote: Vote | null }

/** Path -> signed URL, in one storage round trip. Missing paths are skipped. */
async function signUrls(paths: (string | null)[]): Promise<Map<string, string>> {
  const wanted = paths.filter((p): p is string => !!p)
  if (wanted.length === 0) return new Map()

  const supabase = await createClient()
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(wanted, SIGNED_URL_TTL)

  return new Map(
    (data ?? [])
      .filter((d) => d.path && d.signedUrl && !d.error)
      .map((d) => [d.path!, d.signedUrl!]),
  )
}

/** Oldest first, so the order is stable as new applications arrive. */
export const listApplications = cache(async (): Promise<ApplicationListItem[]> => {
  if (isMockBackend()) {
    return readMockDb()
      .applications.toSorted((a, b) => a.created_at.localeCompare(b.created_at))
      .map(({ id, name, year, major, grad_term, gpa, created_at, photo_path }) => ({
        id, name, year, major, grad_term, gpa, created_at,
        photoUrl: mockFileUrl(photo_path),
      }))
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('id, name, year, major, grad_term, gpa, created_at, photo_path')
    .order('created_at', { ascending: true })
  if (error) throw error

  const urls = await signUrls(data.map((a) => a.photo_path))
  return data.map(({ photo_path, ...rest }) => ({
    ...rest,
    photoUrl: photo_path ? (urls.get(photo_path) ?? null) : null,
  }))
})

export async function getApplication(id: string) {
  if (isMockBackend()) {
    const application = readMockDb().applications.find((a) => a.id === id)
    if (!application) return null
    return {
      application,
      photoUrl: mockFileUrl(application.photo_path),
      resumeUrl: mockFileUrl(application.resume_path),
    }
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .maybeSingle<Application>()
  if (!data) return null

  const urls = await signUrls([data.photo_path, data.resume_path])
  return {
    application: data,
    photoUrl: data.photo_path ? (urls.get(data.photo_path) ?? null) : null,
    resumeUrl: data.resume_path ? (urls.get(data.resume_path) ?? null) : null,
  }
}

/** The signed-in member's own ballot, keyed by application id. */
export const getMyVotes = cache(async (memberId: string): Promise<Map<string, Vote>> => {
  if (isMockBackend()) {
    return new Map(
      readMockDb()
        .votes.filter((v) => v.member_id === memberId)
        .map((v) => [v.application_id, v.vote]),
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('votes')
    .select('application_id, vote')
    .eq('member_id', memberId)
  if (error) throw error
  return new Map(data.map((v) => [v.application_id, v.vote as Vote]))
})

/**
 * Tallies per application. RLS only returns every vote to admins, and the
 * mock backend has no RLS at all, so callers must gate this on `isAdmin`.
 */
export async function getVoteTallies(): Promise<Map<string, VoteTally>> {
  if (isMockBackend()) {
    const tallies = new Map<string, VoteTally>()
    for (const v of readMockDb().votes) {
      const t = tallies.get(v.application_id) ?? { yes: 0, no: 0, abstain: 0, total: 0 }
      t[v.vote]++
      t.total++
      tallies.set(v.application_id, t)
    }
    return tallies
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('application_vote_summary')
    .select('application_id, yes, no, abstain, total')
  if (error) throw error
  return new Map(data.map(({ application_id, ...tally }) => [application_id, tally]))
}

/** The electorate: members who can sign in, minus admins, who don't vote. */
export const listVoters = cache(async (): Promise<{ id: string; name: string }[]> => {
  if (isMockBackend()) {
    return readMockDb()
      .members.filter((m) => !m.is_admin)
      .map(({ id, name }) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('id, name')
    .not('email', 'is', null)
    .eq('is_admin', false)
    .order('name')
  if (error) throw error
  return data
})

/** Every voter with their vote on one applicant. Admins only: gate on `isAdmin`. */
export async function getVoteBreakdown(applicationId: string): Promise<MemberVote[]> {
  if (isMockBackend()) {
    const votes = readMockDb().votes.filter((v) => v.application_id === applicationId)
    const byMember = new Map(votes.map((v) => [v.member_id, v.vote]))
    return (await listVoters()).map((m) => ({
      memberId: m.id,
      name: m.name,
      vote: byMember.get(m.id) ?? null,
    }))
  }

  const supabase = await createClient()
  const [voters, { data, error }] = await Promise.all([
    listVoters(),
    supabase.from('votes').select('member_id, vote').eq('application_id', applicationId),
  ])
  if (error) throw error

  const byMember = new Map(data.map((v) => [v.member_id, v.vote as Vote]))
  return voters.map((m) => ({
    memberId: m.id,
    name: m.name,
    vote: byMember.get(m.id) ?? null,
  }))
}

export const getSettings = cache(async (): Promise<PortalSettings> => {
  if (isMockBackend()) return readMockDb().settings

  const supabase = await createClient()
  const { data } = await supabase
    .from('portal_settings')
    .select('vote_threshold, anonymize_votes')
    .maybeSingle()
  return data
    ? { voteThreshold: data.vote_threshold, anonymizeVotes: data.anonymize_votes }
    : DEFAULT_SETTINGS
})
