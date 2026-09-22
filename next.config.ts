import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 only allows qualities listed here (default: [75]).
    // 70 is used for the hero backdrop, which sits behind a heavy scrim.
    qualities: [70, 75],
  },

  /*
   * Legacy paths from the previous site. Deliberately carry no `has: [{ type:
   * 'host' }]` condition -- without one a redirect matches every domain the app
   * is served from, so these hold on the apex, on www and on the Vercel
   * preview URLs alike.
   *
   * `permanent: true` is a 308, not a 301: it preserves the request method.
   * Browsers and search engines cache it indefinitely, so a source path here is
   * effectively spent -- reusing `/about-1` for a real page later would not
   * reach anyone who had already followed the redirect once.
   */
  async redirects() {
    return [
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/about-1', destination: '/#about', permanent: true },
      { source: '/active-members', destination: '/members', permanent: true },
    ]
  },
}

export default nextConfig
