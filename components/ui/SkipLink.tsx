"use client";

import Link from "next/link";

export default function SkipLink() {
  return (
    <Link
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gsv-green focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gsv-green"
      aria-label="Skip to main content"
    >
      Skip to main content
    </Link>
  );
}

