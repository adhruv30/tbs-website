'use client'

import { useState } from 'react'

import { showApplicant } from '@/app/portal/room/actions'

import { ActionError, useRoomAction } from './use-action'

export type NavigatorRow = {
  id: string
  name: string
  major: string
  yes: number
  no: number
  total: number
}

/** The host's list of applicants: search, then put one on screen. */
export function ApplicantNavigator({
  roomId,
  rows,
  currentId,
  electorate,
}: {
  roomId: string
  rows: NavigatorRow[]
  currentId: string | null
  electorate: number
}) {
  const [query, setQuery] = useState('')
  const { run, pending, error } = useRoomAction()
  const q = query.trim().toLowerCase()
  const shown = q
    ? rows.filter((r) => r.name.toLowerCase().includes(q) || r.major.toLowerCase().includes(q))
    : rows

  return (
    <section className="flex min-h-0 flex-col rounded-lg border border-sand-dark bg-white">
      <div className="border-b border-sand p-3">
        <h2 className="font-bold">Applicants</h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or major"
          aria-label="Search applicants"
          className="mt-2 block w-full rounded-md border border-sand-dark px-3 py-1.5 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-300 focus:outline-none"
        />
        <ActionError error={error} />
      </div>
      <ul className="max-h-[32rem] divide-y divide-sand overflow-y-auto text-sm lg:max-h-[calc(100vh-16rem)]">
        {shown.map((r) => {
          const current = r.id === currentId
          return (
            <li key={r.id}>
              <button
                type="button"
                disabled={pending || current}
                onClick={() => run(() => showApplicant(roomId, r.id))}
                aria-current={current ? 'true' : undefined}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition ${
                  current ? 'bg-gold-300/40' : 'hover:bg-parchment disabled:opacity-60'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{r.name}</span>
                  <span className="block truncate text-xs text-navy-900/60">{r.major}</span>
                </span>
                <span className="shrink-0 text-right text-xs tabular-nums text-navy-900/70">
                  <span className="text-emerald-700">{r.yes}Y</span>{' '}
                  <span className="text-red-700">{r.no}N</span>
                  <span className="block text-navy-900/50">
                    {r.total}/{electorate}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
        {shown.length === 0 && <li className="px-3 py-6 text-center text-navy-900/60">No matches.</li>}
      </ul>
    </section>
  )
}
