import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  children,
  className = "",
  onClick,
  selected,
  padding = "md",
}: CardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-3xl border bg-white text-left shadow-card transition-all duration-200 ${paddingMap[padding]} ${
        selected
          ? "border-primary-600 ring-2 ring-primary-100 shadow-elevated"
          : "border-surface-border hover:border-primary-200 hover:shadow-elevated"
      } ${onClick ? "touch-manipulation active:scale-[0.98] w-full" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}
