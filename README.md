# Financial Dashboard

Dashboard financiero construido con [Next.js](https://nextjs.org) 15, React 19, Tailwind CSS y componentes [shadcn/ui](https://ui.shadcn.com).

## Características

- Resumen de cuentas y transacciones recientes
- Gráficos financieros y analíticas con Recharts
- Gestión de presupuesto y objetivos de ahorro
- Envío, solicitud y depósito de dinero (modales)
- Modo claro/oscuro con `next-themes`

## Estructura del proyecto

```
├── app/                # Rutas de la App Router de Next.js
├── components/         # Componentes UI (incluye components/ui de shadcn)
├── contexts/           # Contextos de React
├── hooks/              # Hooks personalizados
├── lib/                # Utilidades
├── public/             # Archivos estáticos
└── styles/             # Estilos globales
```

## Requisitos

- Node.js 18.18 o superior
- pnpm (recomendado)

## Primeros pasos

```bash
# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts disponibles

| Comando      | Descripción                              |
| ------------ | ---------------------------------------- |
| `pnpm dev`   | Inicia el servidor de desarrollo         |
| `pnpm build` | Genera la build de producción            |
| `pnpm start` | Sirve la build de producción             |
| `pnpm lint`  | Ejecuta ESLint sobre el proyecto         |
