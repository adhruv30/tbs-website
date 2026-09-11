/**
 * All site copy lives here. Swap the placeholder strings for real copy —
 * every page reads from this file, so nothing else needs to change.
 */

type NavLink = {
  label: string
  href: string
  /** Rendered as a hover/focus dropdown in the desktop nav. */
  children?: { label: string; href: string }[]
}

export type Social = {
  label: string
  href: string
  /** Maps to an icon in `src/components/social-icons.tsx`. */
  icon: 'instagram' | 'linkedin' | 'email'
  /**
   * What the contact stack prints next to the icon: the handle with its `@`
   * for the social accounts, the plain address for email. The nav renders
   * these as bare icons and ignores it.
   */
  handle: string
}

export type PrivacySection = {
  heading: string
  body: string
  /** Bulleted under `body`. */
  items?: string[]
  /** Prose after the list. */
  footnote?: string
}

export type Value = {
  title: string
  body: string
}

export const site = {
  name: 'Triton Business Society',
  shortName: 'TBS',
  tagline: 'The Largest Pre-Professional Business Organization at UC San Diego',
  description:
    'Triton Business Society is a pre-professional business organization at UC San Diego building the next generation of principled, ambitious leaders.',
  url: 'https://tbsatucsd.com',
  email: 'tritonbusinesssociety@gmail.com',
  location: 'Rady School of Management, UC San Diego',
} as const

/**
 * The card image a page falls back to: a 1200x630 crop of the hero group
 * photo, JPEG rather than AVIF because the crawlers that render these cards
 * still don't decode AVIF.
 */
export const defaultOgImage = {
  url: '/og/home.jpg',
  width: 1200,
  height: 630,
  alt: `${site.name} members at UC San Diego`,
}

/**
 * A page's own `openGraph`, built whole.
 *
 * Declaring `openGraph` on a page REPLACES the root layout's rather than
 * merging into it, so a page that sets just a title and description silently
 * drops the card image and demotes its Twitter card to `summary`. Going
 * through here keeps the image attached.
 *
 * The root's title `template` is not applied to `openGraph.title` either, so
 * the site suffix is added by hand to make the card read like the browser tab.
 */
export function pageOpenGraph(heading: string, description: string) {
  return {
    title: `${heading} · ${site.name}`,
    description,
    images: [defaultOgImage],
  }
}

export const navLinks: NavLink[] = [
  {
    label: 'Members',
    href: '/members',
    children: [
      { label: 'Active Members', href: '/members' },
      { label: 'Executive Committee', href: '/executive-committee' },
    ],
  },
  { label: 'Recruitment', href: '/recruitment' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
]

export const socials: Social[] = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/tritonbusinesssociety/',
    icon: 'instagram',
    handle: '@tritonbusinesssociety',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/tritonbusinesssociety',
    icon: 'linkedin',
    handle: '@tritonbusinesssociety',
  },
  {
    label: 'Email',
    href: `mailto:${site.email}`,
    icon: 'email',
    handle: site.email,
  },
]

export const hero = {
  title: 'Triton Business Society',
  primaryCta: { label: 'Members', href: '/members' },
  secondaryCta: { label: 'Recruitment', href: '/recruitment' },
}

export const recruitmentPage = {
  heading: "Fall '26 Recruitment",
  description:
    'Recruitment week information and FAQs for Triton Business Society, fall quarter 2026.',
  /** Shown only while `public/recruitment/` is empty. */
  emptyNote: 'Flyers coming soon.',
  faq: {
    heading: 'Recruitment FAQs',
    items: [
      {
        question: 'Why should I join Triton Business Society?',
        answer:
          'As an independent, student-run pre-professional business organization at UC San Diego, Triton Business Society boasts an admirable alumni network and hosts a variety of social and professional events. Our members can attest to the impact Triton Business Society has had on their college experiences, whether it be professional development or making life-long friendships. We truly believe you can find a community in Triton Business Society, and we are here to help you grow!',
      },
      {
        question: 'How do I join Triton Business Society?',
        answer:
          'TBS hosts a recruitment week every Fall and Winter Quarter. We post more information regarding recruitment events on our Instagram account @tritonbusinesssociety. We hope to see you there!',
      },
      {
        question:
          'Is it hard to join Triton Business Society? How selective is the process?',
        answer:
          'We are open to all majors, and to anyone who has an interest in business! Our recruitment process is comparable to other business orgs on campus.',
      },
      {
        question: 'Are there any requirements to join Triton Business Society?',
        answer:
          'You need to have at least a 2.5 GPA and a minimum of 2 quarters left after joining until graduation, to be eligible to join.',
      },
      {
        question: 'What advice do you have for Recruitment Week?',
        answer:
          "Be yourself! As much as you may be trying to get to know us, we are trying to get to know you! Make sure to talk to us during our networking time at the beginning and end of our events. These times are a great way to get to know the members more personally, so be sure to ask questions! If you have no prior business-related experience - don't worry! One of our core values is growth, so we are looking for members with all kinds of backgrounds and experiences. Come say hi!",
      },
      {
        question: 'How many new members do you accept?',
        answer:
          'We do not have a set number of members we are looking for! The amount of new members we take changes every quarter, so we encourage you to attend our recruitment events.',
      },
      {
        question: 'What is the time commitment like?',
        answer: 'The time commitment is like another 4 unit class.',
      },
    ],
    more: {
      heading: 'More Questions?',
      /** Rendered around the email and Instagram links. */
      before: 'Feel free to contact us at ',
      between: ' or DM us on Instagram ',
      instagram: 'tritonbusinesssociety',
    },
  },
}

export const values = {
  heading: 'Our Values',
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
  ] satisfies Value[],
}

export const about = {
  eyebrow: 'About',
  heading: 'What is Triton Business Society?',
  paragraphs: [
    'Founded at the University of California, San Diego, Triton Business Society (TBS) is a pre-professional business organization with a commitment to providing professional development and education for business-minded students on campus. Our 40+ active members have worked everywhere from local start-ups to tech giants. With an alumni network spanning across top companies and career paths across many industries, TBS helps our members get to where they want to go.',
    'While TBS offers opportunities for professional growth, we pride ourselves on the close community we have established. We seek to balance professionalism and social bonding throughout our organization. With members from a diverse array of backgrounds and experiences, we have been able to form life-long friendships while pursuing our professional aspirations together. More than a club, we are a community. We welcome you to learn more about us at our upcoming Recruitment Week events. Hope to see you there!',
  ],
}

export const letter = {
  heading: 'From Our President',
  /** Slug of the member who signs the letter and appears in the portrait. */
  authorSlug: 'darshana-zala',
  paragraphs: [
    'Hello!',
    'I joined Triton Business Society in my freshman fall quarter, and looking back, it was truly the best decision I could have made. Before coming to college, I had only a vague idea of what I wanted to do. I knew I was drawn to business and finance, but I had no clear direction on what to do next. Joining TBS changed that completely. It gave me not only direction and clarity, but also a support system, a group of people who were just as motivated as I was, many of whom have now become lifelong friends. TBS taught me how to not only break into a competitive field like finance but thrive in it, and more importantly, how to use the tools I’ve gained to give back and help others.',
    'What truly sets TBS apart is our tight-knit community and strong alumni network. Over more than two decades, our alumni have built a legacy of mentorship, guidance, and opportunity. We are incredibly proud to have an alumni base that’s always ready to help you get wherever it is you want to go.',
    'Through business seminars, networking events, and resume workshops, I’ve learned alongside some of the most driven and supportive people on campus. Today, that same culture of growth, collaboration, and ambition continues to thrive. Our members go on to secure internships at Fortune 500 companies, launch their own startups, and make meaningful impacts both on campus and across countless industries. No matter what path you’re interested in, whether it’s consulting, accounting, marketing, or computer and data science, Triton Business Society provides the foundation, resources, and community to help turn those goals into reality.',
    'For me, it’s been the most impactful community I’ve found at UC San Diego, and I’m proud to be representing us.',
  ],
  signoff: 'Best,',
}

export const contact = {
  eyebrow: 'Contact',
  heading: 'Come find us',
  body: 'Our Fall 2026 Recruitment is right around the corner. Feel free to email us or DM us with any questions!',
  /** The contact stack, top to bottom. Keyed to `socials` by icon. */
  order: ['email', 'instagram', 'linkedin'],
} as const

export type Company = {
  name: string
  /**
   * Path under `public/logos/`. SVG preferred so it stays crisp when tinted.
   * `null` when no usable mark exists — the grid renders the name instead.
   */
  logo: string | null
}

/**
 * Companies members have interned or worked at. Drop an SVG in `public/logos/`
 * and add a row here \u2014 the grid sizes itself.
 */
export const companies: Company[] = [
  // Big tech
  { name: 'Apple', logo: '/logos/apple.svg' },
  { name: 'Google', logo: '/logos/google.svg' },
  { name: 'Microsoft', logo: '/logos/microsoft.svg' },
  { name: 'Amazon', logo: '/logos/amazon.svg' },
  { name: 'Tesla', logo: '/logos/tesla.svg' },
  // Banking & investment
  { name: 'J.P. Morgan', logo: '/logos/jpmorgan.svg' },
  { name: 'Goldman Sachs', logo: '/logos/goldman-sachs.svg' },
  { name: 'Morgan Stanley', logo: '/logos/morgan-stanley.svg' },
  { name: 'Wells Fargo', logo: '/logos/wells-fargo.svg' },
  { name: 'Fidelity Investments', logo: '/logos/fidelity.svg' },
  // Accounting & advisory
  { name: 'Deloitte', logo: '/logos/deloitte.svg' },
  { name: 'PwC', logo: '/logos/pwc.svg' },
  { name: 'EY', logo: '/logos/ey.svg' },
  { name: 'KPMG', logo: '/logos/kpmg.svg' },
  { name: 'BDO', logo: '/logos/bdo.svg' },
  // Payments & enterprise
  { name: 'Visa', logo: '/logos/visa.svg' },
  { name: 'Salesforce', logo: '/logos/salesforce.svg' },
  { name: 'Adobe', logo: '/logos/adobe.svg' },
  { name: 'Intel', logo: '/logos/intel.svg' },
  { name: 'Qualcomm', logo: '/logos/qualcomm.svg' },
  // Software & SaaS
  { name: 'Cisco', logo: '/logos/cisco.svg' },
  { name: 'Intuit', logo: '/logos/intuit.svg' },
  { name: 'ServiceNow', logo: '/logos/servicenow.svg' },
  { name: 'Atlassian', logo: '/logos/atlassian.svg' },
  { name: 'DocuSign', logo: '/logos/docusign.svg' },
  // Consumer, health & telecom
  { name: 'Johnson & Johnson', logo: '/logos/johnson-and-johnson.svg' },
  { name: 'AT&T', logo: '/logos/att.svg' },
  { name: 'Sony', logo: '/logos/sony.svg' },
  { name: 'PepsiCo', logo: '/logos/pepsi.svg' },
  { name: 'Target', logo: '/logos/target.svg' },
  // Media, sports & other
  { name: 'Paramount', logo: '/logos/paramount.svg' },
  { name: 'NFL', logo: '/logos/nfl.svg' },
  { name: 'Epic Games', logo: '/logos/epic-games.svg' },
  { name: 'NBCUniversal', logo: '/logos/nbcuniversal.svg' },
  // No free SVG exists: Wikimedia Commons has no Northwestern Mutual logo
  // (every other mark here came from there), and the only vector on en.wikipedia
  // is non-free fair use. Renders as the name until a licensed mark turns up.
  { name: 'Northwestern Mutual', logo: null },
]

export const whereWereAt = {
  heading: "Where We're At",
}

export const membersPage = {
  heading: 'Active Members',
}

export const execPage = {
  heading: 'Executive Committee',
}

const privacySections: PrivacySection[] = [
  {
    heading: 'What we collect',
    body: 'Everything about a member on this site was submitted by that member. When you join, we ask for:',
    items: [
      'Your name',
      'Your email address',
      'Your year and major',
      'Your hometown',
      'Your career interests',
      'Your hobbies',
      'A headshot',
    ],
    /** Rendered after the list. */
    footnote:
      'We do not ask for anything beyond these fields, and we do not sell member information or share it with anyone outside the organization.',
  },
  {
    heading: 'How we use it',
    body: 'Your information does two things. It fills out your profile in our public member directory, and it identifies you in the members-only portal we use to run the organization.',
  },
  {
    heading: 'Who can see it',
    body: 'The member directory is public: anyone can visit it, and search engines can index it. Everything you submit for your profile should be treated as published on the open web. The member portal is restricted to current members who have signed in.',
  },
  {
    heading: 'Signing in',
    body: 'We use Google sign-in to authenticate members. Google tells us your name and email address so we can match you to your member profile — we never see or store your Google password. Signing in is only needed for the member portal; the rest of the site is open to everyone.',
  },
]

export const privacyPage = {
  eyebrow: 'Privacy',
  heading: 'Privacy Policy',
  description:
    'What member information Triton Business Society collects, how it is used, and how to have it removed.',
  updated: 'Last updated September 10, 2026',
  intro:
    'Triton Business Society is a student organization at UC San Diego. This page explains what member information we hold, where it shows up, and how to have it changed or taken down.',
  sections: privacySections,
  /** Rendered last, wrapping the email address in a `mailto:` link. */
  removal: {
    heading: 'Changing or removing your information',
    before: 'Email us at ',
    after:
      ' to correct a detail, drop a field you would rather not have public, or take your profile down entirely. Tell us what you would like changed and we will take care of it as soon as we can — you do not have to give a reason.',
  },
}
