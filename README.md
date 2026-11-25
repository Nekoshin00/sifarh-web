# SIFARH Web

Sitio web para obtener SIFARH, un programa de gestión de inventario farmacéutico hospitalario. Permite crear una cuenta, obtener una licencia y descargar la versión portable para Windows o Linux.

El programa se mantiene en un repositorio independiente: [SIFARH-PSA2-main](https://github.com/Nekoshin00/SIFARH-PSA2-main).

## Funcionalidades

- Registro e inicio de sesión con Supabase Auth.
- Obtención gratuita de SIFARH y generación de una clave de activación.
- Historial de compras y consulta de la clave desde la cuenta.
- Descargas privadas para Windows y Linux mediante enlaces temporales, disponibles para usuarios con una compra pagada y licencia activa.

Actualmente el producto es gratuito; no hay pasarela de pago integrada. La integración con PayPal queda pendiente.

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
| `/shopping` | Información del producto y obtención gratuita. |
| `/signup` | Registro de usuario. |
| `/login` | Inicio de sesión. |
| `/downloads` | Compras, clave de activación y descargas. |

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
