/**
 * All site copy lives here. Swap the placeholder strings for real copy —
 * every page reads from this file, so nothing else needs to change.
 */

export type NavLink = { label: string; href: string }

export type Social = {
  label: string
  href: string
  /** Maps to an icon in `src/components/social-icons.tsx`. */
  icon: 'instagram' | 'linkedin' | 'email'
}

export type Pillar = {
  title: string
  summary: string
  body: string
}

export const site = {
  name: 'Triton Business Society',
  shortName: 'TBS',
  initials: 'TBS',
  tagline: 'The business fraternity of UC San Diego.',
  description:
    'Triton Business Society is a professional business fraternity at UC San Diego building the next generation of principled, ambitious leaders.',
  url: 'https://tritonbusinesssociety.org',
  email: 'hello@tritonbusinesssociety.org',
  location: 'Rady School of Management, UC San Diego',
} as const

export const navLinks: NavLink[] = [
  { label: 'Members', href: '/members' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
]

export const socials: Social[] = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/tritonbusinesssociety',
    icon: 'instagram',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/triton-business-society',
    icon: 'linkedin',
  },
  { label: 'Email', href: 'mailto:hello@tritonbusinesssociety.org', icon: 'email' },
]

/**
 * Background slideshow for the hero. Drop new files in `public/hero/` and list
 * them here — the first image is preloaded, so keep the strongest one on top.
 */
export const heroImages = [
  { src: '/hero/chapter-retreat.jpg', alt: 'Chapter members at the fall retreat' },
  { src: '/hero/case-night.jpg', alt: 'Members presenting at case night' },
  { src: '/hero/founders-dinner.jpg', alt: 'The chapter at the annual founders dinner' },
  { src: '/hero/campus-quad.jpg', alt: 'Library Walk on the UC San Diego campus' },
] as const

export const hero = {
  eyebrow: 'Established 2014 · UC San Diego',
  title: 'Triton Business Society',
  subtitle:
    'A professional business fraternity built on preparation, character, and the people who push you further than you would go alone.',
  primaryCta: { label: 'Meet the members', href: '/members' },
  secondaryCta: { label: 'Rush with us', href: '/#contact' },
  /** Seconds each slide holds before crossfading to the next. */
  slideDurationSeconds: 6,
}

export const pillars = {
  eyebrow: 'What we stand for',
  heading: 'Four Pillars',
  intro:
    'Every chapter decision — who we recruit, what we build, how we show up — traces back to these four commitments.',
  items: [
    {
      title: 'Professionalism',
      summary: 'Recruiting-ready from day one.',
      body: 'Mock interviews, résumé clinics, and case workshops run every quarter, led by members who just finished the process themselves.',
    },
    {
      title: 'Brotherhood',
      summary: 'A class you never rush alone.',
      body: 'Pledge families, big-little pairings, and a chapter that shows up for each other long past the last final of senior year.',
    },
    {
      title: 'Integrity',
      summary: 'The standard holds when nobody is watching.',
      body: 'We hold each other to the way business ought to be done — candidly, ethically, and with credit given where it is earned.',
    },
    {
      title: 'Impact',
      summary: 'Work that outlasts the quarter.',
      body: 'Pro-bono consulting for San Diego nonprofits, a student-run fund, and an alumni network that keeps opening doors.',
    },
  ] satisfies Pillar[],
}

export const about = {
  eyebrow: 'About',
  heading: 'Built by students, for the students who come next.',
  paragraphs: [
    'Triton Business Society started in 2014 with nine students, a borrowed classroom in Peterson Hall, and a shared frustration: the path into finance, consulting, and product was legible to some people and invisible to everyone else. The chapter exists to make it legible to everyone.',
    'Today we run a quarterly professional development curriculum, a pro-bono consulting practice serving San Diego nonprofits, and a mentorship program that pairs every new member with an upperclassman and an alum working in the field they are chasing.',
    'We recruit twice a year, from every major and every college. What we look for is not a finished résumé — it is the willingness to prepare, to be coached, and to turn around and coach the next class.',
  ],
  stats: [
    { value: '120+', label: 'Active members' },
    { value: '400+', label: 'Alumni network' },
    { value: '38', label: 'Firms placed into' },
    { value: '2014', label: 'Founded' },
  ],
}

export const letter = {
  eyebrow: 'Letter from the President',
  heading: 'You are closer than you think.',
  paragraphs: [
    'When I walked into my first TBS info session, I had no internship, no idea what a technical interview was, and a résumé that fit comfortably in half a page. What I had was a room full of people willing to tell me, plainly, what I did not know yet.',
    'That is still the most valuable thing this chapter offers. Not the speaker events or the treks, though those matter — the honesty. Someone who went through recruiting six months before you, sitting down and walking you through exactly where it went wrong for them.',
    'If you are reading this from the other side of that gap, I want you to know how quickly it closes when you stop trying to cross it alone. Come to an info session. Ask us anything. We will tell you the truth.',
  ],
  signoff: 'With Triton pride,',
  author: {
    name: 'Amara Okonkwo',
    role: 'President, 2025–26',
    photo: '/members/amara-okonkwo.jpg',
  },
}

export const contact = {
  eyebrow: 'Contact',
  heading: 'Come find us.',
  body: 'Rush events run in weeks 1 and 2 of fall and winter quarter. If you missed them, reach out anyway — we answer every email.',
  items: [
    { label: 'Email', value: site.email, href: `mailto:${site.email}` },
    { label: 'Where', value: site.location },
    { label: 'Office hours', value: 'Thursdays, 4–6pm · Rady Courtyard' },
  ],
}

export const membersPage = {
  eyebrow: 'Our people',
  heading: 'Members',
  intro:
    'The chapter is the product. Here is everyone currently running it — the executive board and the active class.',
  tabs: [
    { id: 'exec', label: 'Exec' },
    { id: 'active', label: 'Active' },
  ],
} as const
