## Quick orientation for AI coding agents

This repository is a Vite + React (TypeScript) single-page app that uses Supabase as the backend and Supabase Edge Functions (Deno) for server-side integration with Tink (banking). The goal of this document is to surface concrete, discoverable patterns and developer workflows so an AI agent can make safe, correct edits quickly.

Key facts (high level)

Important patterns and rules to follow (concrete)

Integration points to be careful with

Developer workflows (concrete commands)
  - npm i
  - npm run dev  (Vite server runs on port 8080, host configured as `::` in `vite.config.ts`)
  - npm run build
  - npm run preview
  - supabase start
  - supabase functions serve <function-name>
  - supabase db reset / supabase db push  (migrations live in `supabase/migrations`)
  (Note: the repo contains `supabase/config.toml` which indicates local supabase usage.)

Conventions observed (how code is organized)

What AI agents should do first when changing code
1. Check whether the target file is auto-generated (`src/integrations/supabase/client.ts`) or part of `supabase/functions/` (server-side Deno). Avoid editing generated files; update the generator or types instead.
2. For auth or sync changes, inspect `src/hooks/useAuth.ts`, `src/components/ProtectedRoute.tsx`, and related migrations in `supabase/migrations` to ensure client changes match DB schema and RLS.
3. When adding network calls to third-party services, prefer adding them to `supabase/functions/*` (server-side) and call those functions from the frontend. This pattern is used for Tink integration.

Reference files (good starting points)

If anything in this short guide is unclear or you want more detail (local supabase workflow, where types are generated, or the CI/deploy steps), tell me which area to expand and I'll iterate.
