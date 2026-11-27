import { useState } from "react"

import type {
  LicenseMetadata,
  Purchase,
} from "@/components/downloads/purchase-history"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/utils/supabase"

export function LicenseKeys({
  licenses,
  purchases,
}: {
  licenses: LicenseMetadata[]
  purchases: Purchase[]
}) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <h2 className="font-semibold text-slate-900">Claves de activación</h2>
      {licenses.length ? (
        <ul className="space-y-3">
          {licenses.map((license) => {
            const purchase = purchases.find(
              (item) => item.id === license.purchase_id
            )
            return (
              <LicenseKey
                key={license.id}
                license={license}
                canReveal={
                  license.status === "active" && purchase?.status === "paid"
                }
              />
            )
          })}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-slate-600">
          Aún no tienes claves de activación.
        </p>
      )}
    </section>
  )
}

function LicenseKey({
  license,
  canReveal,
}: {
  license: LicenseMetadata
  canReveal: boolean
}) {
  const [key, setKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function revealKey() {
    setErrorMessage(null)
    setIsLoading(true)
    try {
      const { data, error } = await getSupabaseClient().rpc("get_license_key", {
        p_purchase_id: license.purchase_id,
      })
      if (error) throw error
      if (!data) {
        throw new Error("La clave ya no está disponible.")
      }
      setKey(data)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo obtener la clave."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <li className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-sm text-slate-600">
        Clave terminada en{" "}
        <span className="font-medium text-slate-900">{license.key_last4}</span>
        {" · "}
        {license.status !== "active"
          ? "Licencia revocada"
          : canReveal
            ? "Licencia activa"
            : "Compra no pagada"}
      </p>
      <p className="text-xs text-slate-500">
        Creada el {new Date(license.created_at).toLocaleDateString("es-MX")}
      </p>
      {key && canReveal && (
        <p className="rounded-lg border border-slate-200 p-3 text-center font-mono text-sm font-semibold tracking-wider break-all text-slate-900 select-all">
          {key}
        </p>
      )}
      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
      {canReveal && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLoading}
          aria-label={`${key ? "Ocultar" : "Mostrar"} clave terminada en ${license.key_last4}`}
          onClick={() => {
            if (key) {
              setKey(null)
            } else {
              void revealKey()
            }
          }}
        >
          {isLoading
            ? "Cargando clave..."
            : key
              ? "Ocultar clave"
              : "Mostrar clave completa"}
        </Button>
      )}
    </li>
  )
}
