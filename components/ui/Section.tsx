"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: "white" | "gray" | "green" | "dark" | "gradient";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

export default function Section({
  children,
  className = "",
  background = "white",
  padding = "lg",
  animate = true
}: SectionProps) {
  const backgrounds = {
    white: "bg-white",
    gray: "bg-gsv-gray-100",
    green: "bg-gradient-to-b from-gsv-greenSoft/30 to-white",
    dark: "bg-gsv-charcoal text-white",
    gradient: "bg-gradient-to-br from-gsv-greenSoft via-white to-green-50"
  };

  const paddings = {
    none: "",
    sm: "py-12 md:py-16",
    md: "py-16 md:py-20",
    lg: "py-20 md:py-24 lg:py-32",
    xl: "py-24 md:py-32 lg:py-40"
  };

  const content = (
    <section className={`${backgrounds[background]} ${paddings[padding]} ${className}`}>
      {children}
    </section>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {content}
    </motion.div>
  );
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  align = "center"
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const maxWidth = align === "center" ? "max-w-3xl" : "max-w-4xl";

  return (
    <div className={`${alignClass} ${maxWidth} mb-12 md:mb-16`}>
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-block mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gsv-green/10 text-gsv-green text-sm font-semibold rounded-full border border-gsv-green/20">
            {badge}
          </span>
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gsv-charcoal mb-6 leading-tight"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-gsv-gray-700 leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

