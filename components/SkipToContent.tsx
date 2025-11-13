"use client";

export default function SkipToContent() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 bg-gsv-green text-white px-3 py-2 rounded"
    >
      Skip to content
    </a>
  );
}


