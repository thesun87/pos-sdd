import * as React from "react"
import { cn } from "../utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4 text-slate-500">
          {icon}
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
