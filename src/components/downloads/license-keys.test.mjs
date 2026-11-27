import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import { fileURLToPath } from "node:url"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import react from "@vitejs/plugin-react"
import { createServer } from "vite"

const root = fileURLToPath(new URL("../../../", import.meta.url))
let server
let LicenseKeys

before(async () => {
  server = await createServer({
    root,
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    plugins: [react()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("../../", import.meta.url)) },
    },
    server: { middlewareMode: true, hmr: false },
  })
  ;({ LicenseKeys } = await server.ssrLoadModule(
    "/src/components/downloads/license-keys.tsx"
  ))
})

after(async () => {
  await server?.close()
})

function license(id, status = "active") {
  return {
    id,
    purchase_id: id,
    key_last4: id,
    status,
    created_at: "2026-01-01T00:00:00Z",
  }
}

function purchase(id, status = "paid") {
  return { id, status }
}

test("lists multiple keys with individual reveal buttons", () => {
  const html = renderToStaticMarkup(
    createElement(LicenseKeys, {
      licenses: [license("1111"), license("2222")],
      purchases: [purchase("1111"), purchase("2222")],
    })
  )

  assert.match(html, /Mostrar clave terminada en 1111/)
  assert.match(html, /Mostrar clave terminada en 2222/)
  assert.equal((html.match(/Mostrar clave completa/g) ?? []).length, 2)
})

test("does not offer keys for revoked or unpaid licenses", () => {
  const html = renderToStaticMarkup(
    createElement(LicenseKeys, {
      licenses: [license("3333", "revoked"), license("4444")],
      purchases: [purchase("3333"), purchase("4444", "pending")],
    })
  )

  assert.match(html, /Licencia revocada/)
  assert.match(html, /Compra no pagada/)
  assert.doesNotMatch(html, /Mostrar clave completa/)
})

test("shows an empty state when no licenses exist", () => {
  const html = renderToStaticMarkup(
    createElement(LicenseKeys, { licenses: [], purchases: [] })
  )

  assert.match(html, /Aún no tienes claves de activación/)
})
