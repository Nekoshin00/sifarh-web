import { createFileRoute } from "@tanstack/react-router"
import { AuthLayout } from "@/components/custom/auth-layout"
import { LoginForm } from "@/components/login-form"

export const Route = createFileRoute("/login/")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: search.next === "shopping" ? "shopping" : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { next } = Route.useSearch()
  return (
    <AuthLayout>
      <LoginForm returnToShopping={next === "shopping"} />
    </AuthLayout>
  )
}
