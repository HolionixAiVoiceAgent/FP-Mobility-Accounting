# FP Mobility — Car Dealership Accounting

## Project info

This repository contains a Vite + React (TypeScript) single-page app used for accounting and bank integrations. The frontend uses Tailwind and shadcn-ui components and the backend integrations live in `supabase/functions` (Supabase Edge Functions - Deno).

## How can I edit this code?

You can edit locally with your preferred IDE. Requirements: Node.js & npm.

Quick start:

```powershell
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

## What technologies are used for this project?

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Auth, Database, Edge Functions)

## How can I run Supabase locally?

This repo contains `supabase/` (migrations and functions). For local Supabase testing use the Supabase CLI:

```powershell
supabase start
supabase db push
supabase functions serve <function-name>
```

If you need deployment or CI details, add them here.
