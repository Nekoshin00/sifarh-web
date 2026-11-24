import { createFileRoute } from "@tanstack/react-router"
import { AuthLayout } from "@/components/custom/auth-layout"
import { LoginForm } from "@/components/login-form"

export const Route = createFileRoute("/login/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
