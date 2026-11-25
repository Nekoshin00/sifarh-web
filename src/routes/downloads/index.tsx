import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createFileRoute } from "@tanstack/react-router"

import { AuthLayout } from "@/components/custom/auth-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSupabaseClient } from "@/utils/supabase"

type Purchase = {
  id: string
  payment_provider: string
  status: string
  amount_cents: number
  currency: string
  created_at: string
}

type LicenseMetadata = {
  id: string
  purchase_id: string
  key_last4: string
  status: string
  created_at: string
}

const releases = {
  windows: "SIFARH-windows-portable.zip",
  linux: "SIFARH-linux-portable.zip",
} as const

type Platform = keyof typeof releases

export const Route = createFileRoute("/downloads/")({
  component: DownloadsPage,
})

function DownloadsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [licenses, setLicenses] = useState<LicenseMetadata[]>([])
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false)
  const [licenseKey, setLicenseKey] = useState<string | null>(null)
  const [downloadingPlatform, setDownloadingPlatform] =
    useState<Platform | null>(null)

  const activeLicense = licenses.find(
    (license) =>
      license.status === "active" &&
      purchases.some(
        (purchase) =>
          purchase.id === license.purchase_id && purchase.status === "paid"
      )
  )

  useEffect(() => {
    let isMounted = true
    let supabaseClient: ReturnType<typeof getSupabaseClient>

    try {
      supabaseClient = getSupabaseClient()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Supabase no está configurado."
      )
      setIsLoading(false)
      return
    }

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    })

    void supabaseClient.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) setErrorMessage(error.message)
        setUser(data.session?.user ?? null)
        setIsLoading(false)
      })
      .catch((error: unknown) => {
        if (!isMounted) return
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo verificar la sesión."
        )
        setIsLoading(false)
      })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setPurchases([])
      setLicenses([])
      return
    }

    let isMounted = true
    setIsLoadingPurchases(true)
    setErrorMessage(null)

    async function loadAccountPurchases() {
      try {
        const supabase = getSupabaseClient()
        const [purchaseResult, licenseResult] = await Promise.all([
          supabase
            .from("purchases")
            .select(
              "id, payment_provider, status, amount_cents, currency, created_at"
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("licenses")
            .select("id, purchase_id, key_last4, status, created_at")
            .order("created_at", { ascending: false }),
        ])

        if (purchaseResult.error) throw purchaseResult.error
        if (licenseResult.error) throw licenseResult.error

        if (isMounted) {
          setPurchases(purchaseResult.data)
          setLicenses(licenseResult.data)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar tus compras."
          )
        }
      } finally {
        if (isMounted) setIsLoadingPurchases(false)
      }
    }

    void loadAccountPurchases()
    return () => {
      isMounted = false
    }
  }, [user])

  async function handleRevealKey() {
    if (!activeLicense) return
    setErrorMessage(null)

    try {
      const { data, error } = await getSupabaseClient().rpc("get_license_key", {
        p_purchase_id: activeLicense.purchase_id,
      })
      if (error) throw error
      setLicenseKey(data)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo obtener la clave."
      )
    }
  }

  async function handleDownload(platform: Platform) {
    setErrorMessage(null)
    setDownloadingPlatform(platform)

    try {
      const { data, error } = await getSupabaseClient()
        .storage.from("sifarh-downloads")
        .createSignedUrl(releases[platform], 60, { download: true })
      if (error) throw error
      window.location.href = data.signedUrl
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la descarga."
      )
    } finally {
      setDownloadingPlatform(null)
    }
  }

  async function handleSignOut() {
    setErrorMessage(null)

    try {
      const { error } = await getSupabaseClient().auth.signOut()
      if (error) {
        setErrorMessage(error.message)
        return
      }
      setUser(null)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo cerrar sesión."
      )
    }
  }

  return (
    <AuthLayout>
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-20px_rgba(15,23,42,0.22)] ring-0">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
            Mis descargas
          </CardTitle>
          <CardDescription className="leading-6 text-slate-600">
            Accede al programa SIFARH y a tu clave de activación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <p className="text-center text-sm text-slate-600">
              Verificando tu cuenta...
            </p>
          ) : user ? (
            <>
              <p className="text-center text-sm text-slate-600">
                Sesión iniciada como{" "}
                <span className="font-medium text-slate-900">{user.email}</span>
              </p>
              {errorMessage && (
                <p className="text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              )}
              {isLoadingPurchases ? (
                <p className="text-center text-sm text-slate-600" role="status">
                  Cargando tus compras...
                </p>
              ) : (
                <>
                  <section className="space-y-3">
                    <h2 className="font-semibold text-slate-900">
                      Historial de compras
                    </h2>
                    {purchases.length ? (
                      purchases.map((purchase) => {
                        const license = licenses.find(
                          (item) => item.purchase_id === purchase.id
                        )
                        const price =
                          purchase.amount_cents === 0
                            ? "Gratis"
                            : new Intl.NumberFormat("es-MX", {
                                style: "currency",
                                currency: purchase.currency,
                              }).format(purchase.amount_cents / 100)

                        return (
                          <div
                            key={purchase.id}
                            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium text-slate-900">
                                  SIFARH · {price}
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                  {new Date(
                                    purchase.created_at
                                  ).toLocaleDateString("es-MX")}
                                </p>
                              </div>
                              <span
                                className={
                                  purchase.payment_provider === "demo"
                                    ? "text-sm font-semibold text-amber-700"
                                    : "text-sm text-slate-600"
                                }
                              >
                                {purchase.payment_provider === "demo"
                                  ? "DEMO · no es un cobro real"
                                  : purchase.status === "paid"
                                    ? "Pagada"
                                    : purchase.status === "pending"
                                      ? "Pendiente"
                                      : purchase.status === "refunded"
                                        ? "Reembolsada"
                                        : purchase.status === "cancelled"
                                          ? "Cancelada"
                                          : "Fallida"}
                              </span>
                            </div>
                            {license && (
                              <p className="mt-3 text-sm text-slate-600">
                                Licencia{" "}
                                {license.status === "active"
                                  ? "activa"
                                  : "revocada"}{" "}
                                · termina en{" "}
                                <span className="font-medium text-slate-900">
                                  {license.key_last4}
                                </span>
                              </p>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <p className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-6 text-slate-600">
                        Aún no hay compras asociadas a tu cuenta.
                      </p>
                    )}
                  </section>
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Programa SIFARH
                      </h2>
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
                      onClick={() => handleDownload("windows")}
                    >
                      {downloadingPlatform === "windows"
                        ? "Preparando descarga..."
                        : "Descargar para Windows"}
                    </Button>
                    <Button
                      type="button"
                      disabled={!activeLicense || downloadingPlatform !== null}
                      className="w-full"
                      onClick={() => handleDownload("linux")}
                    >
                      {downloadingPlatform === "linux"
                        ? "Preparando descarga..."
                        : "Descargar para Linux"}
                    </Button>
                  </div>
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <h2 className="font-semibold text-slate-900">
                      Clave de activación
                    </h2>
                    {licenseKey ? (
                      <p className="rounded-lg border border-slate-200 bg-white p-3 text-center font-mono text-sm font-semibold tracking-wider break-all text-slate-900 select-all">
                        {licenseKey}
                      </p>
                    ) : (
                      <p className="text-sm leading-6 text-slate-600">
                        {activeLicense
                          ? `Tu clave termina en ${activeLicense.key_last4}.`
                          : "Aún no tienes una clave de activación."}
                      </p>
                    )}
                    {activeLicense && !licenseKey && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleRevealKey}
                      >
                        Mostrar clave completa
                      </Button>
                    )}
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
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <p className="text-center text-sm leading-6 text-slate-600">
                Inicia sesión para consultar las compras asociadas a tu cuenta.
              </p>
              {errorMessage && (
                <p className="text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              )}
              <a
                href="/login"
                className="flex h-9 w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
              >
                Iniciar sesión
              </a>
              <p className="text-center text-sm text-slate-600">
                ¿Aún no tienes cuenta?{" "}
                <a
                  href="/signup"
                  className="font-medium text-teal-700 hover:text-teal-900"
                >
                  Regístrate
                </a>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
