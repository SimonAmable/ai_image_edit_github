"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/app/components/ui/scroll-area"
import { Badge } from "@/app/components/ui/badge"
import { History, ChevronRight, ChevronLeft, Undo2, Clock, AlertCircle } from "lucide-react"

interface EditHistoryItem {
    id: string
    timestamp: Date
    prompt: string
    tool: "crop" | "mask" | "pencil" | null
    resultUrl?: string
    status: "pending" | "completed" | "failed"
    error?: string
}

interface EditHistorySidebarProps {
    selectedImageId: string | null
    editHistory: Record<string, EditHistoryItem[]>
    onRevertToEdit: (imageId: string, editId: string) => void
    isCollapsed: boolean
    onToggleCollapse: () => void
}

export function EditHistorySidebar({
    selectedImageId,
    editHistory,
    onRevertToEdit,
    isCollapsed,
    onToggleCollapse,
}: EditHistorySidebarProps) {
    const currentHistory = selectedImageId ? editHistory[selectedImageId] || [] : []

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const getStatusColor = (status: EditHistoryItem["status"]) => {
        switch (status) {
            case "completed":
                return "bg-green-500/10 text-green-700 border-green-200"
            case "pending":
                return "bg-yellow-500/10 text-yellow-700 border-yellow-200"
            case "failed":
                return "bg-red-500/10 text-red-700 border-red-200"
            default:
                return "bg-muted text-muted-foreground"
        }
    }

    const getToolIcon = (tool: "crop" | "mask" | "pencil" | null) => {
        switch (tool) {
            case "crop":
                return "🔲"
            case "mask":
                return "✂️"
            case "pencil":
                return "✏️"
            default:
                return "✨"
        }
    }

    if (isCollapsed) {
        return (
            <div className="absolute top-20 left-4 z-20">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleCollapse}
                    className="bg-background/80 backdrop-blur-sm gap-2"
                >
                    <History className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className="absolute top-20 left-4 bottom-20 w-80 z-20">
            <div className="bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        <h3 className="font-semibold">Edit History</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {!selectedImageId ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Select an image to view its edit history</p>
                        </div>
                    ) : currentHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                            <History className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No edits yet</p>
                            <p className="text-sm text-muted-foreground mt-2">Use the editing tools below to start making changes</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-3">
                                {currentHistory
                                    .slice()
                                    .reverse()
                                    .map((edit, index) => (
                                        <div key={edit.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{getToolIcon(edit.tool)}</span>
                                                    <Badge variant="outline" className={getStatusColor(edit.status)}>
                                                        {edit.status}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground">{formatTime(edit.timestamp)}</div>
                                            </div>

                                            <p className="text-sm mb-3 line-clamp-2">{edit.prompt}</p>

                                            {edit.tool && (
                                                <div className="text-xs text-muted-foreground mb-2">
                                                    Tool: {edit.tool.charAt(0).toUpperCase() + edit.tool.slice(1)}
                                                </div>
                                            )}

                                            {edit.status === "failed" && edit.error && (
                                                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 mb-2">
                                                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                    <span>{edit.error}</span>
                                                </div>
                                            )}

                                            {edit.status === "completed" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onRevertToEdit(selectedImageId, edit.id)}
                                                    className="w-full gap-2"
                                                >
                                                    <Undo2 className="h-3 w-3" />
                                                    Revert to this edit
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </div>
        </div>
    )
}
