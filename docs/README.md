# FP Mobility — Car Dealership Accounting Software

## Project info

Enterprise-grade accounting and financial tracking software for car dealerships, built with modern web technologies.

## Getting started

### Prerequisites

- Node.js (v18+) and npm installed

### Installation and development

```powershell
# Clone the repository
git clone <YOUR_GIT_URL>
cd Complete_Accounting_Software

# Install dependencies
npm install

# Start the development server (runs on http://localhost:8080)
npm run dev
```

### Build for production

```powershell
npm run build
npm run preview
```

## Technologies

This project is built with:

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Server Functions**: Deno (TypeScript)
- **Bank Integration**: Tink API for account and transaction sync

## Project structure

- `src/` — React frontend components, hooks, pages
- `supabase/` — Database migrations and Edge Functions
- `supabase/functions/` — Server-side Deno functions (Tink integration, syncing)
- `supabase/migrations/` — SQL database schemas and RLS policies

## Development

### Linting

```powershell
npm run lint
```

### Local Supabase (optional)

If you have the Supabase CLI installed:

```powershell
supabase start
supabase db push
supabase functions serve <function-name>
```

## License

See LICENSE file for details.
