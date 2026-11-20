import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-white",
        secondary:
          "border-transparent bg-slate-100 text-slate-800",
        verified:
          "border-transparent bg-emerald-100 text-emerald-800 font-semibold",
        saffron:
          "border-transparent bg-saffron-100 text-saffron-900 font-semibold",
        navy:
          "border-transparent bg-navy-100 text-navy-900 font-semibold",
        outline:
          "text-slate-700 border border-slate-300",
        danger:
          "border-transparent bg-rose-100 text-rose-800 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
