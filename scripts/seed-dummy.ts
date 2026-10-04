/**
 * Fills a LOCAL Supabase with fake members, applicants and votes, plus the
 * dev sign-in accounts the login page offers under `next dev`:
 *
 *   supabase start && pnpm seed:dummy
 *
 * Not needed without Supabase: `next dev` with no Supabase env falls back to
 * a mock backend seeded with the same data (see `src/lib/mock/store.ts`).
 *
 * Re-running resets the dummy data (dummy applicants are the `@example.edu`
 * emails, dummy members the `dev-` slugs). Refuses any non-local URL, since it
 * creates accounts with a known password.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

import { DEV_ACCOUNTS, DEV_PASSWORD } from '../src/lib/dev-accounts'
import {
  buildDummyApplicants,
  buildDummyVotes,
  DUMMY_EMAIL_DOMAIN,
  DUMMY_MEMBERS,
  dummyResume,
} from '../src/lib/dummy-data'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

config({ path: path.join(repoRoot, '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
  )
}
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(SUPABASE_URL)) {
  throw new Error(`Refusing to seed dummy data into non-local Supabase: ${SUPABASE_URL}`)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const BUCKET = 'applications'

async function ensureAuthUser(email: string) {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password: DEV_PASSWORD,
    email_confirm: true,
  })
  if (error && !/already/i.test(error.message)) {
    throw new Error(`createUser ${email}: ${error.message}`)
  }
}

async function main() {
  // Members and their sign-ins.
  const { data: members, error: memberError } = await supabase
    .from('members')
    .upsert(DUMMY_MEMBERS, { onConflict: 'slug' })
    .select('id, slug, email, is_admin')
  if (memberError) throw new Error(`members: ${memberError.message}`)

  for (const email of new Set([...DUMMY_MEMBERS.map((m) => m.email), ...DEV_ACCOUNTS.map((a) => a.email)])) {
    await ensureAuthUser(email)
  }

  // Wipe the previous dummy applicants (votes cascade) and their files.
  const { data: old } = await supabase
    .from('applications')
    .select('id')
    .like('email', `%${DUMMY_EMAIL_DOMAIN}`)
  for (const { id } of old ?? []) {
    await supabase.storage.from(BUCKET).remove([`${id}/photo.png`, `${id}/resume.pdf`])
  }
  await supabase.from('applications').delete().like('email', `%${DUMMY_EMAIL_DOMAIN}`)

  const applicants = buildDummyApplicants()
  const { data: inserted, error: appError } = await supabase
    .from('applications')
    .insert(applicants.map((a) => a.fields))
    .select('id, name, major, grad_term, email')
  if (appError) throw new Error(`applications: ${appError.message}`)

  for (const [i, app] of inserted.entries()) {
    const photoPath = applicants[i].hasPhoto ? `${app.id}/photo.png` : null
    const resumePath = `${app.id}/resume.pdf`
    if (photoPath) {
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(photoPath, applicants[i].photo(), { contentType: 'image/png', upsert: true })
      if (error) throw new Error(`photo ${app.name}: ${error.message}`)
    }
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(resumePath, dummyResume(app), { contentType: 'application/pdf', upsert: true })
    if (error) throw new Error(`resume ${app.name}: ${error.message}`)
    await supabase
      .from('applications')
      .update({ photo_path: photoPath, resume_path: resumePath })
      .eq('id', app.id)
  }

  const votes = buildDummyVotes(inserted.map((a) => a.id), members)
  const { error: voteError } = await supabase.from('votes').insert(votes)
  if (voteError) throw new Error(`votes: ${voteError.message}`)

  console.log(`Seeded ${members.length} dummy members, ${inserted.length} applicants, ${votes.length} votes.`)
  console.log(`Dev sign-ins (password "${DEV_PASSWORD}"): ${DEV_ACCOUNTS.map((a) => `${a.label} <${a.email}>`).join(', ')}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
