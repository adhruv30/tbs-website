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
  email: 'tritonbusinesssociety@gmail.com',
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
    href: 'https://www.instagram.com/tritonbusinesssociety/',
    icon: 'instagram',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/tritonbusinesssociety',
    icon: 'linkedin',
  },
  { label: 'Email', href: `mailto:${site.email}`, icon: 'email' },
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
  eyebrow: 'UC San Diego',
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
    'Every chapter decision \u2014 who we recruit, what we build, how we show up \u2014 traces back to these four commitments.',
  items: [
    {
      title: 'Professionalism',
      body: 'We are dedicated to upholding a high standard of conduct, integrity, and ethics in all that we do.',
    },
    {
      title: 'Community',
      body: 'We are more than just a business club. We create life-long friendships and memories that will last forever.',
    },
    {
      title: 'Leadership',
      body: 'We believe in taking initiative and becoming the next generation of leaders across a variety of industries.',
    },
    {
      title: 'Growth',
      body: 'We are committed to fostering personal and professional growth for ourselves and others, always striving to be the best we can be.',
    },
  ] satisfies Pillar[],
}

export const about = {
  eyebrow: 'About',
  heading: 'Built by students, for the students who come next.',
  paragraphs: [
    'Triton Business Society started with a handful of students, a borrowed classroom in Peterson Hall, and a shared frustration: the path into finance, consulting, and product was legible to some people and invisible to everyone else. The chapter exists to make it legible to everyone.',
    'Today we run a quarterly professional development curriculum, a pro-bono consulting practice serving San Diego nonprofits, and a mentorship program that pairs every new member with an upperclassman and an alum working in the field they are chasing.',
    'We recruit twice a year, from every major and every college. What we look for is not a finished résumé — it is the willingness to prepare, to be coached, and to turn around and coach the next class.',
  ],
  stats: [
    { value: '120+', label: 'Active members' },
    { value: '400+', label: 'Alumni network' },
    { value: '38', label: 'Firms placed into' },
    { value: '20+', label: 'Years on campus' },
  ],
}

export const letter = {
  eyebrow: 'Letter from the President',
  // Display headline, lifted from the letter itself \u2014 edit freely.
  heading: 'The best decision I could have made.',
  greeting: 'Hello!',
  paragraphs: [
    'I joined Triton Business Society in my freshman fall quarter, and looking back, it was truly the best decision I could have made. Before coming to college, I had only a vague idea of what I wanted to do. I knew I was drawn to business and finance, but I had no clear direction on what to do next. Joining TBS changed that completely. It gave me not only direction and clarity, but also a support system, a group of people who were just as motivated as I was, many of whom have now become lifelong friends. TBS taught me how to not only break into a competitive field like finance but thrive in it, and more importantly, how to use the tools I\u2019ve gained to give back and help others.',
    'What truly sets TBS apart is our tight-knit community and strong alumni network. Over more than two decades, our alumni have built a legacy of mentorship, guidance, and opportunity. We are incredibly proud to have an alumni base that\u2019s always ready to help you get wherever it is you want to go. Through business seminars, networking events, and resume workshops, I\u2019ve learned alongside some of the most driven and supportive people on campus.',
    'Today, that same culture of growth, collaboration, and ambition continues to thrive. Our members go on to secure internships at Fortune 500 companies, launch their own startups, and make meaningful impacts both on campus and across countless industries. No matter what path you\u2019re interested in, whether it\u2019s consulting, accounting, marketing, or computer and data science, Triton Business Society provides the foundation, resources, and community to help turn those goals into reality. For me, it\u2019s been the most impactful community I\u2019ve found at UC San Diego, and I\u2019m proud to be representing us.',
  ],
  signoff: 'With Triton pride,',
  author: {
    name: 'Darshana',
    role: 'President',
    photo: '/members/darshana.jpg',
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

export type Company = {
  name: string
  /** Path under `public/logos/`. SVG preferred so it stays crisp when tinted. */
  logo: string
}

/**
 * Companies members have interned or worked at. Drop an SVG in `public/logos/`
 * and add a row here \u2014 the grid sizes itself.
 */
export const companies: Company[] = [
  { name: 'Deloitte', logo: '/logos/deloitte.svg' },
  { name: 'EY', logo: '/logos/ey.svg' },
  { name: 'KPMG', logo: '/logos/kpmg.svg' },
  { name: 'PwC', logo: '/logos/pwc.svg' },
  { name: 'Goldman Sachs', logo: '/logos/goldman-sachs.svg' },
  { name: 'J.P. Morgan', logo: '/logos/jpmorgan.svg' },
  { name: 'Amazon', logo: '/logos/amazon.svg' },
  { name: 'Google', logo: '/logos/google.svg' },
  { name: 'Microsoft', logo: '/logos/microsoft.svg' },
  { name: 'Qualcomm', logo: '/logos/qualcomm.svg' },
]

export const whereWereAt = {
  eyebrow: 'Our track record',
  heading: "Where We're At",
  intro:
    'Members have interned and gone full time at firms across finance, consulting, tech, and beyond.',
}

export const memories = {
  eyebrow: 'Life in the chapter',
  heading: 'Our Memories',
  intro:
    'Retreats, socials, case nights, and everything in between.',
  /** Shown when `public/memories/` has no images in it yet. */
  emptyNote:
    'No photos yet \u2014 drop JPGs or PNGs into public/memories/ and they will appear here automatically.',
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
