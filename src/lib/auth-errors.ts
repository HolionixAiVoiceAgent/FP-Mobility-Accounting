/**
 * Maps Supabase auth error messages to user-friendly text.
 */
export function getAuthErrorMessage(error: { message?: string; status?: number } | null): string {
  if (!error?.message) return "Something went wrong. Please try again.";
  const msg = error.message.toLowerCase();
  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials"))
    return "Invalid email or password. Please check and try again.";
  if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed"))
    return "Please confirm your email using the link we sent you, then sign in again.";
  if (msg.includes("user already registered") || msg.includes("already registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (msg.includes("password") && (msg.includes("6 character") || msg.includes("at least")))
    return "Password must be at least 6 characters.";
  if (msg.includes("signup_disabled") || msg.includes("sign up disabled"))
    return "Sign up is currently disabled. Contact support.";
  return error.message;
}
