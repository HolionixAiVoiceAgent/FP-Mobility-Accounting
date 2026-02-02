#!/usr/bin/env node
/**
 * Supabase connectivity check. Run: node scripts/check-supabase.mjs
 * Uses same URL/key as src/integrations/supabase/client.ts (or env).
 */
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://bqbsfiqkjqvyurpwdqxq.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxYnNmaXFranF2eXVycHdkcXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzUzMjEsImV4cCI6MjA2NzA1MTMyMX0.sfPW0YdY3ZaqZCfobCT0upZttKp-CNG2yxlaGJD6m0k";

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

async function check(name, url, options = {}) {
  try {
    const res = await fetch(url, { headers, ...options });
    const ok = res.ok || res.status === 401 || res.status === 404;
    console.log(ok ? "✓" : "✗", name, res.status, res.statusText);
    if (!ok && res.status !== 401) {
      const text = await res.text();
      if (text) console.log("  ", text.slice(0, 200));
    }
    return ok;
  } catch (err) {
    console.log("✗", name, "ERROR", err.message);
    return false;
  }
}

async function main() {
  console.log("Supabase URL:", SUPABASE_URL);
  console.log("");

  const restOk = await check("REST API", `${SUPABASE_URL}/rest/v1/`);
  const authOk = await check("Auth health", `${SUPABASE_URL}/auth/v1/health`);

  console.log("");
  if (restOk || authOk) {
    console.log("Supabase is reachable. Connection OK.");
  } else {
    console.log("Supabase could not be reached. Check network, URL, and firewall.");
    process.exit(1);
  }
}

main();
