import React from "react";
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "secondary" | "danger";
};
const styles: Record<Required<ButtonProps>["variant"], string> = {
  primary:  "bg-indigo-600 hover:bg-indigo-500 text-white",
  ghost:    "bg-transparent hover:bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200",
  secondary:"bg-zinc-900 hover:bg-zinc-800 text-white",
  danger:   "bg-rose-600 hover:bg-rose-500 text-white",
};
export default function Button({ variant="primary", className="", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
