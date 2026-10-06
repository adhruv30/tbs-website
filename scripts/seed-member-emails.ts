/**
 * Sets the sign-in email for each member from a local, gitignored CSV:
 *
 *   scripts/member-emails.csv
 *   slug,email
 *   fiona-chen,fiona@example.com
 *
 *   pnpm seed:emails
 *
 * Emails stay out of members.json because that file ships to the browser.
 * Runs with the service role key, which bypasses RLS — keep it local.
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

async function main() {
  const raw = await readFile(path.join(repoRoot, 'scripts/member-emails.csv'), 'utf8')
  const rows = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split(',').map((cell) => cell.trim()))
    .filter(([slug]) => slug !== 'slug')

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let updated = 0
  const missing: string[] = []
  for (const [slug, email] of rows) {
    if (!slug || !email?.includes('@')) {
      throw new Error(`Bad row: "${slug},${email ?? ''}"`)
    }
    const { data, error } = await supabase
      .from('members')
      .update({ email: email.toLowerCase() })
      .eq('slug', slug)
      .select('slug')
    if (error) throw new Error(`${slug}: ${error.message}`)
    if (data.length === 0) missing.push(slug)
    else updated++
  }

  console.log(`Updated ${updated} of ${rows.length} member emails.`)
  if (missing.length > 0) console.warn(`Slugs not found: ${missing.join(', ')}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
