import membersJson from './members.json'
import type { RosterKey } from './rosters'

export type Cohort = 'exec' | 'active'

export type ClassYear = 1 | 2 | 3 | 4 | 5

export type Member = {
  slug: string
  name: string
  role: string | null
  isExec: boolean | null
  year: ClassYear | null
  major: string | null
  hometown: string | null
  careerInterests: string[]
  hobbies: string[]
  photo: string | null
  linkedin: string | null
}

export const members = membersJson as Member[]

const CLASS_LABELS: Record<ClassYear, string> = {
  1: 'Freshman',
  2: 'Sophomore',
  3: 'Junior',
  4: 'Senior',
  5: 'Fifth Year',
}

/** `null` when the year is unknown, so callers can omit the field entirely. */
export function classLabel(year: ClassYear | null): string | null {
  return year === null ? null : (CLASS_LABELS[year] ?? null)
}

/** `isExec: null` is treated as Active until the roster is confirmed. */
export function cohortOf(member: Member): Cohort {
  return member.isExec === true ? 'exec' : 'active'
}

export function membersByCohort(cohort: Cohort): Member[] {
  return members.filter((member) => cohortOf(member) === cohort)
}

/**
 * Alphabetical by first name. Names are stored "First Last", so comparing the
 * whole string orders by first name and settles ties on the surname.
 */
export function membersByFirstName(list: Member[] = members): Member[] {
  return [...list].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  )
}

/**
 * A roster in the order its page renders it. Both the roster pages and the
 * profile pager read the sequence from here, so the "next" link can never walk
 * an order different from the grid the visitor just came from.
 */
export function rosterMembers(roster: RosterKey): Member[] {
  return roster === 'exec' ? membersByCohort('exec') : membersByFirstName()
}

/** Just enough of a member to label a link to them. */
export type MemberRef = {
  slug: string
  name: string
}

export type Neighbors = {
  previous: MemberRef | null
  next: MemberRef | null
}

/**
 * Who sits either side of this member on the given roster. The ends are
 * `null` rather than wrapping around, so the first profile offers no
 * "previous" and the last offers no "next".
 */
export function rosterNeighbors(slug: string, roster: RosterKey): Neighbors {
  const list = rosterMembers(roster)
  const index = list.findIndex((member) => member.slug === slug)
  if (index === -1) return { previous: null, next: null }

  const ref = (member: Member | undefined): MemberRef | null =>
    member ? { slug: member.slug, name: member.name } : null

  return { previous: ref(list[index - 1]), next: ref(list[index + 1]) }
}

export function getMember(slug: string): Member | undefined {
  return members.find((member) => member.slug === slug)
}

/** First letters of the first two words: "Nyle Santiago Millan" -> "NS". */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}
