// components/ui/Button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";


const cn = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  asChild?: boolean;              // <- we support it
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, variant = "default", size = "default", ...props }, ref) => {
    // IMPORTANT: asChild is destructured above, so it won't be forwarded
    const Comp: any = asChild ? Slot : "button";

    const base =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors " +
      "focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants: Record<string, string> = {
      default: "bg-emerald-600 text-white hover:bg-emerald-700",
      outline: "border border-slate-200 bg-white hover:bg-slate-50",
      ghost: "hover:bg-slate-100",
      secondary: "bg-slate-900 text-white hover:opacity-90",
    };
    const sizes: Record<string, string> = {
      default: "h-10 px-4",
      sm: "h-9 px-3",
      lg: "h-11 px-5",
      icon: "h-10 w-10",
    };

    return (
      <Comp
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

