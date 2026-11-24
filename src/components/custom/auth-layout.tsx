import type { ReactNode } from "react"

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f8faf9] px-6 py-12 font-sans text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-120 w-120 -translate-x-1/2 rounded-full bg-teal-100/70 blur-3xl"
      />
      <div className="relative w-full max-w-md">
        <a
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-sm font-bold tracking-wide text-slate-900"
        >
          <span className="size-2 rounded-full bg-teal-500" />
          SIFARH
        </a>
        {children}
        <a
          href="/"
          className="mt-6 block text-center text-sm font-medium text-teal-700 transition-colors hover:text-teal-900"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  )
}
