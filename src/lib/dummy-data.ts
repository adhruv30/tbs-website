/**
 * Fake members, applicants and votes, shared by `pnpm seed:dummy` (which
 * pushes them into a local Supabase) and the mock backend `next dev` uses
 * when no Supabase is configured. Deterministic, so both produce the same set.
 */
import { deflateSync } from 'node:zlib'

import { applyPage } from '../data/site'
import { DEV_ACCOUNTS } from './dev-accounts'

export const DUMMY_EMAIL_DOMAIN = '@example.edu'

/** Deterministic, so every reset produces the same applicants and votes. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32
    return seed / 2 ** 32
  }
}
let random = rng(42)
const pick = <T>(list: T[]) => list[Math.floor(random() * list.length)]



const [adminAccount, memberAccount] = DEV_ACCOUNTS

export const DUMMY_MEMBERS = [
  { slug: 'dev-admin', name: 'Dev Admin', email: adminAccount.email, is_admin: true },
  { slug: 'dev-member', name: 'Dev Member', email: memberAccount.email, is_admin: false },
  ...[
    'Avery Lin', 'Jordan Patel', 'Riley Chen', 'Morgan Garcia',
    'Casey Kim', 'Taylor Nguyen', 'Quinn Ramirez', 'Skyler Shah',
  ].map((name, i) => ({
    slug: `dev-voter-${i + 1}`,
    name,
    email: `voter${i + 1}@tbs.dev`,
    is_admin: i === 0,
  })),
]

// Files -----------------------------------------------------------------------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(buf: Buffer) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function pngChunk(type: string, data: Buffer) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

/** A placeholder headshot: a head-and-shoulders silhouette on a tinted ground. */
export function silhouettePng(hue: number, size = 256): Buffer {
  const hsl = (l: number) => {
    const a = 0.45 * Math.min(l, 1 - l)
    const f = (n: number) => {
      const k = (n + hue / 30) % 12
      return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
    }
    return [f(0), f(8), f(4)]
  }
  const bg = hsl(0.78)
  const fg = hsl(0.42)
  const rows: Buffer[] = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3)
    for (let x = 0; x < size; x++) {
      const u = x / size - 0.5
      const v = y / size
      const head = u * u + (v - 0.4) ** 2 < 0.035
      const shoulders = v > 0.68 && u * u / 0.12 + (v - 1.02) ** 2 / 0.12 < 1
      const [r, g, b] = head || shoulders ? fg : bg
      row.set([r, g, b], 1 + x * 3)
    }
    rows.push(row)
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header.set([8, 2, 0, 0, 0], 8) // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(Buffer.concat(rows))),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

/** A one-page PDF resume with a few lines of text. */
export function resumePdf(lines: string[]): Buffer {
  const esc = (s: string) => s.replace(/[\\()]/g, (c) => `\\${c}`)
  const text = lines
    .map((line, i) => `BT /F1 ${i === 0 ? 20 : 12} Tf 72 ${720 - i * 24} Td (${esc(line)}) Tj ET`)
    .join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf))
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
  })
  const xref = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(pdf)
}

// Applicants ------------------------------------------------------------------

const FIRST = ['Maya', 'Ethan', 'Sofia', 'Lucas', 'Aisha', 'Noah', 'Priya', 'Diego', 'Hana', 'Owen', 'Leila', 'Marcus', 'Grace', 'Rohan', 'Elena', 'Kai', 'Nadia', 'Theo']
const LAST = ['Alvarez', 'Brooks', 'Cho', 'Desai', 'Edwards', 'Fujita', 'Gupta', 'Hernandez', 'Iyer', 'Johnson', 'Kowalski', 'Lee', 'Mensah', 'Nakamura', 'Okafor', 'Park', 'Reyes', 'Singh']
const MAJORS = ['Economics', 'Business Economics', 'Management Science', 'Data Science', 'Cognitive Science', 'Computer Science', 'Mathematics-Economics', 'Political Science']
const TERMS = ['Spring 2027', 'Spring 2028', 'Winter 2028', 'Spring 2029', 'Spring 2030']
const ANSWERS: Record<string, string[]> = {
  why_tbs: [
    'I met several members at the info night and was struck by how much they genuinely invest in each other. I want to be part of a community that pushes me professionally while also being people I would want to spend a Friday night with.',
    'I have been looking for an organization that balances professional development with real friendship. Every member I talked to described TBS as a family, and I want to find that at UCSD.',
    "Coming from a family without much business background, I don't have a network to lean on. TBS's alumni network and mentorship would open doors I wouldn't know how to find on my own.",
  ],
  contribution: [
    'I ran the finance committee for my high school\'s student government and love organizing events. I would bring energy, reliability, and a willingness to take on the unglamorous tasks that make events run smoothly.',
    'I am a strong writer and have built a small following doing design work on Instagram, so I could help with marketing and recruitment content.',
    'I bring a quantitative perspective from my coursework and a lot of curiosity. I am the person who asks the follow-up question in every info session.',
  ],
  goals: [
    'I want to break into management consulting. TBS would help me practice case interviews with people who have been through the process and connect with alumni at firms I am targeting.',
    'I am interested in product management at a tech company. The resume workshops and networking events would help me build the skills and connections to get there.',
    'Long-term I want to start my own company. In the short term I want internship experience in venture capital, and TBS members have been exactly where I want to go.',
  ],
}

export type DummyApplicant = ReturnType<typeof buildDummyApplicants>[number]

/** Applicants in submission order. `random` is reset so every call matches. */
export function buildDummyApplicants() {
  random = rng(42)
  return FIRST.map((first, i) => {
    const last = LAST[(i * 7) % LAST.length]
    const major = pick(MAJORS)
    return {
      /** Columns for the `applications` row (files are attached separately). */
      fields: {
        cycle: applyPage.cycle,
        email: `${first}.${last}`.toLowerCase() + DUMMY_EMAIL_DOMAIN,
        name: `${first} ${last}`,
        phone: random() < 0.8 ? `(858) 555-${String(1000 + i * 37).slice(-4)}` : null,
        year: 1 + Math.floor(random() * 3),
        major,
        grad_term: pick(TERMS),
        gpa: Math.round((2.6 + random() * 1.4) * 100) / 100,
        answers: Object.fromEntries(
          applyPage.prompts.map((p) => [p.id, pick(ANSWERS[p.id] ?? ['—'])]),
        ),
        // Spread submissions over recruitment week.
        created_at: new Date(Date.UTC(2026, 9, 1 + (i % 5), 16 + (i % 6), i * 3)).toISOString(),
      },
      /** Every seventh is left without a headshot, to show the initials fallback. */
      hasPhoto: i % 7 !== 3,
      photo: () => silhouettePng((i * 47) % 360),
    }
  })
}

export function dummyResume(app: { name: string; email: string; major: string; grad_term: string }) {
  return resumePdf([
    app.name,
    app.email,
    `UC San Diego, ${app.major}, ${app.grad_term}`,
    'Experience: Placeholder internship, Placeholder club role',
    'Skills: Excel, PowerPoint, SQL',
  ])
}

/**
 * Each applicant gets a "strength" that skews the votes. Admins don't vote.
 * The dev member votes on about half, so "Not voted" has something in it.
 */
export function buildDummyVotes(
  applicationIds: string[],
  members: { id: string; slug: string; is_admin: boolean }[],
) {
  const votes: { application_id: string; member_id: string; vote: 'yes' | 'no' | 'abstain' }[] = []
  for (const applicationId of applicationIds) {
    const strength = random()
    for (const member of members.filter((m) => !m.is_admin)) {
      const turnout = member.slug === 'dev-member' ? 0.5 : 0.85
      if (random() > turnout) continue
      const r = random()
      const vote = r < 0.1 ? 'abstain' : r < 0.1 + 0.9 * strength ? 'yes' : 'no'
      votes.push({ application_id: applicationId, member_id: member.id, vote })
    }
  }
  return votes
}
