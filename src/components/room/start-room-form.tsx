'use client'

import { useState } from 'react'

import { startRoom } from '@/app/portal/room/actions'

import { ActionError, useRoomAction } from './use-action'

export function StartRoomForm({ defaultName }: { defaultName: string }) {
  const [name, setName] = useState(defaultName)
  const { run, pending, error } = useRoomAction()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        run(() => startRoom(name))
      }}
      className="mx-auto mt-10 max-w-md rounded-lg border border-sand-dark bg-white p-6"
    >
      <h2 className="text-xl font-bold">Start a review room</h2>
      <p className="mt-1 text-sm text-navy-900/65">
        Members can ask to join once it’s open. You choose who gets in, which applicant is on
        screen, and when voting opens.
      </p>
      <label className="mt-5 block">
        <span className="block text-sm font-semibold">Room name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          className="mt-1.5 block w-full rounded-md border border-sand-dark px-3 py-2 focus:border-gold-500 focus:ring-2 focus:ring-gold-300 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-md bg-navy-900 px-4 py-2.5 font-semibold text-parchment hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? 'Starting…' : 'Start room'}
      </button>
      <ActionError error={error} />
    </form>
  )
}
