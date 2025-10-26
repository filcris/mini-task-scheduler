import React from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};
export default function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-100 p-4">
            <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
            <button className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-zinc-100" onClick={onClose}>✕</button>
          </div>
          <div className="p-4">{children}</div>
          {footer && <div className="border-t border-zinc-100 p-4">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
