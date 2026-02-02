/**
 * Optional demo / dev login. Only active when VITE_DEMO_LOGIN_ENABLED is set.
 * Use for local dev or when Supabase auth is unavailable.
 */

export const DEMO_BYPASS_STORAGE_KEY = "fpmobility_demo_bypass";

export type DemoConfig = {
  enabled: boolean;
  email: string;
  password: string;
  bypassAuth: boolean; // if true, skip Supabase and use fake session
};

export function getDemoConfig(): DemoConfig {
  const env = typeof import.meta !== "undefined" ? import.meta.env : {};
  const enabled =
    env.VITE_DEMO_LOGIN_ENABLED === "true" || env.VITE_DEMO_LOGIN_ENABLED === true;
  return {
    enabled,
    email: (env.VITE_DEMO_EMAIL as string) || "admin@example.com",
    password: (env.VITE_DEMO_PASSWORD as string) || "Admin123!",
    bypassAuth: env.VITE_DEMO_BYPASS_AUTH === "true" || env.VITE_DEMO_BYPASS_AUTH === true,
  };
}

export function getStoredBypass(): { email: string; role: "admin" | "employee" } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMO_BYPASS_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { email?: string; role?: string };
    return {
      email: data?.email ?? "admin@example.com",
      role: data?.role === "employee" ? "employee" : "admin",
    };
  } catch {
    return null;
  }
}

export function setBypass(email: string, role: "admin" | "employee" = "admin"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    DEMO_BYPASS_STORAGE_KEY,
    JSON.stringify({ email, role })
  );
}

export function clearBypass(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_BYPASS_STORAGE_KEY);
}
