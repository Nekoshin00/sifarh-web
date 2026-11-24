import { createFileRoute } from "@tanstack/react-router"
import { AuthLayout } from "@/components/custom/auth-layout"
import { SignupForm } from "@/components/signup-form"

export const Route = createFileRoute("/signup/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  )
}
