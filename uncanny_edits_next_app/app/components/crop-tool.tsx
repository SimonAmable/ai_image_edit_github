"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { apiUpload } from "@/app/utils/api-client"

interface CropToolProps {
    imageUrl: string
    imageWidth: number
    imageHeight: number
    onCropComplete: (croppedImageData: { url: string; width: number; height: number }) => void
    onCancel: () => void
}

export function CropTool({ imageUrl, imageWidth, imageHeight, onCropComplete, onCancel }: CropToolProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isSelecting, setIsSelecting] = useState(false)
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
    const [cropArea, setCropArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
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

    // Draw canvas
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas || !image) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw image
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        // Draw crop overlay
        if (cropArea) {
            // Darken everything except crop area
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Clear crop area (make it visible)
            ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
            
            // Redraw image in crop area
            ctx.drawImage(
                image,
                (cropArea.x / canvas.width) * image.width,
                (cropArea.y / canvas.height) * image.height,
                (cropArea.width / canvas.width) * image.width,
                (cropArea.height / canvas.height) * image.height,
                cropArea.x,
                cropArea.y,
                cropArea.width,
                cropArea.height
            )

            // Draw crop border
            ctx.strokeStyle = "#3b82f6"
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
            ctx.setLineDash([])
        }
    }, [image, cropArea])

    // Handle mouse down
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setIsSelecting(true)
        setStartPoint({ x, y })
        setCropArea(null)
    }, [])

    // Handle mouse move
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isSelecting || !startPoint) return

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top

        const x = Math.min(startPoint.x, currentX)
        const y = Math.min(startPoint.y, currentY)
        const width = Math.abs(currentX - startPoint.x)
        const height = Math.abs(currentY - startPoint.y)

        setCropArea({ x, y, width, height })
    }, [isSelecting, startPoint])

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setIsSelecting(false)
        setStartPoint(null)
    }, [])

    // Handle crop confirm
    const handleCropConfirm = useCallback(async () => {
        if (!cropArea || !image) return

        const canvas = canvasRef.current
        if (!canvas) return

        // Create a new canvas for the cropped image
        const cropCanvas = document.createElement('canvas')
        const cropCtx = cropCanvas.getContext('2d')
        if (!cropCtx) return

        // Convert canvas coordinates to image coordinates
        const scaleX = imageWidth / canvas.width
        const scaleY = imageHeight / canvas.height

        const cropX = Math.round(cropArea.x * scaleX)
        const cropY = Math.round(cropArea.y * scaleY)
        const cropWidth = Math.round(cropArea.width * scaleX)
        const cropHeight = Math.round(cropArea.height * scaleY)

        // Set crop canvas size
        cropCanvas.width = cropWidth
        cropCanvas.height = cropHeight

        // Draw the cropped portion
        cropCtx.drawImage(
            image,
            cropX, cropY, cropWidth, cropHeight,  // Source rectangle
            0, 0, cropWidth, cropHeight           // Destination rectangle
        )

        // Convert to blob and upload
        cropCanvas.toBlob(async (blob) => {
            if (!blob) return

            try {
                const formData = new FormData()
                formData.append("file", blob, `cropped-${Date.now()}.png`)

                const result = await apiUpload("/api/upload", formData) as { url: string }

                // Return the cropped image data
                onCropComplete({
                    url: result.url,
                    width: cropWidth,
                    height: cropHeight
                })
            } catch (error) {
                console.error("Failed to upload cropped image:", error)
            }
        }, "image/png")
    }, [cropArea, image, imageWidth, imageHeight, onCropComplete])

    // Setup canvas
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !image) return

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

        drawCanvas()
    }, [image, drawCanvas])

    // Redraw when crop area changes
    useEffect(() => {
        drawCanvas()
    }, [drawCanvas])

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Crop Image</h2>
                    <div className="text-sm text-muted-foreground">
                        Click and drag to select the area to crop
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden mb-4 flex justify-center">
                    <canvas
                        ref={canvasRef}
                        className="cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {cropArea 
                            ? `Selected: ${Math.round(cropArea.width)} × ${Math.round(cropArea.height)}px`
                            : "No area selected"
                        }
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCropConfirm}
                            disabled={!cropArea}
                            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Crop & Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}