import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "dating" | "ride" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-bold rounded-full transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-primary text-secondary shadow-md shadow-primary/25 hover:bg-primary-dark",
      secondary:
        "bg-bg-elevated text-text border border-border hover:bg-surface",
      ghost: "text-text-muted hover:text-text hover:bg-bg-elevated",
      dating:
        "bg-dating text-white shadow-md shadow-dating/25 hover:bg-accent-dark",
      ride: "bg-success text-white shadow-md shadow-success/25 hover:bg-success-dark",
      danger: "bg-red-500 text-white hover:bg-red-600",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs gap-1.5",
      md: "px-6 py-3 text-sm gap-2",
      lg: "px-8 py-4 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
