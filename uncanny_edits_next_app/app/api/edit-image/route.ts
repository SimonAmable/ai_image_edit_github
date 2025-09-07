import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { createClient } from "@/app/utils/supabase/server"



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
     // Get authenticated user
     const supabase = await createClient()
     const { data: { user }, error: authError } = await supabase.auth.getUser()
     
     // If JWT validation fails, try to extract user ID from the cookie directly
     let userId = user?.id
     
     if (!userId) {
       const cookieHeader = request.headers.get('cookie')
       if (cookieHeader) {
         try {
           // Extract user ID from the Supabase auth cookie
           const authCookieMatch = cookieHeader.match(/sb-[^-]+-auth-token\.0=([^;]+)/)
           if (authCookieMatch) {
             const cookieValue = authCookieMatch[1]
             // Remove 'base64-' prefix if present
             const base64Data = cookieValue.startsWith('base64-') ? cookieValue.substring(7) : cookieValue
             const decodedData = JSON.parse(Buffer.from(base64Data, 'base64').toString())
             userId = decodedData.user?.id
           }
         } catch (error) {
           console.log("Edit-image route - failed to extract user ID from cookie:", error)
         }
       }
     }
     
     if (!userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }

     const { imageUrl, prompt, tool, maskData, cropData, drawingPaths }: EditImageRequest = await request.json()

     console.log("[TEXT]: imageUrl", imageUrl)
     console.log("[TEXT]: prompt", prompt)
     console.log("[TEXT]: user", userId)

     if (!imageUrl || !prompt) {
       return NextResponse.json({ error: "Image URL and prompt are required" }, { status: 400 })
     }

     const client = new GoogleGenAI({})


    // Fetch the original image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image")
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBase64 = Buffer.from(imageBuffer).toString("base64")
    
    // Handle cropping if crop data is provided
    let processedImageBase64 = imageBase64
    if (tool === "crop" && cropData) {
      processedImageBase64 = await cropImage(imageBuffer, cropData)
    }

    // Prepare the prompt based on the tool
    let finalPrompt = prompt

    if (tool === "crop" && cropData) {
      finalPrompt = `Edit this cropped image according to the prompt: ${prompt}. Focus on the cropped area.`
    } else if (tool === "mask" && maskData) {
      finalPrompt = `Edit this image according to the prompt: ${prompt}. Pay special attention to the masked areas.`
    } else if (tool === "pencil" && drawingPaths) {
      finalPrompt = `Edit this image according to the prompt: ${prompt}. Consider the drawn paths as guidance for the edit.`
    } else {
      finalPrompt = `Edit this image according to the prompt: ${prompt}`
    }

    // Convert base64 image to the format expected by Google GenAI
    const imageData = {
      inlineData: {
        data: processedImageBase64,
        mimeType: imageResponse.headers.get("content-type") || "image/png"
      }
    }

    // Generate content using Google GenAI Nano Banana model
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: [finalPrompt, imageData]
    })

    // Extract the generated image from the response
    let generatedImageBase64: string | null = null

    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageBase64 = part.inlineData.data
          break
        }
      }
    }

    if (!generatedImageBase64) {
      throw new Error("No image generated in response")
    }

    // Upload the generated image to Blob storage
    const generatedImageBuffer = Buffer.from(generatedImageBase64, "base64")
    const generatedImageBlob = new Blob([generatedImageBuffer], { type: "image/png" })

    const uploadFormData = new FormData()
    uploadFormData.append("file", generatedImageBlob, `edited-${Date.now()}.png`)

    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload`, {
      method: "POST",
      body: uploadFormData,
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
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
        details: "Please check your Google API key and try again.",
      },
      { status: 500 },
    )
  }
}
