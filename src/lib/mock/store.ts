import 'server-only'

import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { DEFAULT_SETTINGS, type Application, type PortalSettings, type Vote } from '@/lib/applications'
import {
  buildDummyApplicants,
  buildDummyVotes,
  DUMMY_MEMBERS,
  dummyResume,
} from '@/lib/dummy-data'

/**
 * The mock backend's database: one JSON file plus uploaded files, under
 * `.dev-data/` (gitignored). Seeded with the dummy data the first time it's
 * read; delete the folder to start over. Read and written synchronously on
 * every call -- slow and racy in theory, simple and fine for one developer.
 */
const ROOT = path.join(process.cwd(), '.dev-data')
const DB_FILE = path.join(ROOT, 'db.json')
const FILES = path.join(ROOT, 'files')

export type MockMember = {
  id: string
  slug: string
  name: string
  email: string
  is_admin: boolean
}

export type MockVote = {
  application_id: string
  member_id: string
  vote: Vote
  updated_at: string
  room_id?: string | null
}

export type MockRoom = {
  id: string
  name: string
  status: 'live' | 'ended'
  current_application_id: string | null
  voting: 'idle' | 'open' | 'locked'
  created_by: string
  created_at: string
  ended_at: string | null
}

export type MockParticipant = {
  room_id: string
  member_id: string
  status: 'pending' | 'approved' | 'denied'
  requested_at: string
  decided_at: string | null
}

/** Bump when the shape or seed rules change; older files are reseeded. */
const VERSION = 3

export type MockDb = {
  version: number
  members: MockMember[]
  applications: Application[]
  votes: MockVote[]
  settings: PortalSettings
  rooms: MockRoom[]
  participants: MockParticipant[]
}

export function readMockFile(relativePath: string): Buffer | null {
  const full = path.join(FILES, relativePath)
  // Paths come from the URL; never step outside the files folder.
  if (!full.startsWith(FILES + path.sep)) return null
  try {
    return fs.readFileSync(full)
  } catch {
    return null
  }
}

export function writeMockFile(relativePath: string, data: Buffer) {
  const full = path.join(FILES, relativePath)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, data)
}

function seed(): MockDb {
  const members = DUMMY_MEMBERS.map((m) => ({ ...m, id: randomUUID() }))
  const applications: Application[] = buildDummyApplicants().map(
    ({ fields, hasPhoto, photo }) => {
      const id = randomUUID()
      const photoPath = hasPhoto ? `${id}/photo.png` : null
      const resumePath = `${id}/resume.pdf`
      if (photoPath) writeMockFile(photoPath, photo())
      writeMockFile(resumePath, dummyResume(fields))
      return { ...fields, id, photo_path: photoPath, resume_path: resumePath }
    },
  )
  const now = new Date().toISOString()
  const votes = buildDummyVotes(applications.map((a) => a.id), members).map((v) => ({
    ...v,
    updated_at: now,
  }))
  return {
    version: VERSION,
    members,
    applications,
    votes,
    settings: DEFAULT_SETTINGS,
    rooms: [],
    participants: [],
  }
}

export function readMockDb(): MockDb {
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as MockDb
    if (db.version === VERSION) return db
  } catch {
    // Missing or unreadable: seed below.
  }
  fs.rmSync(ROOT, { recursive: true, force: true })
  const db = seed()
  writeMockDb(db)
  return db
}

export function writeMockDb(db: MockDb) {
  fs.mkdirSync(ROOT, { recursive: true })
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

/** Where pages load a mock file from; served by `src/app/dev-files`. */
export const mockFileUrl = (relativePath: string | null) =>
  relativePath ? `/dev-files/${relativePath}` : null
