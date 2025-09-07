import { createClient } from "@/app/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { name, zoomLevel, panX, panY, images } = await request.json()

    // Create or update canvas - ensure user_id is set
    const { data: canvas, error: canvasError } = await supabase
      .from("canvases")
      .upsert({
        name,
        zoom_level: zoomLevel,
        pan_x: panX,
        pan_y: panY,
        user_id: user.id, // Ensure canvas belongs to authenticated user
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (canvasError) {
      console.error("Canvas save error:", canvasError)
      return NextResponse.json({ error: "Failed to save canvas" }, { status: 500 })
    }

    // Delete existing images for this canvas and user
    await supabase
      .from("canvas_images")
      .delete()
      .eq("canvas_id", canvas.id)
      .eq("user_id", user.id)

    // Save images - ensure user_id is set for each image
    if (images && images.length > 0) {
      const { error: imagesError } = await supabase.from("canvas_images").insert(
        images.map((img: { url: string; filename: string; x: number; y: number; width: number; height: number }) => ({
          canvas_id: canvas.id,
          user_id: user.id, // Ensure image belongs to authenticated user
          image_url: img.url,
          filename: img.filename,
          x: img.x,
          y: img.y,
          width: img.width,
          height: img.height,
        })),
      )

      if (imagesError) {
        console.error("Images save error:", imagesError)
        return NextResponse.json({ error: "Failed to save images" }, { status: 500 })
      }
    }

    return NextResponse.json({ canvasId: canvas.id, message: "Canvas saved successfully" })
  } catch (error) {
    console.error("Save error:", error)
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
}
