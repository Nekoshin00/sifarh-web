import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSupabaseClient } from "@/utils/supabase"

type Product = {
  id: string
  name: string
  amount_cents: number
  currency: string
}

export const Route = createFileRoute("/shopping/")({
  component: RouteComponent,
})

function RouteComponent() {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [productError, setProductError] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadProduct() {
      try {
        const { data, error } = await getSupabaseClient()
          .from("products")
          .select("id, name, amount_cents, currency")
          .eq("slug", "sifarh")
          .eq("active", true)
          .maybeSingle()

        if (error) throw error
        if (!data) {
          throw new Error("El producto SIFARH no está disponible.")
        }

        if (isMounted) setProduct(data)
      } catch (error) {
        if (isMounted) {
          setProductError(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el producto."
          )
        }
      } finally {
        if (isMounted) setIsLoadingProduct(false)
      }
    }

    void loadProduct()
    return () => {
      isMounted = false
    }
  }, [])

  const isFree = product?.amount_cents === 0
  const formattedPrice = product
    ? isFree
      ? "Gratis"
      : new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: product.currency,
        }).format(product.amount_cents / 100)
    : null

  async function handleClaim() {
    setClaimError(null)
    setIsClaiming(true)

    try {
      const supabase = getSupabaseClient()
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        window.location.href = "/login"
        return
      }

      const { error } = await supabase.rpc("claim_free_purchase", {
        p_product_slug: "sifarh",
      })
      if (error) throw error

      window.location.href = "/downloads"
    } catch (error) {
      setClaimError(
        error instanceof Error ? error.message : "No se pudo completar."
      )
      setIsClaiming(false)
    }
  }

  return (
    <main className="overflow-hidden bg-[#f8faf9] font-sans text-slate-900">
      <section className="relative px-6 pt-20 pb-20 sm:pt-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-120 w-120 -translate-x-1/2 rounded-full bg-teal-100/70 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-teal-700">
              <span className="size-2 rounded-full bg-teal-500" />
              SIFARH PARA SU FARMACIA
            </p>
            <h1 className="mt-7 text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
              Controle su inventario con{" "}
              <span className="text-teal-600">más claridad.</span>
            </h1>
            <p className="mt-6 max-w-xl leading-7 text-slate-600">
              Administre medicamentos, existencias e información de su farmacia
              hospitalaria desde un solo lugar.
            </p>
            <ul className="mt-8 space-y-4 text-sm font-medium text-slate-700">
              {[
                "Inventario centralizado y fácil de consultar",
                "Herramientas para apoyar la gestión diaria",
                "Acceso al programa y a su licencia desde su cuenta",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="size-5 text-teal-600" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Card className="rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-20px_rgba(15,23,42,0.22)] ring-0">
            <CardHeader>
              <p className="text-xs font-bold tracking-[0.18em] text-teal-600 uppercase">
                Licencia SIFARH
              </p>
              <CardTitle className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {product?.name ?? "Acceso al programa"}
              </CardTitle>
              <CardDescription className="leading-6 text-slate-600">
                Su compra y los datos de activación estarán disponibles en su
                cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {isLoadingProduct ? (
                <p className="text-center text-sm text-slate-600" role="status">
                  Cargando precio...
                </p>
              ) : productError ? (
                <p className="text-sm text-destructive" role="alert">
                  {productError}
                </p>
              ) : (
                <>
                  <p className="text-4xl font-semibold tracking-tight text-slate-900">
                    {formattedPrice}
                  </p>
                  <Button
                    type="button"
                    disabled={!isFree || isClaiming}
                    onClick={handleClaim}
                    className="w-full rounded-xl bg-slate-900"
                  >
                    {!isFree
                      ? "Compras en línea próximamente"
                      : isClaiming
                        ? "Procesando..."
                        : "Obtener gratis"}
                  </Button>
                  {claimError && (
                    <p className="text-sm text-destructive" role="alert">
                      {claimError}
                    </p>
                  )}
                  <p className="text-center text-xs leading-5 text-slate-500">
                    {isFree
                      ? "Por ahora SIFARH es gratuito: no se realiza ningún cobro y recibirá su clave de activación en su cuenta."
                      : "El pago en línea aún no está habilitado."}
                  </p>
                </>
              )}
              <a
                href="/downloads"
                className="block text-center text-sm font-medium text-teal-700 transition-colors hover:text-teal-900"
              >
                Ir a mis descargas
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
