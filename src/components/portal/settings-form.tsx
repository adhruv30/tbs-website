'use client'

import { useActionState } from 'react'

import { saveSettings, type SettingsState } from '@/app/portal/actions'
import type { PortalSettings } from '@/lib/applications'

/**
 * Admin controls for the applications table. Saved portal-wide, so every
 * admin sees the same threshold and anonymity.
 */
export function SettingsForm({ settings }: { settings: PortalSettings }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, {
    saved: false,
  })

  return (
    <form
      action={action}
      className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-lg border border-sand-dark bg-white px-5 py-4"
    >
      <label className="block">
        <span className="block text-xs font-semibold tracking-wide text-navy-900/60 uppercase">
          Yes votes needed
        </span>
        <input
          name="voteThreshold"
          type="number"
          min={0}
          step={1}
          defaultValue={settings.voteThreshold}
          className="mt-1 w-24 rounded-md border border-sand-dark px-3 py-1.5 tabular-nums focus:border-gold-500 focus:ring-2 focus:ring-gold-300 focus:outline-none"
        />
      </label>

      <label className="flex cursor-pointer items-center gap-3 pb-1.5">
        <input
          name="anonymizeVotes"
          type="checkbox"
          defaultChecked={settings.anonymizeVotes}
          className="peer sr-only"
        />
        {/* A switch drawn from the checkbox's state. */}
        <span
          aria-hidden
          className="relative h-6 w-11 rounded-full bg-sand-dark transition-colors peer-checked:bg-navy-900 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-300 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
        />
        <span className="text-sm font-semibold">Anonymize votes</span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-parchment hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save'}
      </button>

      <p aria-live="polite" className="pb-2 text-sm">
        {state.error ? (
          <span className="text-red-700">{state.error}</span>
        ) : state.saved && !pending ? (
          <span className="text-emerald-700">Saved</span>
        ) : (
          <span className="text-navy-900/60">
            {settings.voteThreshold > 0
              ? `Applicants with ${settings.voteThreshold}+ yes votes meet the bar.`
              : 'Set a number of yes votes to mark who meets the bar.'}
          </span>
        )}
      </p>
    </form>
  )
}
