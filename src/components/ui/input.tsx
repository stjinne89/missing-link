import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="text-sm font-bold text-text-secondary mb-1.5 block">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3.5 rounded-2xl text-sm bg-bg-elevated text-text",
          "border border-border outline-none transition-all",
          "focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
          "placeholder:text-text-muted",
          error && "border-dating ring-1 ring-dating/30",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-dating mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
