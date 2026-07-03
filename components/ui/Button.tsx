import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
}

const variants = {
  primary:
    "bg-primary-800 text-white shadow-float active:bg-primary-900 hover:bg-primary-900",
  secondary:
    "bg-primary-50 text-primary-800 active:bg-primary-100 hover:bg-primary-100",
  ghost: "bg-transparent text-primary-700 active:bg-primary-50",
  outline:
    "border-2 border-surface-border bg-white text-slate-700 active:bg-surface-muted hover:border-primary-200",
};

const sizes = {
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-base",
};

export function Button({
  variant = "primary",
  size = "lg",
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 touch-manipulation active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
