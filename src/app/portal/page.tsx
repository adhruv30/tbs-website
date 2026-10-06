import { portalCopy } from '@/data/site'
import { requireMember } from '@/lib/dal'

export default async function PortalHome() {
  const member = await requireMember()

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{portalCopy.home.heading}</h1>
      <p className="mt-3 leading-relaxed text-navy-900/75">
        Welcome, {member.name.split(' ')[0]}. {portalCopy.home.body}
      </p>
    </section>
  )
}
