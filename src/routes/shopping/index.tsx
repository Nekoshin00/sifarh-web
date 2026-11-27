import { createFileRoute } from "@tanstack/react-router"
import { ShoppingPage } from "@/components/shopping/shopping-page"

export const Route = createFileRoute("/shopping/")({
  component: ShoppingPage,
})
