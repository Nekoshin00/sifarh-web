import { defineConfig, loadEnv } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "")

  if (command === "serve") {
    for (const key of [
      "SUPABASE_URL",
      "SUPABASE_SECRET_KEY",
      "PIXELPAY_SANDBOX_USER_ID",
    ]) {
      if (env[key]) process.env[key] = env[key]
    }
  }

  return {
    server: { host: "127.0.0.1" },
    define: {
      "import.meta.env.SUPABASE_URL": JSON.stringify(env.SUPABASE_URL),
      "import.meta.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        env.SUPABASE_PUBLISHABLE_KEY
      ),
    },
    resolve: { tsconfigPaths: true },
    plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  }
})

export default config
