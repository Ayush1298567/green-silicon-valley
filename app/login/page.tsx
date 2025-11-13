"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | string>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sending magic link...");
    const supabase = createClientComponentClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    });
    setStatus(error ? `Error: ${error.message}` : "Check your email for a login link.");
  }

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Login</h1>
      <div className="card p-6 mt-6 max-w-md">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="rounded-lg bg-gsv-green px-4 py-2 text-white">Send Magic Link</button>
        </form>
        <div className="mt-4">
          <button
            className="rounded-lg border px-4 py-2 w-full"
            onClick={async () => {
              setStatus("Redirecting to Google...");
              const supabase = createClientComponentClient();
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${location.origin}/auth/callback` }
              });
              if (error) setStatus(`Error: ${error.message}`);
            }}
          >
            Continue with Google
          </button>
        </div>
        {status && <p className="text-sm text-gsv-gray mt-3">{status}</p>}
      </div>
    </div>
  );
}


