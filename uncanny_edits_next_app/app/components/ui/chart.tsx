"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Stub chart components - install recharts and implement properly when needed

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<"div">["children"]
  }
>(({ config, children, className, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart=""
        ref={ref}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = ({ children }: { children?: React.ReactNode }) => {
  return <div>{children}</div>
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: unknown[]
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
  }
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-background p-2 shadow-sm", className)}
      {...props}
    />
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = ({ children }: { children?: React.ReactNode }) => {
  return <div>{children}</div>
}

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", className)}
      {...props}
    />
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
}