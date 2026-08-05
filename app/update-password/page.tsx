import { updatePassword } from '@/app/actions/auth'; // We will build this action in Phase 4

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl border border-[#e8e6e1]">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Set New Password
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Please enter your new password below.
        </p>

        <form action={updatePassword} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 block w-full px-4 py-2 bg-[#fdfbf7] border border-[#e8e6e1] rounded-md focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#d4af37] hover:bg-[#b5952f] text-white font-medium rounded-md transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}