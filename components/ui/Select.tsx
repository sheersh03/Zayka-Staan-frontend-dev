"use client";
import * as React from "react";

type Ctx = {
  value?: string;
  setValue: (v: string) => void;
  onValueChange?: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  placeholder?: string;
};
const SelectCtx = React.createContext<Ctx | null>(null);

export function Select({
  value,
  defaultValue,
  onValueChange,
  children,
  placeholder,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}) {
  const [uVal, setUVal] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const isCtrl = typeof value === "string";
  const val = isCtrl ? value : uVal;

  const setValue = (v: string) => {
    if (!isCtrl) setUVal(v);
    onValueChange?.(v);
    setOpen(false);
  };

  return (
    <SelectCtx.Provider value={{ value: val, setValue, onValueChange, open, setOpen, placeholder }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectCtx.Provider>
  );
}

export function SelectTrigger({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SelectCtx)!;
  return (
    <button
      type="button"
      className={"w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left " + className}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectCtx)!;
  return <span className="opacity-80">{ctx.value ?? placeholder ?? ctx.placeholder ?? "Select"}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SelectCtx)!;
  if (!ctx.open) return null;
  return (
    <div className="absolute z-50 mt-1 w-full rounded-xl border bg-white p-1 shadow-lg">
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  children,
  className = "",
}: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(SelectCtx)!;
  return (
    <div
      className={"cursor-pointer rounded px-3 py-2 hover:bg-slate-100 " + className}
      onClick={() => ctx.setValue(value)}
      data-selected={ctx.value === value}
    >
      {children}
    </div>
  );
}