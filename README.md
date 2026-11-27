# SIFARH Web

Sitio web para obtener SIFARH, un programa de gestión de inventario farmacéutico hospitalario. Permite crear una cuenta, obtener una licencia y descargar la versión portable para Windows o Linux.

El programa se mantiene en un repositorio independiente: [SIFARH-PSA2-main](https://github.com/Nekoshin00/SIFARH-PSA2-main).

## Funcionalidades

- Registro e inicio de sesión con Supabase Auth.
- Simulación local de compra con PixelPay Sandbox y generación de una clave de activación.
- Historial de compras y consulta individual de las claves de activación desde la cuenta.
- Descargas privadas para Windows y Linux mediante enlaces temporales, disponibles para usuarios con una compra pagada y licencia activa.

La compra disponible es una simulación local con PixelPay Sandbox; los pagos reales todavía no están habilitados.

## Tecnologías

- React, TypeScript y TanStack Start.
- Tailwind CSS y componentes shadcn/ui.
- Supabase Auth, PostgreSQL, Vault y Storage.
- Vite y pnpm.

## Desarrollo local

### Requisitos

- Node.js 22.12 o posterior y pnpm.
- Un proyecto Supabase configurado para SIFARH.

### Configuración

1. Clona el repositorio e instala las dependencias:

   ```bash
   git clone https://github.com/Nekoshin00/sifarh-web.git
   cd sifarh-web
   pnpm install --frozen-lockfile
   ```

2. Crea un archivo `.env` en la raíz con los valores de tu proyecto Supabase:

   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_PUBLISHABLE_KEY=tu_clave_publicable
   ```

   La clave publicable se usa en el navegador; nunca pongas una clave secreta ni `service_role` en estas variables. No subas el archivo `.env` al repositorio.

3. Configura la base de datos y el almacenamiento como se indica en la siguiente sección.

4. Inicia el servidor:

   ```bash
   pnpm dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

### Simulación de pago con PixelPay

En `.env`, agrega `SUPABASE_SECRET_KEY` con una clave secreta del proyecto y
`PIXELPAY_SANDBOX_USER_ID` con el UUID de la única cuenta autorizada para las
pruebas. La clave secreta se utiliza exclusivamente en el servidor local; nunca
la publiques ni la incluyas en variables accesibles desde el navegador.
Aplica la migración de PixelPay antes de probar y reinicia el servidor de desarrollo.

Abre `/shopping`, selecciona **Ir al pago de prueba** e inicia sesión con la
cuenta autorizada antes de abrir el formulario. Después, vuelve a seleccionar
**Ir al pago de prueba** e introduce los datos indicados. La transacción
se envía únicamente al confirmar. Solo se aceptan esos datos públicos: nunca
introduzcas una tarjeta real. El escenario exitoso del sandbox es de 1 USD y
no hay cobro real. El proveedor usa el importe como selector de escenario,
por lo que 50 USD no está disponible en este flujo. Una respuesta aprobada crea
una compra identificada como `pixelpay_sandbox` y una licencia activa en el
proyecto Supabase configurado; ambas tienen efectos reales en esa base de datos.
La compra gratuita está deshabilitada.

La simulación solo está disponible con el servidor de desarrollo en localhost;
no expongas ese servidor a la red. No habilita pagos de producción. Utiliza
preferiblemente un proyecto Supabase de pruebas y elimina las compras y
licencias de prueba cuando ya no las necesites.

## Configuración de Supabase

Para un proyecto nuevo, aplica las migraciones de [`supabase/migrations`](supabase/migrations) en orden cronológico. Estas crean los productos, compras, licencias, políticas de acceso, funciones de compra y verificación, el secreto de cifrado en Vault y el bucket privado `sifarh-downloads`.

> **Precaución:** las migraciones modifican datos y la migración de compra gratuita elimina compras de demostración. Revisa los archivos antes de aplicarlos a una base de datos existente y conserva una copia de seguridad.

En Supabase Storage, sube los paquetes portables al bucket privado `sifarh-downloads` con estos nombres exactos:

- `SIFARH-windows-portable.zip`
- `SIFARH-linux-portable.zip`

Los paquetes se generan desde GitHub Actions en el repositorio del programa. La web crea un enlace firmado temporal al seleccionar una plataforma; la política de Storage exige una compra pagada y una licencia activa.

Para permitir el registro sin confirmar el correo, desactiva **Confirm email** en la configuración del proveedor Email de Supabase Auth. Esta opción depende de la configuración del proyecto Supabase, no del código de la web.

## Rutas principales

| Ruta | Descripción |
| --- | --- |
| `/` | Página principal. |
| `/shopping` | Información del producto y compra de prueba local. |
| `/signup` | Registro de usuario. |
| `/login` | Inicio de sesión. |
| `/downloads` | Compras, claves de activación y descargas. |

## Comandos

```bash
pnpm dev         # servidor de desarrollo
pnpm build       # compilación de producción
pnpm preview     # vista previa de la compilación
pnpm typecheck   # comprobación de tipos
pnpm lint        # revisión con ESLint
pnpm check       # comprobación de formato
```

Las variables de Supabase también deben estar configuradas al compilar para producción.
