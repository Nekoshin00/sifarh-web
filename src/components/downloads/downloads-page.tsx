import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

import { AuthLayout } from "@/components/custom/auth-layout"
import { DownloadAccess } from "@/components/downloads/download-access"
import { LicenseKeys } from "@/components/downloads/license-keys"
import {
  PurchaseHistory,
  type LicenseMetadata,
  type Purchase,
} from "@/components/downloads/purchase-history"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSupabaseClient } from "@/utils/supabase"

const releases = {
  windows: "SIFARH-windows-portable.zip",
  linux: "SIFARH-linux-portable.zip",
} as const

type Platform = keyof typeof releases

export function DownloadsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [licenses, setLicenses] = useState<LicenseMetadata[]>([])
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false)
  const [accountUserId, setAccountUserId] = useState<string | null>(null)
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
      setAccountUserId(null)
      return
    }

    const userId = user.id
    let isMounted = true
    setPurchases([])
    setLicenses([])
    setAccountUserId(null)
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
        if (isMounted) {
          setAccountUserId(userId)
          setIsLoadingPurchases(false)
        }
      }
    }

    void loadAccountPurchases()
    return () => {
      isMounted = false
    }
  }, [user])

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
            Accede al programa SIFARH y a tus claves de activación.
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
              {isLoadingPurchases || accountUserId !== user.id ? (
                <p className="text-center text-sm text-slate-600" role="status">
                  Cargando tus compras...
                </p>
              ) : (
                <>
                  <PurchaseHistory purchases={purchases} licenses={licenses} />
                  <DownloadAccess
                    activeLicense={activeLicense}
                    downloadingPlatform={downloadingPlatform}
                    onDownload={handleDownload}
                  />
                  <LicenseKeys
                    key={user.id}
                    licenses={licenses}
                    purchases={purchases}
                  />
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
