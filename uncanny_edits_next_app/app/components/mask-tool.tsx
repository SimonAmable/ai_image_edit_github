"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Eraser, Brush, RotateCcw } from "lucide-react"

interface MaskToolProps {
    imageUrl: string
    imageWidth: number
    imageHeight: number
    onMaskComplete: (maskDataUrl: string) => void
    onCancel: () => void
}

export function MaskTool({ imageUrl, imageWidth, imageHeight, onMaskComplete, onCancel }: MaskToolProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const maskCanvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [brushSize, setBrushSize] = useState(20)
    const [isErasing, setIsErasing] = useState(false)
    const [image, setImage] = useState<HTMLImageElement | null>(null)

    // Load image
    useEffect(() => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            setImage(img)
        }
        img.src = imageUrl
    }, [imageUrl])

    // Initialize canvases
    useEffect(() => {
        const canvas = canvasRef.current
        const maskCanvas = maskCanvasRef.current
        if (!canvas || !maskCanvas || !image) return

        // Set canvas size to fit container while maintaining aspect ratio
        const maxWidth = 800
        const maxHeight = 600
        const aspectRatio = image.width / image.height

        let canvasWidth = maxWidth
        let canvasHeight = maxWidth / aspectRatio

        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight
            canvasWidth = maxHeight * aspectRatio
        }

        canvas.width = canvasWidth
        canvas.height = canvasHeight
        maskCanvas.width = canvasWidth
        maskCanvas.height = canvasHeight

        // Draw image on main canvas (always visible)
        const ctx = canvas.getContext("2d")
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        }

        // Initialize mask canvas with transparent background
        const maskCtx = maskCanvas.getContext("2d")
        if (maskCtx) {
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
        }

        // Initial overlay draw to ensure image is visible - inline the logic
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        }
    }, [image])

    // Draw mask overlay
    const drawMaskOverlay = useCallback(() => {
        const canvas = canvasRef.current
        const maskCanvas = maskCanvasRef.current
        if (!canvas || !maskCanvas || !image) return

        const ctx = canvas.getContext("2d")
        const maskCtx = maskCanvas.getContext("2d")
        if (!ctx || !maskCtx) return

        // Clear and redraw image first (always visible)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        // Draw mask overlay with red tint on top
        ctx.save()
        ctx.globalAlpha = 0.4 // Semi-transparent red overlay
        ctx.fillStyle = "red"
        
        const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)
        
        // Create a temporary canvas for the mask overlay
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvas.width
        tempCanvas.height = canvas.height
        const tempCtx = tempCanvas.getContext('2d')
        
        if (tempCtx) {
            const tempImageData = tempCtx.createImageData(canvas.width, canvas.height)
            
            for (let i = 0; i < maskImageData.data.length; i += 4) {
                const alpha = maskImageData.data[i + 3]
                if (alpha > 0) {
                    tempImageData.data[i] = 255     // Red
                    tempImageData.data[i + 1] = 0   // Green
                    tempImageData.data[i + 2] = 0   // Blue
                    tempImageData.data[i + 3] = 255 // Full alpha for the overlay
                }
            }
            
            tempCtx.putImageData(tempImageData, 0, 0)
            ctx.drawImage(tempCanvas, 0, 0)
        }
        
        ctx.restore()
    }, [image])

    // Handle mouse down
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDrawing(true)
        
        const canvas = canvasRef.current
        const maskCanvas = maskCanvasRef.current
        if (!canvas || !maskCanvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const maskCtx = maskCanvas.getContext("2d")
        if (!maskCtx) return

        maskCtx.globalCompositeOperation = isErasing ? "destination-out" : "source-over"
        maskCtx.fillStyle = "rgba(255, 255, 255, 1)"
        maskCtx.beginPath()
        maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
        maskCtx.fill()

        drawMaskOverlay()
    }, [brushSize, isErasing, drawMaskOverlay])

    // Handle mouse move
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDrawing) return

        const canvas = canvasRef.current
        const maskCanvas = maskCanvasRef.current
        if (!canvas || !maskCanvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const maskCtx = maskCanvas.getContext("2d")
        if (!maskCtx) return

        maskCtx.globalCompositeOperation = isErasing ? "destination-out" : "source-over"
        maskCtx.fillStyle = "rgba(255, 255, 255, 1)"
        maskCtx.beginPath()
        maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
        maskCtx.fill()

        drawMaskOverlay()
    }, [isDrawing, brushSize, isErasing, drawMaskOverlay])

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setIsDrawing(false)
    }, [])

    // Clear mask
    const handleClearMask = useCallback(() => {
        const maskCanvas = maskCanvasRef.current
        if (!maskCanvas) return

        const maskCtx = maskCanvas.getContext("2d")
        if (!maskCtx) return

        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
        drawMaskOverlay()
    }, [drawMaskOverlay])

    // Handle mask confirm
    const handleMaskConfirm = useCallback(() => {
        const maskCanvas = maskCanvasRef.current
        if (!maskCanvas) return

        // Create a new canvas with the original image dimensions for the mask
        const finalMaskCanvas = document.createElement("canvas")
        finalMaskCanvas.width = imageWidth
        finalMaskCanvas.height = imageHeight
        
        const finalCtx = finalMaskCanvas.getContext("2d")
        if (!finalCtx) return

        // Scale the mask to original image dimensions
        finalCtx.drawImage(maskCanvas, 0, 0, imageWidth, imageHeight)

        // Convert to data URL
        const maskDataUrl = finalMaskCanvas.toDataURL("image/png")
        onMaskComplete(maskDataUrl)
    }, [imageWidth, imageHeight, onMaskComplete])

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Mask Areas</h2>
                    <div className="text-sm text-muted-foreground">
                        Paint over areas you want to mask (shown in red)
                    </div>
                </div>

                {/* Tools */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={!isErasing ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsErasing(false)}
                        >
                            <Brush className="h-4 w-4 mr-1" />
                            Brush
                        </Button>
                        <Button
                            variant={isErasing ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsErasing(true)}
                        >
                            <Eraser className="h-4 w-4 mr-1" />
                            Eraser
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium">Brush Size:</span>
                        <input
                            type="range"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            min={5}
                            max={50}
                            step={1}
                            className="flex-1 max-w-32"
                        />
                        <span className="text-sm text-muted-foreground w-8">{brushSize}px</span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearMask}
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                </div>

                <div className="border rounded-lg overflow-hidden mb-4 flex justify-center">
                    <div className="relative">
                        <canvas
                            ref={canvasRef}
                            className="cursor-crosshair"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        />
                        <canvas
                            ref={maskCanvasRef}
                            className="absolute inset-0 pointer-events-none opacity-0"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {isErasing ? "Eraser mode - click to remove mask" : "Brush mode - click to add mask"}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleMaskConfirm}>
                            Apply Mask
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}