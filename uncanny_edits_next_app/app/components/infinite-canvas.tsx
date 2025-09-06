"use client"

import type React from "react"
import { ImageUpload } from "@/app/components/image-upload"
import { EditingToolbar } from "@/app/components/editing-toolbar"
import { EditHistorySidebar } from "@/app/components/edit-history-sidebar"
import { DrawingModal } from "@/app/components/drawing-modal"
import { CanvasManager } from "@/app/components/canvas-manager"

import { useRef, useEffect, useState, useCallback } from "react"

interface CanvasState {
    scale: number
    offsetX: number
    offsetY: number
}

interface MouseState {
    isDragging: boolean
    lastX: number
    lastY: number
}

interface CanvasImage {
    id: string
    url: string
    filename: string
    x: number
    y: number
    width: number
    height: number
    originalWidth: number
    originalHeight: number
    selected: boolean
}

interface EditHistoryItem {
    id: string
    timestamp: Date
    prompt: string
    tool: "crop" | "mask" | "pencil" | null
    resultUrl?: string
    status: "pending" | "completed" | "failed"
    error?: string
}

export function InfiniteCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null)

    const [canvasState, setCanvasState] = useState<CanvasState>({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
    })

    const [mouseState, setMouseState] = useState<MouseState>({
        isDragging: false,
        lastX: 0,
        lastY: 0,
    })

    const [images, setImages] = useState<CanvasImage[]>([])
    const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map())
    const [isProcessingEdit, setIsProcessingEdit] = useState(false)
    const [editHistory, setEditHistory] = useState<Record<string, EditHistoryItem[]>>({})
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false)
    const [isDrawingMode, setIsDrawingMode] = useState(false)
    const [isDrawingOnImage, setIsDrawingOnImage] = useState(false)
    const [drawingPaths, setDrawingPaths] = useState<Array<{ x: number; y: number }[]>>([])

    const [currentCanvasId, setCurrentCanvasId] = useState<string | null>(null)
    const [canvasName, setCanvasName] = useState<string>("")

    // Get selected image ID
    const selectedImageId = images.find((img) => img.selected)?.id || null

    const handlePencilClick = useCallback(() => {
        if (selectedImageId) {
            // If image is selected, enable drawing on image
            setIsDrawingOnImage(true)
            setIsDrawingMode(true)
        } else {
            // If no image selected, open drawing modal
            setIsDrawingModalOpen(true)
        }
    }, [selectedImageId])

    const handleDrawingModalSave = useCallback(
        (imageData: { url: string; filename: string; width: number; height: number }) => {
            handleImageUploaded(imageData)
            setIsDrawingModalOpen(false)
        },
        [],
    )

    // Draw grid pattern on canvas
    const drawGrid = useCallback(
        (ctx: CanvasRenderingContext2D, width: number, height: number) => {
            const { scale, offsetX, offsetY } = canvasState

            ctx.clearRect(0, 0, width, height)

            // Grid settings
            const gridSize = 20 * scale
            const startX = offsetX % gridSize
            const startY = offsetY % gridSize

            // Draw grid lines
            ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
            ctx.lineWidth = 1
            ctx.beginPath()

            // Vertical lines
            for (let x = startX; x < width; x += gridSize) {
                ctx.moveTo(x, 0)
                ctx.lineTo(x, height)
            }

            // Horizontal lines
            for (let y = startY; y < height; y += gridSize) {
                ctx.moveTo(0, y)
                ctx.lineTo(width, y)
            }

            ctx.stroke()
        },
        [canvasState],
    )

    // Draw grid pattern and images on canvas
    const drawCanvas = useCallback(
        (ctx: CanvasRenderingContext2D, width: number, height: number) => {
            const { scale, offsetX, offsetY } = canvasState

            ctx.clearRect(0, 0, width, height)

            // Draw grid
            const gridSize = 20 * scale
            const startX = offsetX % gridSize
            const startY = offsetY % gridSize

            ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
            ctx.lineWidth = 1
            ctx.beginPath()

            for (let x = startX; x < width; x += gridSize) {
                ctx.moveTo(x, 0)
                ctx.lineTo(x, height)
            }

            for (let y = startY; y < height; y += gridSize) {
                ctx.moveTo(0, y)
                ctx.lineTo(width, y)
            }

            ctx.stroke()

            images.forEach((imageData) => {
                const img = loadedImages.get(imageData.url)
                if (!img) return

                const x = imageData.x * scale + offsetX
                const y = imageData.y * scale + offsetY
                const w = imageData.width * scale
                const h = imageData.height * scale

                // Draw image
                ctx.drawImage(img, x, y, w, h)

                // Draw selection border if selected
                if (imageData.selected) {
                    ctx.strokeStyle = "#3b82f6"
                    ctx.lineWidth = 2
                    ctx.setLineDash([5, 5])
                    ctx.strokeRect(x - 2, y - 2, w + 4, h + 4)
                    ctx.setLineDash([])
                }
            })
        },
        [canvasState, images, loadedImages],
    )

    // Handle image uploaded
    const handleImageUploaded = useCallback(
        (imageData: {
            url: string
            filename: string
            width: number
            height: number
        }) => {
            const canvas = canvasRef.current
            if (!canvas) return

            // Calculate center position on canvas
            const rect = canvas.getBoundingClientRect()
            const centerX = (rect.width / 2 - canvasState.offsetX) / canvasState.scale
            const centerY = (rect.height / 2 - canvasState.offsetY) / canvasState.scale

            // Scale image to reasonable size (max 400px)
            const maxSize = 400
            const scale = Math.min(maxSize / imageData.width, maxSize / imageData.height, 1)
            const scaledWidth = imageData.width * scale
            const scaledHeight = imageData.height * scale

            const newImage: CanvasImage = {
                id: Date.now().toString(),
                url: imageData.url,
                filename: imageData.filename,
                x: centerX - scaledWidth / 2,
                y: centerY - scaledHeight / 2,
                width: scaledWidth,
                height: scaledHeight,
                originalWidth: imageData.width,
                originalHeight: imageData.height,
                selected: true,
            }

            // Deselect other images
            setImages((prev) => [...prev.map((img) => ({ ...img, selected: false })), newImage])

            setEditHistory((prev) => ({
                ...prev,
                [newImage.id]: [],
            }))

            // Load the image for rendering
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => {
                setLoadedImages((prev) => new Map(prev).set(imageData.url, img))
            }
            img.src = imageData.url
        },
        [canvasState],
    )

    // Handle mouse wheel for zooming
    const handleWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault()

            const canvas = canvasRef.current
            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top

            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
            const newScale = Math.max(0.1, Math.min(5, canvasState.scale * zoomFactor))

            const scaleChange = newScale / canvasState.scale
            const newOffsetX = mouseX - (mouseX - canvasState.offsetX) * scaleChange
            const newOffsetY = mouseY - (mouseY - canvasState.offsetY) * scaleChange

            setCanvasState({
                scale: newScale,
                offsetX: newOffsetX,
                offsetY: newOffsetY,
            })
        },
        [canvasState],
    )

    // Handle mouse down for panning
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setMouseState({
            isDragging: true,
            lastX: e.clientX,
            lastY: e.clientY,
        })
    }, [])

    // Handle mouse move for panning
    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!mouseState.isDragging) return

            const deltaX = e.clientX - mouseState.lastX
            const deltaY = e.clientY - mouseState.lastY

            setCanvasState((prev) => ({
                ...prev,
                offsetX: prev.offsetX + deltaX,
                offsetY: prev.offsetY + deltaY,
            }))

            setMouseState((prev) => ({
                ...prev,
                lastX: e.clientX,
                lastY: e.clientY,
            }))
        },
        [mouseState],
    )

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setMouseState((prev) => ({ ...prev, isDragging: false }))
    }, [])

    // Handle image click for selection
    const handleCanvasClick = useCallback(
        (e: React.MouseEvent) => {
            if (mouseState.isDragging) return

            const canvas = canvasRef.current
            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const clickY = e.clientY - rect.top

            // Convert screen coordinates to canvas coordinates
            const canvasX = (clickX - canvasState.offsetX) / canvasState.scale
            const canvasY = (clickY - canvasState.offsetY) / canvasState.scale

            // Check if click is on any image (reverse order to check top images first)
            let clickedImageId: string | null = null
            for (let i = images.length - 1; i >= 0; i--) {
                const img = images[i]
                if (canvasX >= img.x && canvasX <= img.x + img.width && canvasY >= img.y && canvasY <= img.y + img.height) {
                    clickedImageId = img.id
                    break
                }
            }

            // Update selection
            setImages((prev) =>
                prev.map((img) => ({
                    ...img,
                    selected: img.id === clickedImageId,
                })),
            )
        },
        [canvasState, images, mouseState.isDragging],
    )

    // Handle edit submission
    const handleEditSubmit = useCallback(
        async (prompt: string, tool: "crop" | "mask" | "pencil" | null) => {
            const selectedImage = images.find((img) => img.selected)
            if (!selectedImage) return

            setIsProcessingEdit(true)

            const editId = Date.now().toString()
            const newEdit: EditHistoryItem = {
                id: editId,
                timestamp: new Date(),
                prompt,
                tool,
                status: "pending",
            }

            // Add to edit history
            setEditHistory((prev) => ({
                ...prev,
                [selectedImage.id]: [...(prev[selectedImage.id] || []), newEdit],
            }))

            try {
                console.log("[v0] Edit request:", { prompt, tool, imageId: selectedImage.id })

                const requestBody: any = {
                    imageUrl: selectedImage.url,
                    prompt: prompt,
                    tool: tool,
                }

                if (tool === "pencil" && drawingPaths.length > 0) {
                    requestBody.drawingPaths = drawingPaths
                }

                const response = await fetch("/api/edit-image", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Failed to edit image")
                }

                const result = await response.json()

                if (result.editedImageUrl) {
                    // Create new image with edited URL
                    const editedImage: CanvasImage = {
                        ...selectedImage,
                        id: Date.now().toString(),
                        url: result.editedImageUrl,
                        filename: `edited-${selectedImage.filename}`,
                        selected: true,
                    }

                    // Add edited image to canvas and deselect original
                    setImages((prev) => [...prev.map((img) => ({ ...img, selected: false })), editedImage])

                    // Initialize edit history for new image
                    setEditHistory((prev) => ({
                        ...prev,
                        [editedImage.id]: [],
                    }))

                    // Load the edited image for rendering
                    const img = new Image()
                    img.crossOrigin = "anonymous"
                    img.onload = () => {
                        setLoadedImages((prev) => new Map(prev).set(result.editedImageUrl, img))
                    }
                    img.src = result.editedImageUrl
                }

                setEditHistory((prev) => ({
                    ...prev,
                    [selectedImage.id]: prev[selectedImage.id].map((edit) =>
                        edit.id === editId
                            ? {
                                ...edit,
                                status: "completed" as const,
                                resultUrl: result.editedImageUrl,
                            }
                            : edit,
                    ),
                }))

                if (tool === "pencil") {
                    setDrawingPaths([])
                    setIsDrawingOnImage(false)
                    setIsDrawingMode(false)
                }

                console.log("[v0] Edit completed successfully")
            } catch (error) {
                console.error("[v0] Edit failed:", error)

                setEditHistory((prev) => ({
                    ...prev,
                    [selectedImage.id]: prev[selectedImage.id].map((edit) =>
                        edit.id === editId
                            ? {
                                ...edit,
                                status: "failed" as const,
                                error: error instanceof Error ? error.message : "Unknown error",
                            }
                            : edit,
                    ),
                }))
            } finally {
                setIsProcessingEdit(false)
            }
        },
        [images, drawingPaths],
    )

    const handleRevertToEdit = useCallback(
        (imageId: string, editId: string) => {
            const edit = editHistory[imageId]?.find((e) => e.id === editId)
            if (!edit || !edit.resultUrl) return

            console.log("[v0] Reverting to edit:", { imageId, editId, prompt: edit.prompt })

            // TODO: Implement revert functionality
            // This would restore the image to the state after that specific edit
        },
        [editHistory],
    )

    const handleCanvasSave = useCallback(
        async (name: string) => {
            try {
                const response = await fetch("/api/canvas/save", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        zoomLevel: canvasState.scale,
                        panX: canvasState.offsetX,
                        panY: canvasState.offsetY,
                        images: images.map((img) => ({
                            url: img.url,
                            filename: img.filename,
                            x: img.x,
                            y: img.y,
                            width: img.width,
                            height: img.height,
                        })),
                    }),
                })

                const result = await response.json()
                if (result.canvasId) {
                    setCurrentCanvasId(result.canvasId)
                    setCanvasName(name)
                    console.log("[v0] Canvas saved successfully:", result.canvasId)
                }
            } catch (error) {
                console.error("[v0] Failed to save canvas:", error)
            }
        },
        [canvasState, images],
    )

    const handleCanvasLoad = useCallback(async (canvasId: string) => {
        try {
            const response = await fetch(`/api/canvas/load?id=${canvasId}`)
            const data = await response.json()

            if (data.canvas && data.images) {
                // Restore canvas state
                setCanvasState({
                    scale: data.canvas.zoomLevel,
                    offsetX: data.canvas.panX,
                    offsetY: data.canvas.panY,
                })

                // Restore images
                const restoredImages: CanvasImage[] = data.images.map((img: any) => ({
                    id: Date.now().toString() + Math.random(),
                    url: img.url,
                    filename: img.filename,
                    x: img.x,
                    y: img.y,
                    width: img.width,
                    height: img.height,
                    originalWidth: img.width,
                    originalHeight: img.height,
                    selected: false,
                }))

                setImages(restoredImages)
                setCurrentCanvasId(data.canvas.id)
                setCanvasName(data.canvas.name)

                // Load images for rendering
                restoredImages.forEach((imageData) => {
                    const img = new Image()
                    img.crossOrigin = "anonymous"
                    img.onload = () => {
                        setLoadedImages((prev) => new Map(prev).set(imageData.url, img))
                    }
                    img.src = imageData.url
                })

                // Reset edit history
                setEditHistory({})

                console.log("[v0] Canvas loaded successfully:", data.canvas.name)
            }
        } catch (error) {
            console.error("[v0] Failed to load canvas:", error)
        }
    }, [])

    const handleNewCanvas = useCallback(() => {
        setImages([])
        setLoadedImages(new Map())
        setEditHistory({})
        setCanvasState({
            scale: 1,
            offsetX: 0,
            offsetY: 0,
        })
        setCurrentCanvasId(null)
        setCanvasName("")
        console.log("[v0] New canvas created")
    }, [])

    // Resize canvas to match container
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const rect = container.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height

        const ctx = canvas.getContext("2d")
        if (ctx) {
            drawCanvas(ctx, canvas.width, canvas.height)
        }
    }, [drawCanvas])

    // Setup canvas and event listeners
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.addEventListener("wheel", handleWheel, { passive: false })
        resizeCanvas()

        const handleResize = () => resizeCanvas()
        window.addEventListener("resize", handleResize)

        return () => {
            canvas.removeEventListener("wheel", handleWheel)
            window.removeEventListener("resize", handleResize)
        }
    }, [handleWheel, resizeCanvas])

    // Redraw canvas when state changes
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (ctx) {
            drawCanvas(ctx, canvas.width, canvas.height)
        }
    }, [canvasState, images, loadedImages, drawCanvas])

    return (
        <div ref={containerRef} className="relative h-full w-full overflow-hidden">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleCanvasClick}
            />

            <div className="absolute top-4 right-4 flex items-center gap-4">
                <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-mono">
                    {Math.round(canvasState.scale * 100)}%
                </div>
                <ImageUpload onImageUploaded={handleImageUploaded} />
            </div>

            <div className="absolute top-4 left-4">
                <CanvasManager onSave={handleCanvasSave} onLoad={handleCanvasLoad} onNew={handleNewCanvas} />
            </div>

            {canvasName && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium">{canvasName}</div>
                </div>
            )}

            {/* Editing toolbar at bottom center */}
            <EditingToolbar
                selectedImageId={selectedImageId}
                onEditSubmit={handleEditSubmit}
                onPencilClick={handlePencilClick}
                isProcessing={isProcessingEdit}
            />

            <EditHistorySidebar
                selectedImageId={selectedImageId}
                editHistory={editHistory}
                onRevertToEdit={handleRevertToEdit}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <DrawingModal
                isOpen={isDrawingModalOpen}
                onClose={() => setIsDrawingModalOpen(false)}
                onSave={handleDrawingModalSave}
            />
        </div>
    )
}
