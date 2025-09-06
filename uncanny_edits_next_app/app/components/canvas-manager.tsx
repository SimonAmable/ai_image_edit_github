"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog"
import { Save, FolderOpen, Plus } from "lucide-react"

interface Canvas {
    id: string
    name: string
    created_at: string
    updated_at: string
}

interface CanvasManagerProps {
    onSave: (name: string) => void
    onLoad: (canvasId: string) => void
    onNew: () => void
}

export function CanvasManager({ onSave, onLoad, onNew }: CanvasManagerProps) {
    const [canvases, setCanvases] = useState<Canvas[]>([])
    const [saveName, setSaveName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [loadDialogOpen, setLoadDialogOpen] = useState(false)

    const loadCanvases = async () => {
        try {
            const response = await fetch("/api/canvas/list")
            const data = await response.json()
            if (data.canvases) {
                setCanvases(data.canvases)
            }
        } catch (error) {
            console.error("Failed to load canvases:", error)
        }
    }

    useEffect(() => {
        loadCanvases()
    }, [])

    const handleSave = async () => {
        if (!saveName.trim()) return

        setIsLoading(true)
        try {
            await onSave(saveName.trim())
            setSaveName("")
            setSaveDialogOpen(false)
            await loadCanvases()
        } catch (error) {
            console.error("Save failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLoad = async (canvasId: string) => {
        setIsLoading(true)
        try {
            await onLoad(canvasId)
            setLoadDialogOpen(false)
        } catch (error) {
            console.error("Load failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            <Button onClick={onNew} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New
            </Button>

            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Save className="w-4 h-4 mr-1" />
                        Save
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Canvas</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Canvas name"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        />
                        <Button onClick={handleSave} disabled={!saveName.trim() || isLoading}>
                            {isLoading ? "Saving..." : "Save Canvas"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <FolderOpen className="w-4 h-4 mr-1" />
                        Load
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Load Canvas</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {canvases.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No saved canvases</p>
                        ) : (
                            canvases.map((canvas) => (
                                <div
                                    key={canvas.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                                    onClick={() => handleLoad(canvas.id)}
                                >
                                    <div>
                                        <p className="font-medium">{canvas.name}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(canvas.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
