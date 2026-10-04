import type { Metadata } from 'next'

import { ApplyForm } from '@/components/apply-form'
import { applyPage, pageOpenGraph } from '@/data/site'

export const metadata: Metadata = {
  title: applyPage.heading,
  description: applyPage.description,
  openGraph: pageOpenGraph(applyPage.heading, applyPage.description),
}

export default function ApplyPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10 sm:py-20">
      <h1 className="text-4xl font-bold tracking-tight">{applyPage.heading}</h1>
      <p className="mt-4 leading-relaxed text-navy-900/75">{applyPage.intro}</p>
      <div className="mt-10">
        <ApplyForm />
      </div>
    </section>
  )
}
