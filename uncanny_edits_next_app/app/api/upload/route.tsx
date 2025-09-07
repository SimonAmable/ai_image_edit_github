import { createClient } from "@/app/utils/supabase/server"
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        console.log("Upload route - request headers:", Object.fromEntries(request.headers.entries()))
        
        // Get authenticated user
        const supabase = await createClient()
        
        // Try to get the user from the JWT token
        const authHeader = request.headers.get('authorization')
        const cookieHeader = request.headers.get('cookie')
        
        console.log("Upload route - auth headers:", { 
            hasAuthHeader: !!authHeader,
            hasCookieHeader: !!cookieHeader,
            cookieLength: cookieHeader?.length || 0
        })
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        console.log("Upload route - auth check:", { 
            user: user?.id, 
            userEmail: user?.email,
            error: authError,
            hasUser: !!user,
            errorCode: authError?.code,
            errorMessage: authError?.message
        })
        
        // If JWT validation fails, try to extract user ID from the cookie directly
        let userId = user?.id
        
        if (!userId && cookieHeader) {
            try {
                // Extract user ID from the Supabase auth cookie
                const authCookieMatch = cookieHeader.match(/sb-[^-]+-auth-token\.0=([^;]+)/)
                if (authCookieMatch) {
                    const cookieValue = authCookieMatch[1]
                    // Remove 'base64-' prefix if present
                    const base64Data = cookieValue.startsWith('base64-') ? cookieValue.substring(7) : cookieValue
                    const decodedData = JSON.parse(Buffer.from(base64Data, 'base64').toString())
                    userId = decodedData.user?.id
                    console.log("Upload route - extracted user ID from cookie:", userId)
                }
            } catch (error) {
                console.log("Upload route - failed to extract user ID from cookie:", error)
            }
        }
        
        if (!userId) {
            console.log("Upload route - unauthorized: no user ID found")
            return NextResponse.json({ 
                error: "Unauthorized", 
                details: "No user ID found in request",
                debug: { 
                    authError: authError?.message,
                    errorCode: authError?.code,
                    hasUser: !!user,
                    hasUserId: !!userId
                }
            }, { status: 401 })
        }

        // Use service role for server-side uploads to bypass RLS
        const serviceSupabase = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        console.log("Upload route - environment check:", {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "..."
        })
        
        const formData = await request.formData()
        const file = formData.get("file") as File

        console.log("Trying to upload file for user:", userId)
        if (!file) {
            console.log("NO IMAGE DETECTED")
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Generate unique filename with user-specific path
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const userFilePath = `${userId}/images/${fileName}`

        console.log("File path: ", userFilePath)
        
        // Upload to Supabase Storage with user-specific path
        const { data, error } = await serviceSupabase.storage
            .from("images")
            .upload(userFilePath, file, {
                cacheControl: "3600",
                upsert: false,
            })

        if (error) {
            console.error("Supabase upload error:", error)
            return NextResponse.json({ error: "Upload failed" }, { status: 500 })
        }

         // Create a signed URL for private bucket access (expires in 24 hours)
         const { data: signedUrlData, error: signedUrlError } = await serviceSupabase.storage
         .from("images")
         .createSignedUrl(data.path, 86400) // 24 hours

     if (signedUrlError) {
         console.error("Signed URL creation error:", signedUrlError)
         return NextResponse.json({ error: "Failed to create signed URL" }, { status: 500 })
     }

     console.log("DONE UPLOADING")
     console.log("signed url: ", signedUrlData.signedUrl)
     
        return NextResponse.json({
            url: signedUrlData.signedUrl,
            filename: file.name,
            size: file.size,
            type: file.type,
            path: userFilePath,
        })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
