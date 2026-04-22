# AgroCopilot AI Frontend

Frontend SaaS para AgroCopilot AI / Pampa-Pilot.

## Stack
- React + TypeScript
- Vite
- TailwindCSS v4
- TanStack Router
- React Leaflet
- Deploy listo para Cloudflare Pages

## Variables de entorno
Crear `.env` con:

```bash
VITE_API_BASE_URL=https://fedeGG09-pampa-pilot-api.hf.space
```

## Desarrollo
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL`
- SPA fallback ya configurado con `public/_redirects`

## Notas
- El mapa usa OpenStreetMap vía react-leaflet.
- Los endpoints del backend son consumidos por fetch real.
- Si el backend cambia el esquema de request/response, ajustar `src/types/api.ts` y `src/lib/api.ts`.
