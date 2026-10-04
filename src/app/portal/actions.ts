'use server'

// Votes are cast only in the live review room: see `./room/actions.ts`.

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isMockBackend } from '@/lib/backend-mode'
import { requireAdmin } from '@/lib/dal'
import { readMockDb, writeMockDb } from '@/lib/mock/store'
import { createClient } from '@/lib/supabase/server'

export type SettingsState = { saved: boolean; error?: string }

const settingsSchema = z.object({
  voteThreshold: z.coerce
    .number({ message: 'Enter a whole number.' })
    .int('Enter a whole number.')
    .min(0, 'The threshold can’t be negative.')
    .max(1000, 'That threshold is too high.'),
  anonymizeVotes: z.boolean(),
})

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const admin = await requireAdmin()

  const parsed = settingsSchema.safeParse({
    voteThreshold: formData.get('voteThreshold') || 0,
    anonymizeVotes: formData.get('anonymizeVotes') === 'on',
  })
  if (!parsed.success) {
    return { saved: false, error: parsed.error.issues[0]?.message ?? 'Invalid settings.' }
  }

  if (isMockBackend()) {
    const db = readMockDb()
    db.settings = parsed.data
    writeMockDb(db)
  } else {
    const supabase = await createClient()
    const { error } = await supabase
      .from('portal_settings')
      .update({
        vote_threshold: parsed.data.voteThreshold,
        anonymize_votes: parsed.data.anonymizeVotes,
        updated_at: new Date().toISOString(),
        updated_by: admin.id,
      })
      .eq('id', true)
    if (error) {
      console.error('settings update failed', error)
      return { saved: false, error: 'Settings weren’t saved. Please try again.' }
    }
  }

  revalidatePath('/portal', 'layout')
  return { saved: true }
}
