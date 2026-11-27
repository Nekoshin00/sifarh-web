import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateSandboxCard } from "@/utils/pixelpay-card"
import { simulatePixelPayPurchase } from "@/utils/pixelpay"
import { getSupabaseClient } from "@/utils/supabase"

export function SandboxCheckout() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(false)
  const [sandboxError, setSandboxError] = useState<string | null>(null)
  const [showSandboxForm, setShowSandboxForm] = useState(false)
  const authVersion = useRef(0)

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined
    try {
      const { data } = getSupabaseClient().auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") {
          authVersion.current += 1
          setShowSandboxForm(false)
        }
      })
      subscription = data.subscription
    } catch (error) {
      setSandboxError(
        error instanceof Error
          ? error.message
          : "No se pudo verificar la sesión."
      )
    }
    return () => subscription?.unsubscribe()
  }, [])

  async function openSandboxForm() {
    setSandboxError(null)
    setIsCheckingSession(true)
    const version = authVersion.current
    try {
      const { data, error } = await getSupabaseClient().auth.getSession()
      if (error) throw error
      if (!data.session || version !== authVersion.current) {
        window.location.href = "/login?next=shopping"
        return
      }
      setShowSandboxForm(true)
    } catch (error) {
      setSandboxError(
        error instanceof Error
          ? error.message
          : "No se pudo verificar la sesión."
      )
    } finally {
      setIsCheckingSession(false)
    }
  }

  async function handleSandboxPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSandboxError(null)
    setIsSimulating(true)
    try {
      const formData = new FormData(event.currentTarget)
      const card = validateSandboxCard({
        number: formData.get("number"),
        cardholder: formData.get("cardholder"),
        expireMonth: formData.get("expireMonth"),
        expireYear: formData.get("expireYear"),
        cvv: formData.get("cvv"),
      })
      const { data, error } = await getSupabaseClient().auth.getSession()
      if (error) throw error
      if (!data.session) {
        window.location.href = "/login?next=shopping"
        return
      }
      await simulatePixelPayPurchase({
        data: { accessToken: data.session.access_token, card },
      })
      window.location.href = "/downloads"
    } catch (error) {
      setSandboxError(
        error instanceof Error
          ? error.message
          : "No se pudo realizar la prueba."
      )
      setIsSimulating(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-900">
        PixelPay sandbox · solo desarrollo
      </p>
      <p className="text-xs leading-5 text-amber-900">
        Simula un pago de 1 USD sin cobro real. No ingreses datos de una tarjeta
        real. Una prueba aprobada creará una compra y una licencia en la base de
        datos configurada.
      </p>
      {showSandboxForm ? (
        <form
          onSubmit={handleSandboxPurchase}
          className="space-y-4"
          autoComplete="off"
        >
          <p className="text-xs leading-5 text-amber-900">
            Datos de prueba: 4111 1111 1111 1111 · Sandbox Test · 12/30 · CVV
            999.
          </p>
          <div className="space-y-2">
            <Label htmlFor="sandbox-cardholder">Nombre del titular</Label>
            <Input id="sandbox-cardholder" name="cardholder" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sandbox-number">Número de tarjeta</Label>
            <Input
              id="sandbox-number"
              name="number"
              inputMode="numeric"
              maxLength={19}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sandbox-month">Mes</Label>
              <Input
                id="sandbox-month"
                name="expireMonth"
                inputMode="numeric"
                maxLength={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sandbox-year">Año</Label>
              <Input
                id="sandbox-year"
                name="expireYear"
                inputMode="numeric"
                maxLength={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sandbox-cvv">CVV</Label>
              <Input
                id="sandbox-cvv"
                name="cvv"
                type="password"
                inputMode="numeric"
                maxLength={3}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={isSimulating} className="w-full">
            {isSimulating
              ? "Procesando prueba..."
              : "Confirmar pago de prueba · 1 USD"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSimulating}
            onClick={() => {
              setShowSandboxForm(false)
              setSandboxError(null)
            }}
            className="w-full"
          >
            Cancelar
          </Button>
        </form>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={isCheckingSession}
          onClick={openSandboxForm}
          className="w-full"
        >
          {isCheckingSession ? "Verificando sesión..." : "Ir al pago de prueba"}
        </Button>
      )}
      {sandboxError && (
        <p className="text-sm text-destructive" role="alert">
          {sandboxError}
        </p>
      )}
    </div>
  )
}
