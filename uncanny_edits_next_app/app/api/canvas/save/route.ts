import { createClient } from "@/app/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { name, zoomLevel, panX, panY, images } = await request.json()

    // Create or update canvas
    const { data: canvas, error: canvasError } = await supabase
      .from("canvases")
      .upsert({
        name,
        zoom_level: zoomLevel,
        pan_x: panX,
        pan_y: panY,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (canvasError) {
      console.error("Canvas save error:", canvasError)
      return NextResponse.json({ error: "Failed to save canvas" }, { status: 500 })
    }

    // Delete existing images for this canvas
    await supabase.from("canvas_images").delete().eq("canvas_id", canvas.id)

    // Save images
    if (images && images.length > 0) {
      const { error: imagesError } = await supabase.from("canvas_images").insert(
        images.map((img: any) => ({
          canvas_id: canvas.id,
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
