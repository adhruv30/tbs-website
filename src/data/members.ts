import membersJson from './members.json'

export type Cohort = 'exec' | 'active'

export type Member = {
  slug: string
  name: string
  role: string
  cohort: Cohort
  year: string
  major: string
  hometown: string
  photo: string
  bio: string
  interests: string[]
  funFacts: string[]
  linkedin?: string
  email?: string
}

export const members = membersJson as Member[]

export function membersByCohort(cohort: Cohort): Member[] {
  return members.filter((member) => member.cohort === cohort)
}

export function getMember(slug: string): Member | undefined {
  return members.find((member) => member.slug === slug)
}
