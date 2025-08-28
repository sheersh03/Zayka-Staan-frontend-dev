import * as React from "react";

export function Table({ className = "", ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={`w-full border-collapse text-sm ${className}`} {...props} />;
}

export function TableHeader(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-slate-50 text-slate-700" {...props} />;
}

export function TableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y divide-slate-200" {...props} />;
}

export function TableRow(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className="hover:bg-slate-50" {...props} />;
}

export function TableHead(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className="px-4 py-2 text-left font-medium" {...props} />;
}

export function TableCell(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className="px-4 py-2 align-middle" {...props} />;
}

export function TableCaption(props: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className="mt-2 text-xs text-slate-500" {...props} />;
}