import { Button } from "@/components/ui/button"
import type { LicenseMetadata } from "@/components/downloads/purchase-history"

export function DownloadAccess({
  activeLicense,
  downloadingPlatform,
  onDownload,
}: {
  activeLicense: LicenseMetadata | undefined
  downloadingPlatform: "windows" | "linux" | null
  onDownload: (platform: "windows" | "linux") => void
}) {
  return (
    <>
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div>
          <h2 className="font-semibold text-slate-900">Programa SIFARH</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {activeLicense
              ? "Descarga la versión portable para tu sistema operativo (archivo .zip)."
              : "La descarga se habilita cuando tienes una compra con licencia activa."}
          </p>
        </div>
        <Button
          type="button"
          disabled={!activeLicense || downloadingPlatform !== null}
          className="w-full"
          onClick={() => onDownload("windows")}
        >
          {downloadingPlatform === "windows"
            ? "Preparando descarga..."
            : "Descargar para Windows"}
        </Button>
        <Button
          type="button"
          disabled={!activeLicense || downloadingPlatform !== null}
          className="w-full"
          onClick={() => onDownload("linux")}
        >
          {downloadingPlatform === "linux"
            ? "Preparando descarga..."
            : "Descargar para Linux"}
        </Button>
      </div>
      {!activeLicense && (
        <a
          href="/shopping"
          className="flex h-9 w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          Obtener SIFARH
        </a>
      )}
    </>
  )
}
