/**
 * All site copy lives here. Swap the placeholder strings for real copy —
 * every page reads from this file, so nothing else needs to change.
 */

export type NavLink = {
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
}

export type Value = {
  title: string
  body: string
}

export const site = {
  name: 'Triton Business Society',
  shortName: 'TBS',
  initials: 'TBS',
  tagline: 'The business organization of UC San Diego.',
  description:
    'Triton Business Society is a pre-professional business org at UC San Diego building the next generation of principled, ambitious leaders.',
  url: 'https://tritonbusinesssociety.org',
  email: 'tritonbusinesssociety@gmail.com',
  location: 'Rady School of Management, UC San Diego',
} as const

export const navLinks: NavLink[] = [
  {
    label: 'Members',
    href: '/members',
    children: [
      { label: 'Active Members', href: '/members' },
      { label: 'Executive Committee', href: '/executive-committee' },
    ],
  },
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

export const hero = {
  title: 'Triton Business Society',
  primaryCta: { label: 'Members', href: '/members' },
  secondaryCta: { label: 'Recruitment', href: '/rush' },
}

export const rushPage = {
  heading: "Fall '26 Rush",
  description: 'Recruitment FAQs for Triton Business Society, fall quarter 2026.',
  /** Shown only while `public/rush/` is empty. */
  emptyNote: 'Flyers coming soon.',
  faq: {
    heading: "Recruitment FAQ's.",
    items: [
      {
        question: 'Why should I join Triton Business Society?',
        answer:
          'As an independent, student-run business organization at UC San Diego, Triton Business Society boasts an admirable alumni network and hosts a variety of social and professional events. Our members can attest to the impact Triton Business Society has had on their college experiences, whether it be professional development or making life-long friendships. We truly believe you can find a community in Triton Business Society, and we are here to help you grow!',
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
    'Founded at the University of California, San Diego, Triton Business Society (TBS) is a professional organization with a commitment to providing professional development and education for business-minded students on campus. Our 40+ active members have worked everywhere from local start-ups to tech giants. With an alumni network spanning across top companies and career paths across many industries, TBS helps our members get to where they want to go.',
    'While TBS offers opportunities for professional growth, we pride ourselves on the close community we have established. We seek to balance professionalism and social bonding throughout our organization. With members from a diverse array of backgrounds and experiences, we have been able to form life-long friendships while pursuing our professional aspirations together. More than a club, we are a community. We welcome you to learn more about us at our upcoming Recruitment Week events. Hope to see you there!',
  ],
  stats: [
    { value: '40+', label: 'Active members' },
    { value: '400+', label: 'Alumni network' },
    { value: '38', label: 'Firms placed into' },
    { value: '20+', label: 'Years on campus' },
  ],
}

export const letter = {
  heading: 'From Our President.',
  /**
   * TODO: replace `placeholder` with the president's letter — swap it for a
   * `paragraphs: string[]` field and render those in place of the placeholder.
   */
  placeholder:
    'This letter still needs to be written. Add it in src/data/site.ts under `letter`.',
  signoff: 'Best,',
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
