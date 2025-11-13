"use client";

import GlobalSearchBar from "./ui/GlobalSearchBar";

export default function SearchBarWrapper() {
  return (
    <GlobalSearchBar
      placeholder="Search groups, volunteers, presentations..."
      className="w-full"
    />
  );
}

