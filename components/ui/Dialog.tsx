"use client";
import * as React from "react";

type Ctx = { open: boolean; setOpen: (v: boolean) => void; onOpenChange?: (v: boolean) => void };
const DialogCtx = React.createContext<Ctx | null>(null);

export function Dialog({
  open: controlledOpen,
  onOpenChange,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const [uOpen, setUOpen] = React.useState(false);
  const isCtrl = typeof controlledOpen === "boolean";
  const open = isCtrl ? controlledOpen : uOpen;
  const setOpen = (v: boolean) => {
    if (!isCtrl) setUOpen(v);
    onOpenChange?.(v);
  };
  return (
    <DialogCtx.Provider value={{ open, setOpen, onOpenChange }}>
      <div {...props}>{children}</div>
    </DialogCtx.Provider>
  );
}

export function DialogTrigger({
  asChild,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(DialogCtx)!;
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: (e: any) => {
        (children as any).props?.onClick?.(e);
        ctx.setOpen(true);
      },
    });
  }
  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        ctx.setOpen(true);
      }}
    >
      {children}
    </button>
  );
}

export function DialogContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(DialogCtx)!;
  if (!ctx.open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => ctx.setOpen(false)} />
      <div {...props} className={"relative z-10 w-full max-w-lg rounded-xl bg-white p-4 text-slate-900 " + className}>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader(props: React.HTMLAttributes<HTMLDivElement>) { return <div className="mb-2" {...props} />; }
export function DialogFooter(props: React.HTMLAttributes<HTMLDivElement>) { return <div className="mt-4 flex justify-end gap-2" {...props} />; }
export function DialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) { return <h3 className="text-lg font-semibold" {...props} />; }
export function DialogDescription(props: React.HTMLAttributes<HTMLParagraphElement>) { return <p className="text-sm text-slate-600" {...props} />; }