import { createServerFn } from "@tanstack/react-start"
import type { Database } from "@/types/database.types"
import { validateSandboxCard, type SandboxCard } from "@/utils/pixelpay-card"

export const simulatePixelPayPurchase = createServerFn({ method: "POST" })
  .validator((input: { accessToken: string; card: SandboxCard }) => {
    const value: unknown = input
    if (
      typeof value !== "object" ||
      value === null ||
      !("accessToken" in value) ||
      typeof value.accessToken !== "string" ||
      value.accessToken.length === 0 ||
      !("card" in value)
    ) {
      throw new Error("Debes iniciar sesión para realizar la prueba.")
    }
    return {
      accessToken: value.accessToken,
      card: validateSandboxCard(value.card),
    }
  })
  .handler(async ({ data }) => {
    if (!import.meta.env.DEV) {
      throw new Error("El sandbox solo está disponible en desarrollo.")
    }

    const url = process.env.SUPABASE_URL
    const secretKey = process.env.SUPABASE_SECRET_KEY
    const allowedUserId = process.env.PIXELPAY_SANDBOX_USER_ID
    if (!url || !secretKey || !allowedUserId) {
      throw new Error("El sandbox de PixelPay no está configurado.")
    }

    const [{ createClient }, { Models, Requests, Services }] =
      await Promise.all([
        import("@supabase/supabase-js"),
        import("@pixelpay/sdk-core"),
      ])
    const supabase = createClient<Database>(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: userData, error: authError } = await supabase.auth.getUser(
      data.accessToken
    )
    if (authError || userData.user.id !== allowedUserId) {
      throw new Error("Esta cuenta no está autorizada para usar el sandbox.")
    }

    const settings = new Models.Settings()
    settings.setupSandbox()
    const order = new Models.Order()
    order.id = crypto.randomUUID()
    order.currency = "USD"
    order.amount = 1
    order.customer_name = "Sandbox Test"
    order.customer_email = "jhondow@pixel.hn"

    const card = new Models.Card()
    card.number = data.card.number
    card.cardholder = data.card.cardholder
    card.expire_month = Number(data.card.expireMonth)
    card.expire_year = Number(data.card.expireYear)
    card.cvv2 = data.card.cvv

    const billing = new Models.Billing()
    billing.address = "Test"
    billing.country = "HN"
    billing.state = "HN-CR"
    billing.city = "San Pedro Sula"
    billing.phone = "99999999"

    const sale = new Requests.SaleTransaction()
    sale.setCard(card)
    sale.setBilling(billing)
    sale.setOrder(order)
    const response = await new Services.Transaction(settings).doSale(sale)
    const result: unknown = response.data
    if (!response.success) {
      throw new Error(
        response.message || "PixelPay no aprobó la transacción de prueba."
      )
    }
    if (
      typeof result !== "object" ||
      result === null ||
      !("response_approved" in result) ||
      result.response_approved !== true ||
      !("transaction_amount" in result) ||
      result.transaction_amount !== 1 ||
      !("transaction_approved_amount" in result) ||
      result.transaction_approved_amount !== 1 ||
      !("response_incomplete" in result) ||
      result.response_incomplete !== false ||
      !("payment_uuid" in result) ||
      typeof result.payment_uuid !== "string" ||
      !result.payment_uuid
    ) {
      throw new Error("PixelPay devolvió una respuesta de prueba inválida.")
    }

    const { data: purchaseId, error } = await supabase.rpc(
      "record_pixelpay_sandbox_purchase",
      {
        p_user_id: userData.user.id,
        p_payment_id: result.payment_uuid,
      }
    )
    if (error) {
      console.error("No se pudo registrar la compra de prueba:", error.message)
      throw new Error(
        "PixelPay aprobó la prueba, pero no se pudo registrar la compra."
      )
    }
    if (!purchaseId) {
      throw new Error("No se recibió el identificador de la compra de prueba.")
    }
    return { purchaseId }
  })
