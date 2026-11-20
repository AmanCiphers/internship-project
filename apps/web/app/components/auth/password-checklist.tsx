import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordChecklist({
  password,
  confirmation,
  showConfirmation = false,
}: {
  password: string;
  confirmation?: string;
  showConfirmation?: boolean;
}) {
  const checks = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    ...(showConfirmation
      ? [
          {
            label: "Passwords match",
            met: password.length > 0 && password === confirmation,
          },
        ]
      : []),
  ];

  return (
    <ul className="grid gap-1.5" aria-label="Password requirements">
      {checks.map((check) => (
        <li
          key={check.label}
          className={cn(
            "flex items-center gap-2 text-xs",
            check.met ? "text-emerald-700" : "text-slate-500",
          )}
        >
          <span
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full",
              check.met ? "bg-emerald-100" : "bg-slate-100",
            )}
          >
            {check.met ? (
              <Check aria-hidden="true" className="h-3 w-3" />
            ) : (
              <X aria-hidden="true" className="h-3 w-3 text-slate-400" />
            )}
          </span>
          {check.label}
        </li>
      ))}
    </ul>
  );
}
