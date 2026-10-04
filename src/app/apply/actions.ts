'use server'

import { applyPage } from '@/data/site'
import {
  applicationSchema,
  PHOTO_TYPES,
  type ApplicationField,
  type ApplyState,
  type ApplyValues,
} from '@/lib/applications'
import { isMockBackend } from '@/lib/backend-mode'
import { readMockDb, writeMockDb, writeMockFile } from '@/lib/mock/store'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'applications'
const UNIQUE_VIOLATION = '23505'

export async function submitApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const str = (key: string) => {
    const value = formData.get(key)
    return typeof value === 'string' ? value : ''
  }

  const values: ApplyValues = Object.fromEntries(
    ['name', 'email', 'phone', 'year', 'major', 'grad_term', 'gpa']
      .concat(applyPage.prompts.map((p) => `answer_${p.id}`))
      .map((key) => [key, str(key)]),
  )
  const fail = (
    message: string,
    errors: Partial<Record<ApplicationField, string>> = {},
  ): ApplyState => ({ status: 'error', message, errors, values })

  const parsed = applicationSchema.safeParse({
    name: values.name,
    email: values.email,
    phone: values.phone,
    year: values.year,
    major: values.major,
    grad_term: values.grad_term,
    gpa: values.gpa,
    answers: Object.fromEntries(
      applyPage.prompts.map((p) => [p.id, values[`answer_${p.id}`]]),
    ),
    photo: formData.get('photo'),
    resume: formData.get('resume'),
  })

  if (!parsed.success) {
    const errors: Partial<Record<ApplicationField, string>> = {}
    for (const issue of parsed.error.issues) {
      const [head, sub] = issue.path
      const key = (
        head === 'answers' ? `answer_${String(sub)}` : String(head)
      ) as ApplicationField
      errors[key] ??= issue.message
    }
    return fail('Please fix the highlighted fields.', errors)
  }

  const { photo, resume, ...fields } = parsed.data
  const photoExt = PHOTO_TYPES[photo.type as keyof typeof PHOTO_TYPES]

  if (isMockBackend()) {
    const db = readMockDb()
    if (db.applications.some((a) => a.cycle === applyPage.cycle && a.email === fields.email)) {
      return fail(applyPage.duplicate, { email: applyPage.duplicate })
    }
    const id = crypto.randomUUID()
    const photoPath = `${id}/photo.${photoExt}`
    const resumePath = `${id}/resume.pdf`
    writeMockFile(photoPath, Buffer.from(await photo.arrayBuffer()))
    writeMockFile(resumePath, Buffer.from(await resume.arrayBuffer()))
    db.applications.push({
      ...fields,
      id,
      cycle: applyPage.cycle,
      photo_path: photoPath,
      resume_path: resumePath,
      created_at: new Date().toISOString(),
    })
    writeMockDb(db)
    return { status: 'success' }
  }

  const supabase = createAdminClient()

  // Friendly early exit; the unique index below is the real guarantee.
  const { count } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('cycle', applyPage.cycle)
    .eq('email', fields.email)
  if (count) return fail(applyPage.duplicate, { email: applyPage.duplicate })

  const { data: row, error: insertError } = await supabase
    .from('applications')
    .insert({ ...fields, cycle: applyPage.cycle })
    .select('id')
    .single()

  if (insertError?.code === UNIQUE_VIOLATION) {
    return fail(applyPage.duplicate, { email: applyPage.duplicate })
  }
  if (insertError || !row) {
    console.error('application insert failed', insertError)
    return fail('Something went wrong saving your application. Please try again.')
  }

  const photoPath = `${row.id}/photo.${photoExt}`
  const resumePath = `${row.id}/resume.pdf`
  const storage = supabase.storage.from(BUCKET)

  const [photoUpload, resumeUpload] = await Promise.all([
    storage.upload(photoPath, photo, { contentType: photo.type }),
    storage.upload(resumePath, resume, { contentType: 'application/pdf' }),
  ])

  const { error: updateError } =
    photoUpload.error || resumeUpload.error
      ? { error: photoUpload.error ?? resumeUpload.error }
      : await supabase
          .from('applications')
          .update({ photo_path: photoPath, resume_path: resumePath })
          .eq('id', row.id)

  if (updateError) {
    // Roll back so the email isn't burned by a half-saved application.
    console.error('application upload failed', updateError)
    await storage.remove([photoPath, resumePath])
    await supabase.from('applications').delete().eq('id', row.id)
    return fail('We couldn’t upload your files. Please try again.')
  }

  return { status: 'success' }
}
