import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-bold">This page doesn't exist</h1>
      <p className="mt-3 text-slate">The link may be old, or the address may have a typo.</p>
      <ButtonLink to="/" className="mt-8">Go to the home page</ButtonLink>
    </div>
  )
}
