import membersJson from './members.json'

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

/** The member holding the President role, used by the home page letter. */
export function getPresident(): Member | undefined {
  return members.find((member) => member.role === 'President')
}
