import { createFileRoute } from "@tanstack/react-router"
import { DownloadsPage } from "@/components/downloads/downloads-page"

export const Route = createFileRoute("/downloads/")({
  component: DownloadsPage,
})
