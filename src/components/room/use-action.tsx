'use client'

import { useState, useTransition } from 'react'

import type { RoomResult } from '@/app/portal/room/actions'

/** Runs a room action, tracking whether it's in flight and any error it returns. */
export function useRoomAction() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const run = (action: () => Promise<RoomResult>) =>
    startTransition(async () => {
      setError(null)
      const result = await action()
      if (result) setError(result.error)
    })

  return { run, pending, error }
}

export function ActionError({ error }: { error: string | null }) {
  if (!error) return null
  return (
    <p role="alert" className="mt-2 text-sm text-red-700">
      {error}
    </p>
  )
}
