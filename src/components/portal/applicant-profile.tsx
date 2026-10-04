import { ApplicantPhoto } from '@/components/portal/applicant-photo'
import { applyPage } from '@/data/site'
import { YEAR_LABELS, type Application } from '@/lib/applications'

/** Everything an applicant submitted. Shared by the detail page and the review room's stage. */
export function ApplicantProfile({
  application: a,
  photoUrl,
  resumeUrl,
  headingLevel: Heading = 'h1',
}: {
  application: Application
  photoUrl: string | null
  resumeUrl: string | null
  headingLevel?: 'h1' | 'h2'
}) {
  const details: [string, string | null][] = [
    ['Email', a.email],
    ['Phone', a.phone],
    ['Year', a.year ? YEAR_LABELS[a.year] : null],
    ['Major', a.major],
    ['Expected graduation', a.grad_term],
    ['GPA', a.gpa === null ? null : Number(a.gpa).toFixed(2)],
    ['Submitted', new Date(a.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })],
  ]

  return (
    <article className="min-w-0">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ApplicantPhoto url={photoUrl} name={a.name} className="h-40 w-40 shrink-0 rounded-lg text-4xl" />
        <div>
          <Heading className="text-3xl font-bold tracking-tight">{a.name}</Heading>
          <p className="mt-1 text-navy-900/70">
            {[a.year ? YEAR_LABELS[a.year] : null, a.major].filter(Boolean).join(' · ')}
          </p>
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-parchment hover:bg-navy-800"
            >
              View resume (PDF)
            </a>
          )}
        </div>
      </header>

      <dl className="mt-8 grid gap-x-6 gap-y-4 rounded-lg border border-sand-dark bg-white p-5 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-semibold tracking-wide text-navy-900/60 uppercase">{label}</dt>
            <dd className="mt-0.5 break-words">{value ?? '—'}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 space-y-6">
        {applyPage.prompts.map((prompt) => (
          <section key={prompt.id}>
            <h3 className="font-bold">{prompt.label}</h3>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-navy-900/85">
              {a.answers[prompt.id] || '—'}
            </p>
          </section>
        ))}
      </div>
    </article>
  )
}
