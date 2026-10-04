/**
 * Fake sign-ins for local development, created by `pnpm seed:dummy`. The login
 * page only offers them when running `next dev`, and the seed script refuses
 * to touch anything but a local Supabase, so they never exist in production.
 */
export const DEV_PASSWORD = 'tbs-dev-password'

export type DevAccount = {
  email: string
  label: string
  description: string
}

export const DEV_ACCOUNTS: DevAccount[] = [
  {
    email: 'admin@tbs.dev',
    label: 'Admin',
    description: 'Sees tallies, sets the threshold, doesn’t vote',
  },
  {
    email: 'member@tbs.dev',
    label: 'Active member',
    description: 'Votes in the live room, sees only their own vote',
  },
  // Seeded voters (see `DUMMY_MEMBERS`), for testing the room with several people.
  {
    email: 'voter2@tbs.dev',
    label: 'Active member 2',
    description: 'Jordan Patel',
  },
  {
    email: 'voter3@tbs.dev',
    label: 'Active member 3',
    description: 'Riley Chen',
  },
  {
    email: 'outsider@tbs.dev',
    label: 'Not on roster',
    description: 'Signs in but should be turned away',
  },
]

export const devLoginEnabled = () => process.env.NODE_ENV === 'development'
