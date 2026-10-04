import { z } from 'zod'

import { applyPage } from '@/data/site'

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const PHOTO_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

export const VOTES = ['yes', 'no', 'abstain'] as const
export type Vote = (typeof VOTES)[number]

export type PortalSettings = {
  /** Yes votes an applicant needs to meet the bar. 0 = no threshold. */
  voteThreshold: number
  /** Admin views show tallies only, not who voted what. */
  anonymizeVotes: boolean
}

export const DEFAULT_SETTINGS: PortalSettings = { voteThreshold: 0, anonymizeVotes: false }

export const VOTE_LABELS: Record<Vote, string> = {
  yes: 'Yes',
  no: 'No',
  abstain: 'Abstain',
}

export const YEAR_LABELS: Record<number, string> = {
  1: 'Freshman',
  2: 'Sophomore',
  3: 'Junior',
  4: 'Senior',
  5: 'Fifth Year',
}

export type Application = {
  id: string
  cycle: string
  email: string
  name: string
  phone: string | null
  year: number | null
  major: string
  grad_term: string
  gpa: number | null
  answers: Record<string, string>
  photo_path: string | null
  resume_path: string | null
  created_at: string
}

export type ApplicationField =
  | 'name'
  | 'email'
  | 'phone'
  | 'year'
  | 'major'
  | 'grad_term'
  | 'gpa'
  | 'photo'
  | 'resume'
  | `answer_${string}`

const file = (types: readonly string[], label: string) =>
  z
    .instanceof(File, { message: `Please attach your ${label}.` })
    .refine((f) => f.size > 0, `Please attach your ${label}.`)
    .refine((f) => f.size <= MAX_UPLOAD_BYTES, `Your ${label} must be 5 MB or smaller.`)
    .refine((f) => types.includes(f.type), `That ${label} file type isn't supported.`)

const text = (label: string, max: number) =>
  z
    .string({ message: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`)

export const applicationSchema = z.object({
  name: text('Name', 100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email address.')),
  phone: z
    .string()
    .trim()
    .max(30, 'Enter a valid phone number.')
    .regex(/^[\d\s()+.-]*$/, 'Enter a valid phone number.')
    .transform((v) => v || null),
  year: z.coerce
    .number({ message: 'Choose your year.' })
    .int()
    .min(1, 'Choose your year.')
    .max(5, 'Choose your year.'),
  major: text('Major', 100),
  grad_term: text('Expected graduation', 40),
  gpa: z.coerce
    .number({ message: 'Enter your GPA, e.g. 3.45.' })
    .min(0, 'GPA must be between 0 and 4.')
    .max(4, 'GPA must be between 0 and 4.'),
  answers: z.object(
    Object.fromEntries(
      applyPage.prompts.map((p) => [p.id, text('This answer', p.maxLength)]),
    ),
  ),
  photo: file(Object.keys(PHOTO_TYPES), 'headshot'),
  resume: file(['application/pdf'], 'resume'),
})

/** Text fields echoed back after a failed submit so nothing has to be retyped. */
export type ApplyValues = Record<string, string>

export type ApplyState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error'
      message: string
      errors: Partial<Record<ApplicationField, string>>
      values: ApplyValues
    }
