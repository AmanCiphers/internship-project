"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  trailing?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  icon: Icon,
  trailing,
  id,
  className,
  required,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="flex items-center gap-1 text-sm font-semibold text-slate-800"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="text-brand-600">
            *
          </span>
        ) : null}
      </label>

      <div className="relative">
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
        ) : null}

        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-base text-slate-900 caret-brand-600 shadow-sm transition placeholder:text-slate-500 sm:text-sm",
            "hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
            Icon ? "pl-10" : null,
            trailing ? "pr-11" : null,
            error &&
              "border-red-300 focus:border-red-500 focus:ring-red-500/10",
            className,
          )}
          {...props}
        />

        {trailing ? (
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            {trailing}
          </div>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
