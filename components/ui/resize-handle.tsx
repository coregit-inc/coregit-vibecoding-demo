"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface ResizeHandleProps {
  side: "left" | "right"
  onResize: (delta: number) => void
  onResizeEnd?: () => void
  className?: string
}

export function ResizeHandle({
  side,
  onResize,
  onResizeEnd,
  className,
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startXRef.current = e.clientX
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current
      startXRef.current = e.clientX

      // For right side handle (left panel), dragging right increases width
      // For left side handle (right panel), dragging right decreases width
      onResize(side === "right" ? delta : -delta)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      onResizeEnd?.()
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    // Add cursor style to body during drag
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isDragging, onResize, onResizeEnd, side])

  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 z-20 w-0.5 cursor-col-resize",
        "transition-colors hover:bg-sidebar-border",
        isDragging && "bg-sidebar-border",
        side === "left" ? "left-0" : "right-0",
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Wider hit area */}
      <div
        className={cn(
          "absolute top-0 bottom-0 w-3",
          side === "left" ? "-left-1" : "-right-1"
        )}
      />
    </div>
  )
}
