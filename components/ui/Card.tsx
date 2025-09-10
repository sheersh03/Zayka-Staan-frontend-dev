import * as React from "react";

// utility to merge classNames
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-white", className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4 border-b", className)}>{children}</div>;
}

export function CardTitle({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-base font-semibold", className)}>{children}</div>;
}

export function CardDescription({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-sm text-slate-500", className)}>{children}</div>;
}

export function CardContent({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4 border-t", className)}>{children}</div>;
}
