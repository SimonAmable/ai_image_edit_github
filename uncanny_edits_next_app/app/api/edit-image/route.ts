import { type NextRequest, NextResponse } from "next/server"

interface EditImageRequest {
  imageUrl: string
  prompt: string
  tool: "crop" | "mask" | null
  maskData?: string // Base64 encoded mask for inpainting
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt, tool, maskData }: EditImageRequest = await request.json()

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
    const imageBase64 = Buffer.from(imageBuffer).toString("base64")

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
              bytesBase64Encoded: imageBase64,
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
      // Outpainting for crop-like functionality
      apiEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`
      requestBody = {
        instances: [
          {
            prompt: prompt,
            image: {
              bytesBase64Encoded: imageBase64,
            },
          },
        ],
        parameters: {
          mode: "outpainting",
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
              bytesBase64Encoded: imageBase64,
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
