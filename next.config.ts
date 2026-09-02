import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 only allows qualities listed here (default: [75]).
    // 70 is used for the hero slideshow, which sits behind a heavy scrim.
    qualities: [70, 75],
  },
}

export default nextConfig
