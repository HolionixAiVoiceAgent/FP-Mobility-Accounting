import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles the redirect after email verification (and other auth callbacks).
 * Supabase redirects here with hash fragments (#access_token=...); the client
 * parses them and establishes the session. We then send the user to the app.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const go = async () => {
      // Give Supabase client time to process hash and set session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/", { replace: true });
      } else {
        // No session (e.g. link expired or already used) – send to sign-in
        navigate("/auth", { replace: true });
      }
    };
    const t = setTimeout(go, 800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Verifying your email…</p>
      </div>
    </div>
  );
}
