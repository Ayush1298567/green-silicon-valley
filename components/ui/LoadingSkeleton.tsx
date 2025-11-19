"use client";

import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
  count?: number;
}

export default function LoadingSkeleton({
  width = "100%",
  height = "1rem",
  className = "",
  rounded = true,
  count = 1
}: LoadingSkeletonProps) {
  const skeletonVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } as const;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          variants={skeletonVariants}
          animate="animate"
          className={`bg-gray-200 ${rounded ? "rounded" : ""} ${className}`}
          style={{ width, height }}
          aria-label="Loading content"
          role="status"
          aria-live="polite"
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4" role="status" aria-label="Loading card">
      <LoadingSkeleton height="1.5rem" width="60%" />
      <LoadingSkeleton height="1rem" width="100%" />
      <LoadingSkeleton height="1rem" width="80%" />
      <LoadingSkeleton height="200px" width="100%" className="rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card p-6 space-y-3" role="status" aria-label="Loading table">
      <LoadingSkeleton height="2rem" width="100%" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <LoadingSkeleton height="1rem" width="20%" />
          <LoadingSkeleton height="1rem" width="30%" />
          <LoadingSkeleton height="1rem" width="25%" />
          <LoadingSkeleton height="1rem" width="25%" />
        </div>
      ))}
    </div>
  );
}

