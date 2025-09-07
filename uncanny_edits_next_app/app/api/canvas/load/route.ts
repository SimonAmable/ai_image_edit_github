import { createClient } from "@/app/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const canvasId = searchParams.get("id")

    if (!canvasId) {
      return NextResponse.json({ error: "Canvas ID required" }, { status: 400 })
    }

    // Load canvas - only if it belongs to the authenticated user
    const { data: canvas, error: canvasError } = await supabase
      .from("canvases")
      .select("*")
      .eq("id", canvasId)
      .eq("user_id", user.id)
      .single()

    if (canvasError) {
      console.error("Canvas load error:", canvasError)
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 })
    }

    // Load images - only for this canvas and user
    const { data: images, error: imagesError } = await supabase
      .from("canvas_images")
      .select("*")
      .eq("canvas_id", canvasId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (imagesError) {
      console.error("Images load error:", imagesError)
      return NextResponse.json({ error: "Failed to load images" }, { status: 500 })
    }

    return NextResponse.json({
      canvas: {
        id: canvas.id,
        name: canvas.name,
        zoomLevel: canvas.zoom_level,
        panX: canvas.pan_x,
        panY: canvas.pan_y,
      },
      images: images.map((img) => ({
        id: img.id,
        url: img.image_url,
        filename: img.filename,
        x: img.x,
        y: img.y,
        width: img.width,
        height: img.height,
      })),
    })
  } catch (error) {
    console.error("Load error:", error)
    return NextResponse.json({ error: "Load failed" }, { status: 500 })
  }
}
