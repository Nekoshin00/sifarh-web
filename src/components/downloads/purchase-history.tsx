export type Purchase = {
  id: string
  payment_provider: string
  status: string
  amount_cents: number
  currency: string
  created_at: string
}

export type LicenseMetadata = {
  id: string
  purchase_id: string
  key_last4: string
  status: string
  created_at: string
}

export function PurchaseHistory({
  purchases,
  licenses,
}: {
  purchases: Purchase[]
  licenses: LicenseMetadata[]
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-slate-900">Historial de compras</h2>
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
                  <p className="font-medium text-slate-900">SIFARH · {price}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {new Date(purchase.created_at).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <span
                  className={
                    purchase.payment_provider === "demo" ||
                    purchase.payment_provider === "pixelpay_sandbox"
                      ? "text-sm font-semibold text-amber-700"
                      : "text-sm text-slate-600"
                  }
                >
                  {purchase.payment_provider === "demo"
                    ? "DEMO · no es un cobro real"
                    : purchase.payment_provider === "pixelpay_sandbox"
                      ? "PRUEBA · no es un cobro real"
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
                  Licencia {license.status === "active" ? "activa" : "revocada"}{" "}
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
  )
}
