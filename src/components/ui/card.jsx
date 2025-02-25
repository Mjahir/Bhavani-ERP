import React from "react"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props} ref={ref} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} ref={ref} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} ref={ref} />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div className={`p-6 pt-0 ${className}`} {...props} ref={ref} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }

