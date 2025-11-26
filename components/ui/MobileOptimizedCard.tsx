"use client";

import { ReactNode } from "react";

interface MobileOptimizedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
}

export default function MobileOptimizedCard({
  children,
  className = "",
  onClick,
  padding = "md",
  shadow = "sm",
  rounded = "lg",
  interactive = false
}: MobileOptimizedCardProps) {
  const paddingClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg"
  };

  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl"
  };

  const baseClasses = `
    bg-white
    border border-gray-200
    transition-all duration-200
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${roundedClasses[rounded]}
    ${className}
  `;

  const interactiveClasses = interactive || onClick
    ? `
      active:scale-[0.98]
      hover:shadow-md
      hover:-translate-y-0.5
      cursor-pointer
      select-none
    `
    : "";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses}`}
      onClick={onClick}
      style={{
        // Ensure minimum touch target of 44px
        minHeight: interactive ? "44px" : "auto"
      }}
    >
      {children}
    </div>
  );
}
