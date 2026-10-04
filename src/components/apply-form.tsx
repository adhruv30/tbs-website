'use client'

import { useActionState, type ReactNode } from 'react'

import { submitApplication } from '@/app/apply/actions'
import { applyPage } from '@/data/site'
import { YEAR_LABELS, type ApplicationField, type ApplyState } from '@/lib/applications'


const inputClass =
  'mt-1.5 block w-full rounded-md border border-sand-dark bg-white px-3 py-2 text-navy-900 shadow-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-300 focus:outline-none aria-invalid:border-red-500'

function Field({
  name,
  label,
  hint,
  error,
  children,
}: {
  name: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-semibold">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-sm text-navy-900/65">{hint}</p>}
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

export function ApplyForm() {
  const [state, action, pending] = useActionState<ApplyState, FormData>(
    submitApplication,
    { status: 'idle' },
  )

  if (state.status === 'success') {
    return (
      <div role="status" className="rounded-lg border border-gold-400 bg-white px-6 py-10 text-center">
        <h2 className="text-2xl font-bold">{applyPage.success.heading}</h2>
        <p className="mt-3 leading-relaxed text-navy-900/75">{applyPage.success.body}</p>
      </div>
    )
  }

  const errors = state.status === 'error' ? state.errors : {}
  const values = state.status === 'error' ? state.values : {}

  /** Props shared by every text input: name, prefill and error wiring. */
  const bind = (name: ApplicationField) => ({
    id: name,
    name,
    defaultValue: values[name] ?? '',
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  return (
    <form action={action} className="space-y-6" noValidate>
      {state.status === 'error' && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="name" label="Full name" error={errors.name}>
          <input {...bind('name')} autoComplete="name" required className={inputClass} />
        </Field>
        <Field name="email" label="Email" error={errors.email}>
          <input {...bind('email')} type="email" autoComplete="email" required className={inputClass} />
        </Field>
        <Field name="phone" label="Phone (optional)" error={errors.phone}>
          <input {...bind('phone')} type="tel" autoComplete="tel" className={inputClass} />
        </Field>
        <Field name="year" label="Year" error={errors.year}>
          <select {...bind('year')} required className={inputClass}>
            <option value="">Select…</option>
            {Object.entries(YEAR_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field name="major" label="Major" error={errors.major}>
          <input {...bind('major')} required className={inputClass} />
        </Field>
        <Field name="grad_term" label="Expected graduation" hint="e.g. Spring 2028" error={errors.grad_term}>
          <input {...bind('grad_term')} required className={inputClass} />
        </Field>
        <Field name="gpa" label="GPA" error={errors.gpa}>
          <input {...bind('gpa')} type="number" inputMode="decimal" step="0.01" min="0" max="4" required className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="photo" label="Headshot" hint={applyPage.photoHint} error={errors.photo}>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            aria-invalid={errors.photo ? true : undefined}
            className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-parchment"
          />
        </Field>
        <Field name="resume" label="Resume" hint={applyPage.resumeHint} error={errors.resume}>
          <input
            id="resume"
            name="resume"
            type="file"
            accept="application/pdf"
            required
            aria-invalid={errors.resume ? true : undefined}
            className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-parchment"
          />
        </Field>
      </div>
      {state.status === 'error' && (
        <p className="text-sm text-navy-900/65">Please re-attach your headshot and resume.</p>
      )}

      {applyPage.prompts.map((prompt) => {
        const name = `answer_${prompt.id}` as const
        return (
          <Field key={prompt.id} name={name} label={prompt.label} error={errors[name]}>
            <textarea {...bind(name)} rows={5} maxLength={prompt.maxLength} required className={inputClass} />
          </Field>
        )
      })}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-navy-900 px-6 py-3 font-semibold text-parchment transition-colors hover:bg-navy-800 disabled:opacity-60 sm:w-auto"
      >
        {pending ? 'Submitting…' : applyPage.submit}
      </button>
    </form>
  )
}
