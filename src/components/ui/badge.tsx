import * as React from "react"
import { cn } from "../../lib/utils"

function Badge({
    className,
    variant = "default",
    ...props
}: React.ComponentProps<"div"> & {
    variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
}) {
    return (
        <div
            data-slot="badge"
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                {
                    "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900": variant === "default",
                    "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50": variant === "secondary",
                    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400": variant === "success",
                    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400": variant === "warning",
                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400": variant === "destructive",
                    "border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50": variant === "outline",
                },
                className
            )}
            {...props}
        />
    )
}

export { Badge }
