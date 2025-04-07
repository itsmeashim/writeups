"use client"

import * as React from "react"
import type { ButtonProps } from "~/components/ui/button"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

interface FloatingButtonProps extends ButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  className?: string
}

const FloatingButton = React.forwardRef<HTMLButtonElement, FloatingButtonProps>(
  ({ className, position = "bottom-right", children, ...props }, ref) => {
    const positionClasses = {
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
    }

    return (
      <Button
        ref={ref}
        className={cn(
          "fixed z-50 shadow-lg",
          positionClasses[position],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
FloatingButton.displayName = "FloatingButton"

export { FloatingButton }
