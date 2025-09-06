"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Crop, Scissors, Send, Loader2, Pencil } from "lucide-react"

interface EditingToolbarProps {
    selectedImageId: string | null
    onEditSubmit: (prompt: string, tool: "crop" | "mask" | "pencil" | null) => void
    onPencilClick: () => void
    isProcessing: boolean
}

export function EditingToolbar({ selectedImageId, onEditSubmit, onPencilClick, isProcessing }: EditingToolbarProps) {
    const [prompt, setPrompt] = useState("")
    const [activeTool, setActiveTool] = useState<"crop" | "mask" | "pencil" | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!prompt.trim() || !selectedImageId) return

        onEditSubmit(prompt.trim(), activeTool)
        setPrompt("")
        setActiveTool(null)
    }

    const handleToolSelect = (tool: "crop" | "mask") => {
        if (!selectedImageId) return
        setActiveTool(activeTool === tool ? null : tool)
    }

    const handlePencilClick = () => {
        onPencilClick()
        setActiveTool("pencil")
    }

    return (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg p-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={activeTool === "pencil" ? "default" : "outline"}
                            size="sm"
                            onClick={handlePencilClick}
                            disabled={isProcessing}
                            className="gap-2"
                        >
                            <Pencil className="h-4 w-4" />
                            Draw
                        </Button>

                        <Button
                            type="button"
                            variant={activeTool === "crop" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToolSelect("crop")}
                            disabled={!selectedImageId || isProcessing}
                            className="gap-2"
                        >
                            <Crop className="h-4 w-4" />
                            Crop
                        </Button>

                        <Button
                            type="button"
                            variant={activeTool === "mask" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToolSelect("mask")}
                            disabled={!selectedImageId || isProcessing}
                            className="gap-2"
                        >
                            <Scissors className="h-4 w-4" />
                            Mask
                        </Button>
                    </div>

                    {/* Text input */}
                    <div className="flex-1 min-w-[400px]">
                        <Input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={
                                selectedImageId ? "Describe the edit you want to make..." : "Select an image to start editing"
                            }
                            disabled={!selectedImageId || isProcessing}
                            className="text-center"
                        />
                    </div>

                    {/* Send button */}
                    <Button type="submit" disabled={!prompt.trim() || !selectedImageId || isProcessing} className="gap-2">
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {isProcessing ? "Processing..." : "Send"}
                    </Button>
                </form>

                {/* Tool status indicator */}
                {activeTool && selectedImageId && (
                    <div className="mt-2 text-sm text-muted-foreground text-center">
                        {activeTool === "crop"
                            ? "Crop tool active - click and drag to select area"
                            : activeTool === "mask"
                                ? "Mask tool active - paint over areas to mask"
                                : "Draw tool active - draw on the image to mark areas for editing"}
                    </div>
                )}

                {activeTool === "pencil" && !selectedImageId && (
                    <div className="mt-2 text-sm text-muted-foreground text-center">
                        Drawing mode - create a new drawing or select an image to draw on it
                    </div>
                )}

                {!selectedImageId && !activeTool && (
                    <div className="mt-2 text-sm text-muted-foreground text-center">
                        Upload and select an image to start editing
                    </div>
                )}
            </div>
        </div>
    )
}
