# Besqaa Admin

React (Vite) admin panel for Besqaa — manage the catalog, verify payments, and answer Besqaa Queries.

Related repos: [besqaa_app](https://github.com/Ravilovecode/besqaa_app) (Expo mobile app) · besqaa_backend (API).

## Setup

```bash
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # http://localhost:5173
```

Log in with the admin seeded by the backend (`npm run seed` there).

## Workflow

1. **Catalog** → create a category (e.g. *Televisions*) → click it → **Add product** (price, stock, specs, S3 photo upload) → appears in the app instantly
2. **Orders** → open an order → view the buyer's payment screenshot → **✓ Verify payment & confirm order** (emails the buyer)
3. **Besqaa Queries** → sourcing requests from the app → respond and track status

## Build

```bash
npm run build             # outputs to dist/
```
