import * as React from "react"
import { cn } from "@/lib/utils/cn"

export function Card({
  className,
  as: Tag = "section",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "section" | "div" | "article" }) {
  return (
    <Tag
      className={cn(
        "bg-surface rounded-md border border-line shadow-card",
        "p-4 md:p-6",
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-4 flex items-start justify-between gap-4", className)}
      {...props}
    />
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("font-display text-section font-bold text-fg", className)} {...props}>
      {children}
    </h2>
  )
}

export function CardSubtitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-label text-fg-muted", className)} {...props} />
}
