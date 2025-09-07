"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { api } from "@/app/utils/api-client"
// Simple modal components
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
                {children}
            </div>
        </div>
    )
}
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
            console.log("Loading canvases...")
            const data = await api.get<{ canvases: Canvas[] }>("/api/canvas/list")
            console.log("Response data:", data)
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
            console.log("Saving canvas with name:", saveName.trim())
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

            <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(true)}>
                <Save className="w-4 h-4 mr-1" />
                Save
            </Button>

            <Modal isOpen={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
                <h2 className="text-lg font-semibold mb-4">Save Canvas</h2>
                <div className="space-y-4">
                    <Input
                        placeholder="Canvas name"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    />
                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={!saveName.trim() || isLoading}>
                            {isLoading ? "Saving..." : "Save Canvas"}
                        </Button>
                        <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            <Button variant="outline" size="sm" onClick={() => setLoadDialogOpen(true)}>
                <FolderOpen className="w-4 h-4 mr-1" />
                Load
            </Button>

            <Modal isOpen={loadDialogOpen} onClose={() => setLoadDialogOpen(false)}>
                <h2 className="text-lg font-semibold mb-4">Load Canvas</h2>
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
                <div className="mt-4">
                    <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
