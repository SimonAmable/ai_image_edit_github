import { createClient } from "@/app/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only get canvases for the authenticated user
    const { data: canvases, error } = await supabase
      .from("canvases")
      .select("id, name, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Canvas list error:", error)
      return NextResponse.json({ error: "Failed to load canvases" }, { status: 500 })
    }

    return NextResponse.json({ canvases })
  } catch (error) {
    console.error("List error:", error)
    return NextResponse.json({ error: "List failed" }, { status: 500 })
  }
}
