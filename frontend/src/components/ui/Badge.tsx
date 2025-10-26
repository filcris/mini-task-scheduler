import React from "react";
type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  intent?: "neutral" | "success" | "warning" | "danger" | "brand";
};
const map: Record<Required<BadgeProps>["intent"], string> = {
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  success: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-100 text-amber-800 ring-amber-200",
  danger:  "bg-rose-100 text-rose-700 ring-rose-200",
  brand:   "bg-indigo-100 text-indigo-700 ring-indigo-200",
};
export default function Badge({ intent = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${map[intent]} ${className}`}
      {...props}
    />
  );
}