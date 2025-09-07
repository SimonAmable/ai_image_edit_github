import { type NextRequest, NextResponse } from "next/server"

// Helper function to crop image using Canvas API (server-side)
async function cropImage(
  imageBuffer: ArrayBuffer, 
  cropData: { x: number; y: number; width: number; height: number }
): Promise<string> {
  // For server-side image processing, we'll use a simple approach
  // In a production environment, you might want to use a library like sharp
  
  // For now, we'll return the original image and let the AI handle the cropping
  // This is a placeholder - in production you'd implement actual image cropping
  return Buffer.from(imageBuffer).toString("base64")
}

interface EditImageRequest {
  imageUrl: string
  prompt: string
  tool: "crop" | "mask" | "pencil" | null
  maskData?: string // Base64 encoded mask for inpainting
  cropData?: { x: number; y: number; width: number; height: number } // Crop coordinates
  drawingPaths?: Array<{ x: number; y: number }[]> // Drawing paths for pencil tool
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt, tool, maskData, cropData, drawingPaths }: EditImageRequest = await request.json()

    if (!imageUrl || !prompt) {
      return NextResponse.json({ error: "Image URL and prompt are required" }, { status: 400 })
    }

    // Check for required environment variables
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
    const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1"
    const accessToken = process.env.GOOGLE_CLOUD_ACCESS_TOKEN

    if (!projectId || !accessToken) {
      return NextResponse.json(
        {
          error:
            "Google Cloud configuration missing. Please set GOOGLE_CLOUD_PROJECT_ID and GOOGLE_CLOUD_ACCESS_TOKEN environment variables.",
        },
        { status: 500 },
      )
    }

    // Fetch the original image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image")
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    let processedImageBase64 = Buffer.from(imageBuffer).toString("base64")

    // Handle cropping if crop data is provided
    if (tool === "crop" && cropData) {
      processedImageBase64 = await cropImage(imageBuffer, cropData)
    }

    // Prepare the API request based on the tool
    let apiEndpoint: string
    let requestBody: any

    if (tool === "mask" && maskData) {
      // Inpainting with mask
      apiEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`
      requestBody = {
        instances: [
          {
            prompt: prompt,
            image: {
              bytesBase64Encoded: processedImageBase64,
            },
            mask: {
              image: {
                bytesBase64Encoded: maskData,
              },
            },
          },
        ],
        parameters: {
          mode: "inpainting",
          sampleCount: 1,
        },
      }
    } else if (tool === "crop") {
      // For crop, we use the cropped image with editing prompt
      apiEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`
      requestBody = {
        instances: [
          {
            prompt: `Edit this cropped image: ${prompt}`,
            image: {
              bytesBase64Encoded: processedImageBase64,
            },
          },
        ],
        parameters: {
          mode: "inpainting",
          sampleCount: 1,
        },
      }
    } else {
      // General image editing
      apiEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`
      requestBody = {
        instances: [
          {
            prompt: `Edit this image: ${prompt}`,
            image: {
              bytesBase64Encoded: processedImageBase64,
            },
          },
        ],
        parameters: {
          mode: "inpainting",
          sampleCount: 1,
        },
      }
    }

    // Make the API call to Google Vertex AI
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Vertex AI API error:", errorText)
      throw new Error(`Google Vertex AI API error: ${response.status}`)
    }

    const result = await response.json()

    // Extract the generated image
    if (!result.predictions || !result.predictions[0] || !result.predictions[0].bytesBase64Encoded) {
      throw new Error("No image generated in response")
    }

    const generatedImageBase64 = result.predictions[0].bytesBase64Encoded

    // Upload the generated image to Blob storage
    const generatedImageBuffer = Buffer.from(generatedImageBase64, "base64")
    const generatedImageBlob = new Blob([generatedImageBuffer], { type: "image/png" })

    const uploadFormData = new FormData()
    uploadFormData.append("file", generatedImageBlob, `edited-${Date.now()}.png`)

    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload`, {
      method: "POST",
      body: uploadFormData,
    })

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload generated image")
    }

    const uploadResult = await uploadResponse.json()

    return NextResponse.json({
      success: true,
      editedImageUrl: uploadResult.url,
      originalPrompt: prompt,
      tool: tool,
    })
  } catch (error) {
    console.error("Image editing error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Image editing failed",
        details: "Please check your Google Cloud configuration and try again.",
      },
      { status: 500 },
    )
  }
}
