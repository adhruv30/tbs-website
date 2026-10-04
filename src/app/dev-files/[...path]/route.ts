import { notFound } from 'next/navigation'

import { isMockBackend } from '@/lib/backend-mode'
import { getCurrentMember } from '@/lib/dal'
import { readMockFile } from '@/lib/mock/store'

const TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  pdf: 'application/pdf',
}

/** Serves headshots and resumes from the mock backend, to members only. */
export async function GET(_request: Request, { params }: RouteContext<'/dev-files/[...path]'>) {
  if (!isMockBackend() || !(await getCurrentMember())) notFound()

  const { path } = await params
  const file = readMockFile(path.join('/'))
  const type = TYPES[path.at(-1)?.split('.').pop() ?? '']
  if (!file || !type) notFound()

  return new Response(new Uint8Array(file), {
    headers: { 'Content-Type': type, 'Cache-Control': 'private, no-store' },
  })
}
