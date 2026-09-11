/**
 * One-off seeder: pushes src/data/members.json into the Supabase `members`
 * table. Upserts on `slug`, so re-running it is safe and idempotent.
 *
 *   pnpm seed:members
 *
 * Runs with the service role key, which bypasses RLS — keep it local, never
 * import this from app code.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

config({ path: path.join(repoRoot, '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
  )
}

/** Admins are named explicitly rather than derived from `role`. */
const ADMIN_SLUGS = new Set(['fiona-chen', 'krishna-patel', 'arjun-dhruv'])

type MemberJson = {
  slug: string
  name: string
  role: string | null
  isExec: boolean | null
  year: number | null
  major: string | null
  hometown: string | null
  careerInterests: string[]
  hobbies: string[]
  photo: string | null
  linkedin: string | null
}

type MemberRow = {
  slug: string
  email: null
  name: string
  role: string | null
  is_exec: boolean
  is_admin: boolean
  year: number | null
  major: string | null
  hometown: string | null
  career_interests: string[]
  hobbies: string[]
  photo_path: string | null
  linkedin_url: string | null
}

function toRow(member: MemberJson): MemberRow {
  return {
    slug: member.slug,
    email: null,
    name: member.name,
    role: member.role,
    // The column is NOT NULL; `isExec: null` means "unconfirmed" => not exec.
    is_exec: member.isExec === true,
    is_admin: ADMIN_SLUGS.has(member.slug),
    year: member.year,
    major: member.major,
    hometown: member.hometown,
    career_interests: member.careerInterests ?? [],
    hobbies: member.hobbies ?? [],
    photo_path: member.photo,
    linkedin_url: member.linkedin,
  }
}

async function main() {
  const raw = await readFile(
    path.join(repoRoot, 'src/data/members.json'),
    'utf8',
  )
  const members = JSON.parse(raw) as MemberJson[]
  const rows = members.map(toRow)

  const missingAdmins = [...ADMIN_SLUGS].filter(
    (slug) => !rows.some((row) => row.slug === slug),
  )
  if (missingAdmins.length > 0) {
    throw new Error(`Admin slugs not found in members.json: ${missingAdmins.join(', ')}`)
  }

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from('members')
    .upsert(rows, { onConflict: 'slug' })
    .select('slug')

  if (error) {
    throw new Error(`Upsert failed: ${error.message}`)
  }

  console.log(`Upserted ${data?.length ?? 0} of ${rows.length} members.`)
  console.log(
    `Admins: ${rows.filter((row) => row.is_admin).map((row) => row.slug).join(', ')}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
