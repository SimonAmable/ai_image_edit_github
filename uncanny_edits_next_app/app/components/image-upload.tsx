"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"

interface ImageUploadProps {
    onImageUploaded: (imageData: {
        url: string
        filename: string
        width: number
        height: number
    }) => void
}

export function ImageUpload({ onImageUploaded }: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
            // Create FormData for upload
            const formData = new FormData()
            formData.append("file", file)

            // Upload to Blob storage
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            const result = await response.json()

            // Get image dimensions
            const img = new Image()
            img.onload = () => {
                onImageUploaded({
                    url: result.url,
                    filename: result.filename,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                })
            }
            img.src = result.url

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        } catch (error) {
            console.error("Upload error:", error)
        } finally {
            setIsUploading(false)
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            <Button
                onClick={handleUploadClick}
                disabled={isUploading}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
            >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
        </>
    )
}
