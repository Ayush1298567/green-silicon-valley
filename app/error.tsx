"use client";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="text-gsv-gray mt-2">Please try again.</p>
          <button className="mt-6 rounded border px-4 py-2" onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  );
}


