import { createFileRoute } from "@tanstack/react-router"
import {
  ArrowDown,
  ArrowUpRight,
  Boxes,
  Check,
  ClipboardList,
  Sparkles,
} from "lucide-react"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <main className="overflow-hidden bg-[#f8faf9] font-sans text-slate-900">
      <section className="relative px-6 pb-16 pt-20 sm:pt-28 lg:pb-24 lg:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-120 w-120 -translate-x-1/2 rounded-full bg-teal-100/70 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-teal-700">
              <span className="size-2 rounded-full bg-teal-500" />
              INVENTARIO FARMACÉUTICO HOSPITALARIO
            </p>
            <h1 className="mt-7 text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Una mejor forma de cuidar{" "}
              <span className="text-teal-600">su inventario.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              SIFARH reúne la información de su farmacia hospitalaria en un
              solo lugar, para que su equipo gestione el inventario de forma
              eficiente y segura.
            </p>
            <a
              href="#conocer-sifarh"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600"
            >
              Conozca SIFARH
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
            <div className="absolute -inset-4 rounded-[2rem] bg-teal-100/60 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.22)] sm:rounded-2xl sm:p-3">
              <div className="flex items-center gap-2 px-2 pb-3 pt-1">
                <span className="size-2 rounded-full bg-slate-300" />
                <span className="size-2 rounded-full bg-slate-300" />
                <span className="size-2 rounded-full bg-slate-300" />
                <span className="ml-3 text-xs font-medium text-slate-400">
                  Vista general del sistema
                </span>
              </div>
              <img
                src="/views/dashboard.png"
                alt="Panel de reportes de SIFARH con el resumen del inventario"
                className="w-full rounded-lg border border-slate-100"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="conocer-sifarh" className="scroll-mt-20 bg-white px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
              Bienvenido a SIFARH
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Más claridad para su trabajo diario.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Un sistema centralizado y fácil de usar que ayuda a mantener un
              control preciso del inventario y a reducir pérdidas innecesarias.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <ClipboardList className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">Todo en un lugar</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Consulte la información que necesita desde un sistema centralizado.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Boxes className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">Control de inventario</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Mantenga una visión clara de sus medicamentos y existencias.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Sparkles className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">Herramientas inteligentes</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Aproveche la inteligencia artificial para apoyar su gestión.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
              Una experiencia sencilla
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Diseñado para acompañar a su equipo.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Gestione su inventario con herramientas intuitivas, en un espacio
              confiable y accesible para su trabajo diario.
            </p>
            <ul className="mt-8 space-y-4 text-sm font-medium text-slate-700">
              <li className="flex items-center gap-3">
                <Check className="size-5 text-teal-600" aria-hidden="true" />
                Información centralizada
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-teal-600" aria-hidden="true" />
                Gestión eficiente y segura
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-teal-600" aria-hidden="true" />
                Una interfaz fácil de usar
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/50">
            <img
              src="/views/login.png"
              alt="Pantalla de inicio de sesión de SIFARH"
              loading="lazy"
              className="w-full rounded-xl"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl space-y-24 sm:space-y-32">
          <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
                01 / Inventario
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                El control que necesita, a simple vista.
              </h2>
              <p className="mt-5 leading-7 text-slate-600">
                Controle su inventario de manera eficiente y segura, con la
                información organizada para facilitar su consulta.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-xl shadow-slate-200/50 sm:p-3">
              <img
                src="/views/inventario.png"
                alt="Vista de inventario de medicamentos en SIFARH"
                loading="lazy"
                className="w-full rounded-lg"
              />
            </div>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div className="order-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-xl shadow-slate-200/50 sm:p-3 lg:order-1">
              <img
                src="/views/ia.png"
                alt="Herramienta de inteligencia artificial de SIFARH"
                loading="lazy"
                className="w-full rounded-lg"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
                02 / Inteligencia artificial
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Tecnología que apoya su gestión.
              </h2>
              <p className="mt-5 leading-7 text-slate-600">
                Aproveche la inteligencia artificial para optimizar la gestión
                de su inventario con SIFARH.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#f8faf9] px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-bold text-slate-900">SIFARH</span>
            <span className="mx-3 text-slate-300">|</span>
            Inventario farmacéutico hospitalario
          </p>
          <a href="#conocer-sifarh" className="inline-flex items-center gap-1 font-medium text-teal-700 hover:text-teal-900">
            Conozca el sistema
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </main>
  )
}
