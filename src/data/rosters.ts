/**
 * The two rosters a profile can be reached from. Cards link with `?from=<key>`
 * (see `MemberCard`), and the key is looked up here rather than used to build a
 * URL, so a hand-edited value can only ever fall back — never point the link
 * somewhere unexpected.
 *
 * Kept clear of `./members` so client components can import the key without
 * pulling the whole roster into the browser bundle.
 */
export const ROSTERS = {
  members: { href: '/members', label: 'Active Members' },
  exec: { href: '/executive-committee', label: 'Executive Committee' },
} as const

export type RosterKey = keyof typeof ROSTERS

export function isRosterKey(value: string | null): value is RosterKey {
  return value !== null && value in ROSTERS
}
