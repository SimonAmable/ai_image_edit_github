import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import Replicate from 'replicate';
// Google Gemini 2.5 Flash Image API integration
// Model: google/nano-banana
// Handles image generation and editing with multi-image fusion capabilities

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if Replicate API token is configured
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('User:', user);
    console.log('Auth Error:', authError);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    // Validate required inputs
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Extract parameters
    const { prompt, image_input, original_filenames, output_format = 'jpg' } = body;

    // Validate image_input if provided
    if (image_input && !Array.isArray(image_input)) {
      return NextResponse.json(
        { error: 'image_input must be an array' },
        { status: 400 }
      );
    }

    // Validate original_filenames if provided
    if (original_filenames && !Array.isArray(original_filenames)) {
      return NextResponse.json(
        { error: 'original_filenames must be an array' },
        { status: 400 }
      );
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Prepare the input for Replicate API (following the docs format)
    const input = {
      prompt: prompt,
      ...(image_input && image_input.length > 0 && { image_input: image_input })
    };

    console.log('Replicate input:', JSON.stringify(input, null, 2));

    // Call Replicate API using the SDK
    const output = await replicate.run("google/nano-banana", { input });

    console.log('Replicate output:', output);

    // Extract the output URL - it should be an array with the image URL
    const outputUrl = Array.isArray(output) ? output[0] : output;

    // TODO: Save image to storage and database
    // This would involve:
    // 1. Downloading the image from the output URL
    // 2. Uploading to your storage service (e.g., Supabase Storage)
    // 3. Saving metadata to your database
    // 4. Returning the stored image URL
    // Download the image from the output URL
    const imageResponse = await fetch(outputUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageFile = new File([imageBuffer], `generated-image-${Date.now()}.png`, {
      type: 'image/png'
    });

    // Upload to Supabase Storage
    const fileName = `${user.id}/generated-images/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageFile, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get the signed URL for private bucket
    const { data: signedUrlData } = await supabase.storage
      .from('images')
      .createSignedUrl(fileName, 3600); // 1 hour expiry

    if (!signedUrlData?.signedUrl) {
      throw new Error('Failed to create signed URL');
    }

    // Save metadata to database (optional - continue if table doesn't exist)
    try {
      // Use the first original filename if available, otherwise use the output URL
      const originalFilePath = original_filenames && original_filenames.length > 0 
        ? original_filenames[0] 
        : outputUrl;

      const { data: dbData, error: dbError } = await supabase
        .from('generations')
        .insert({
          version: 1,
          prompt: prompt,
          filepath: fileName,
          user_id: user.id,
        //   session_id: session_id, //add suport for sessions later
          original_filepath: originalFilePath,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        console.log('Database data:', dbData);
        console.log('Database error:', dbError);

      if (dbError) {
        console.error('Database save error:', dbError);
        // Continue execution even if DB save fails
      }
    } catch (dbError) {
      console.error('Database table may not exist:', dbError);
      // Continue execution even if DB save fails
    }

    // Use the stored image URL instead of the original
    const finalImageUrl = signedUrlData.signedUrl;

    return NextResponse.json({
      success: true,
      image_url: finalImageUrl,
      prompt: prompt,
      output_format: output_format
    });

  } catch (error) {
    console.error('Image creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create images.' },
    { status: 405 }
  );
}
