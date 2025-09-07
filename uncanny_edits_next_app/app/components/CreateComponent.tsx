'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { createClient } from '@/app/utils/supabase/client'

const CreateComponent = () => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadedImageFilenames, setUploadedImageFilenames] = useState<string[]>([])
  const [primaryImage, setPrimaryImage] = useState<string | null>(null)
  const [primaryImageFilename, setPrimaryImageFilename] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const primaryFileInputRef = useRef<HTMLInputElement>(null)

  const handlePrimaryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsGenerating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setPrimaryImage(result.url)
      setPrimaryImageFilename(result.fileName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAdditionalImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsGenerating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setUploadedImages(prev => [...prev, result.url])
      setUploadedImageFilenames(prev => [...prev, result.fileName])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const payload: { 
        prompt: string; 
        output_format: string; 
        image_input?: string[]; 
        original_filenames?: string[] 
      } = {
        prompt: prompt.trim(),
        output_format: 'jpg'
      }

      // Include images with primary image first
      const allImages = []
      const allFilenames = []
      
      if (primaryImage) {
        allImages.push(primaryImage)
        allFilenames.push(primaryImageFilename || 'primary.jpg')
      }
      
      if (uploadedImages.length > 0) {
        allImages.push(...uploadedImages)
        allFilenames.push(...uploadedImageFilenames)
      }
      
      if (allImages.length > 0) {
        payload.image_input = allImages
        payload.original_filenames = allFilenames
      }

      const response = await fetch('/api/create-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Generation failed')
      }

      setGeneratedImage(result.image_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const clearAll = () => {
    setPrompt('')
    setGeneratedImage(null)
    setUploadedImages([])
    setUploadedImageFilenames([])
    setPrimaryImage(null)
    setPrimaryImageFilename(null)
    setError(null)
    setIsFocused(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (primaryFileInputRef.current) {
      primaryFileInputRef.current.value = ''
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    try {
      const supabase = createClient()
      
      // Extract the file path from the URL
      // Handle both public and private bucket URLs
      let bucket, filePath
      
      if (generatedImage.includes('/storage/v1/object/public/')) {
        // Public URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
        const urlParts = generatedImage.split('/storage/v1/object/public/')
        if (urlParts.length !== 2) {
          throw new Error('Invalid public image URL format')
        }
        const [bucketName, ...pathParts] = urlParts[1].split('/')
        bucket = bucketName
        filePath = pathParts.join('/')
      } else if (generatedImage.includes('/storage/v1/object/sign/')) {
        // Signed URL format: https://[project].supabase.co/storage/v1/object/sign/[bucket]/[path]
        const urlParts = generatedImage.split('/storage/v1/object/sign/')
        if (urlParts.length !== 2) {
          throw new Error('Invalid signed image URL format')
        }
        const [bucketName, ...pathParts] = urlParts[1].split('/')
        bucket = bucketName
        filePath = pathParts.join('/')
      } else {
        throw new Error('Unsupported image URL format')
      }
      
      // Download the file using Supabase client
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath)

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('No data received')
      }

      // Determine file extension from the original URL or default to jpg
      const fileExtension = filePath.split('.').pop()?.toLowerCase() || 'jpg'
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg'

      // Create a blob URL and trigger download
      const blob = new Blob([data], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `generated-image-${Date.now()}.${fileExtension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl min-h-screen flex flex-col">
      {/* Main Upload Area */}
      <div className="flex-1 flex items-center justify-center mb-8">
        <div className="w-full max-w-2xl">
          {generatedImage ? (
            <div className="flex justify-center flex-col items-center">
              <Image
                src={generatedImage}
                alt="Generated image"
                width={800}
                height={500}
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                style={{ maxHeight: '500px' }}
              />
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(generatedImage, '_blank')}
                  className="text-gray-700"
                >
                  Open in New Tab
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="text-gray-700"
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGeneratedImage(null)
                    setPrompt('')
                  }}
                  className="text-gray-700"
                >
                  Generate New
                </Button>
              </div>
            </div>
          ) : primaryImage ? (
            <div className="flex justify-center">
              <Image
                src={primaryImage}
                alt="Primary reference"
                width={800}
                height={500}
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg cursor-pointer"
                style={{ maxHeight: '500px' }}
                onClick={() => primaryFileInputRef.current?.click()}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center bg-gray-50/50">
              {/* Star Icon */}
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select an image to start<br />editing with natural language
              </h3>
              
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => primaryFileInputRef.current?.click()}
                  disabled={isGenerating}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  disabled={true}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Select Asset
                </Button>
              </div>
            </div>
          )}

          {/* Hidden file input for primary image */}
          <input
            ref={primaryFileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePrimaryImageUpload}
            className="hidden"
          />
        </div>
      </div>


      {/* Sticky Bottom Chat Interface */}
      <div className="sticky bottom-0 z-50 w-full flex justify-center">
        <div className="w-full max-w-4xl p-4">
          <div
            className={`border-2 border-border rounded-2xl w-full max-w-2xl mx-auto flex flex-col gap-4 p-3 relative transition-shadow ${
              isFocused ? 'ring-2 ring-primary border-primary shadow-lg' : 'shadow-sm'
            } bg-white`}
          >
            {/* Textarea with Generate Button */}
            <div className="relative flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  placeholder="Describe how you want to edit the image..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerateImage();
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={isGenerating}
                  className="min-h-[60px] w-full resize-none border-none text-gray-900 bg-transparent placeholder:text-gray-400 focus:outline-none"
                  rows={2}
                />
              </div>
              <Button
                onClick={handleGenerateImage}
                disabled={isGenerating || !prompt.trim()}
                className="bg-black text-white hover:bg-gray-800 w-12 h-12 rounded-lg mb-1 flex items-center justify-center p-0"
              >
                {isGenerating ? (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </Button>
            </div>

            {/* Bottom Row with Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating}
                  className="text-gray-700 bg-white border-gray-300"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Reference
                </Button>
                
                {uploadedImages.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {uploadedImages.length} reference image{uploadedImages.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={clearAll}
                  disabled={isGenerating}
                  size="sm"
                  className="text-gray-500 border-gray-300"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Hidden file input for additional images */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAdditionalImageUpload}
              className="hidden"
            />

            {/* Additional Reference Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-200">
                {uploadedImages.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    alt={`Reference ${index + 1}`}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded border"
                  />
                ))}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isGenerating && (
              <div className="flex items-center justify-center py-2 border-t border-gray-200">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                <span className="text-sm text-gray-600">
                  {primaryImage || uploadedImages.length > 0 ? 'Processing your images...' : 'Generating your image...'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateComponent