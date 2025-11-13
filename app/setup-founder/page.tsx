"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupFounderPage() {
  const [email, setEmail] = useState("ayushg.2024@gmail.com");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSetFounder() {
    setLoading(true);
    setStatus("Setting founder role...");
    
    try {
      const response = await fetch("/api/admin/set-founder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`✅ Success! ${email} is now a founder. Redirecting to dashboard...`);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-14">
      <div className="max-w-md mx-auto">
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-2">Setup Founder Account</h1>
          <p className="text-sm text-gsv-gray mb-6">
            Set an email address as a founder to grant full admin access.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="founder@example.com"
              />
            </div>

            <button
              onClick={handleSetFounder}
              disabled={loading || !email}
              className="btn btn-primary w-full"
            >
              {loading ? "Setting..." : "Set as Founder"}
            </button>

            {status && (
              <div className={`p-4 rounded-lg text-sm ${
                status.includes("✅") 
                  ? "bg-green-50 text-green-800" 
                  : status.includes("❌")
                  ? "bg-red-50 text-red-800"
                  : "bg-blue-50 text-blue-800"
              }`}>
                {status}
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-sm mb-2">Instructions:</h3>
            <ol className="text-xs text-gsv-gray space-y-1 list-decimal list-inside">
              <li>Make sure the user has signed in at least once</li>
              <li>Enter their email address above</li>
              <li>Click “Set as Founder”</li>
              <li>They will have full admin access on next login</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

