// components/ui/textarea.tsx
import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={
          "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none " +
          "focus:ring-2 focus:ring-slate-400 " +
          className
        }
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";