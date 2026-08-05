import Link from 'next/link';
import { requestPasswordReset } from '@/app/actions/auth';

// Notice we made the component async and typed searchParams as a Promise
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  // Await the searchParams before accessing properties
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3EFE7] p-4">
      <div className="w-full max-w-md space-y-8 rounded-[32px] bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        <div className="text-center">
          <h2 className="text-[28px] font-bold tracking-tight text-gray-900">
            Reset Password
          </h2>
          <p className="mt-3 text-sm text-gray-800">
            Enter your email address to receive a reset link
          </p>
        </div>

        {/* Display Success or Error Messages using resolved params */}
        {resolvedSearchParams?.message && (
          <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800 border border-green-100">
            {resolvedSearchParams.message}
          </div>
        )}
        {resolvedSearchParams?.error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-100">
            {resolvedSearchParams.error}
          </div>
        )}

        {/* Bind the Next.js Server Action to the form */}
        <form action={requestPasswordReset} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="sr-only">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-2xl border border-gray-100 bg-[#FCFAF8] px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-[#CBA358] focus:outline-none focus:ring-1 focus:ring-[#CBA358] sm:text-sm transition-all"
              placeholder="Email Address"
            />
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#CBA358] px-4 py-3.5 text-sm font-medium text-white hover:bg-[#b5904d] focus:outline-none focus:ring-2 focus:ring-[#CBA358] focus:ring-offset-2 transition-colors"
            >
              Send Reset Link &rarr;
            </button>
          </div>
        </form>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-[#CBA358] hover:text-[#b5904d] transition-colors">
            Log In
          </Link>
        </div>
        
      </div>
    </div>
  );
}