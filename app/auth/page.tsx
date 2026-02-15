import { AuthForm } from "@/features/auth/components/AuthForm"

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Trading History
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Registra y analiza tus operaciones
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
