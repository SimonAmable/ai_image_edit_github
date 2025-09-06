import { createClient } from "@/app/utils/supabase/server"
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        // Use service role for server-side uploads to bypass RLS
        const supabase = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        const formData = await request.formData()
        const file = formData.get("file") as File

        console.log("Trying to upload file")
        if (!file) {
            console.log("NO IMAGE DETECTED")
            return NextResponse.json({ error: "No file provided" }, { status: 400 })

        }

        // Generate unique filename
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        console.log("File name: ", fileName)
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage.from("images").upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        })

        if (error) {
            console.error("Supabase upload error:", error)
            return NextResponse.json({ error: "Upload failed" }, { status: 500 })
        }

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(data.path)

        console.log("DONE UPLOADING")
        return NextResponse.json({
            url: publicUrl,
            filename: file.name,
            size: file.size,
            type: file.type,
        })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
