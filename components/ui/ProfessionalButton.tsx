"use client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export default function ProfessionalButton({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  icon,
  iconPosition = "left",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "relative font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";

  const variants = {
    primary: "bg-gsv-green text-white shadow-lg hover:shadow-xl hover:bg-gsv-greenDark",
    secondary: "bg-white text-gsv-green border-2 border-gsv-green hover:bg-gsv-greenSoft shadow-md hover:shadow-lg",
    ghost: "text-gsv-gray-700 hover:bg-gsv-gray-100 hover:text-gsv-charcoal",
    outline: "border-2 border-gsv-gray-300 text-gsv-charcoal hover:border-gsv-green hover:text-gsv-green"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {/* Shine effect on hover */}
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}

      <span className="relative z-10 flex items-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && icon && iconPosition === "left" && icon}
        {children}
        {!loading && icon && iconPosition === "right" && icon}
      </span>
    </motion.button>
  );
}

