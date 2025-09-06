"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Trash2 } from "lucide-react"

interface DrawingModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (imageData: { url: string; filename: string; width: number; height: number }) => void
}

export function DrawingModal({ isOpen, onClose, onSave }: DrawingModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)

    const startDrawing = useCallback((e: React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setIsDrawing(true)
        setLastPoint({ x, y })

        const ctx = canvas.getContext("2d")
        if (ctx) {
            ctx.beginPath()
            ctx.moveTo(x, y)
        }
    }, [])

    const draw = useCallback(
        (e: React.MouseEvent) => {
            if (!isDrawing || !lastPoint) return

            const canvas = canvasRef.current
            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.lineTo(x, y)
                ctx.stroke()
            }

            setLastPoint({ x, y })
        },
        [isDrawing, lastPoint],
    )

    const stopDrawing = useCallback(() => {
        setIsDrawing(false)
        setLastPoint(null)
    }, [])

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
    }, [])

    const saveDrawing = useCallback(async () => {
        const canvas = canvasRef.current
        if (!canvas) return

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            if (!blob) return

            try {
                // Upload to blob storage
                const formData = new FormData()
                formData.append("file", blob, "drawing.png")

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                //TODO:Remove this
                console.log("ERROR SAVING DRAWING: ", response)
                if (!response.ok) throw new Error("Failed to upload drawing")

                const result = await response.json()

                onSave({
                    url: result.url,
                    filename: "drawing.png",
                    width: canvas.width,
                    height: canvas.height,
                })

                onClose()
            } catch (error) {
                console.error("Failed to save drawing:", error)
            }
        }, "image/png")
    }, [onSave, onClose])

    // Initialize canvas
    useEffect(() => {
        if (!isOpen) return

        const canvas = canvasRef.current
        if (!canvas) return

        // Set canvas size
        canvas.width = 800
        canvas.height = 600

        const ctx = canvas.getContext("2d")
        if (ctx) {
            // Set drawing properties
            ctx.strokeStyle = "#000000"
            ctx.lineWidth = 2
            ctx.lineCap = "round"
            ctx.lineJoin = "round"

            // Fill with white background
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Drawing Canvas</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="border rounded-lg overflow-hidden mb-4">
                    <canvas
                        ref={canvasRef}
                        className="cursor-crosshair bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={clearCanvas}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={saveDrawing}>
                            <Download className="h-4 w-4 mr-2" />
                            Save Drawing
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
