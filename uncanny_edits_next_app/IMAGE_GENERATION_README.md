# AI Image Generation Feature

This feature provides a complete image generation system using AI with optional image inputs.

## Features

- **Text-to-Image Generation**: Generate images from text prompts
- **Image-to-Image Generation**: Upload reference images to influence the generation
- **Real-time Processing**: Live status updates during generation
- **Image Management**: Upload, preview, and download generated images
- **Error Handling**: Comprehensive error handling and user feedback

## API Routes

### `/api/create-image` (POST)
Generates images using Google Gemini 2.5 Flash Image API via Replicate.

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "image_input": ["https://example.com/image1.jpg"], // Optional array of image URLs
  "output_format": "jpg" // Optional, defaults to "jpg"
}
```

**Response:**
```json
{
  "success": true,
  "image_url": "https://supabase-storage-url/generated-image.png",
  "prompt": "A beautiful sunset over mountains",
  "output_format": "jpg"
}
```

### `/api/upload-image` (POST)
Uploads images to Supabase Storage for use as reference images.

**Request:** FormData with `image` field containing the file

**Response:**
```json
{
  "success": true,
  "url": "https://supabase-storage-url/uploaded-image.jpg",
  "fileName": "user-id/timestamp-random.png",
  "size": 1024000,
  "type": "image/jpeg"
}
```

## Environment Variables Required

```env
REPLICATE_API_TOKEN=your_replicate_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

The system expects a `generated_images` table (optional):

```sql
CREATE TABLE generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  output_format TEXT DEFAULT 'jpg',
  image_url TEXT NOT NULL,
  original_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Storage

Images are stored in Supabase Storage under the `images` bucket with the following structure:
- `{user_id}/generated-images/{timestamp}-{random}.png` - Generated images
- `{user_id}/{timestamp}-{random}.{ext}` - Uploaded reference images

## Usage

1. Navigate to `/create` page
2. Optionally upload reference images
3. Enter a text prompt describing the desired image
4. Click "Generate Image"
5. View, download, or share the generated image

## Error Handling

The system handles various error scenarios:
- Authentication failures
- Invalid file types
- API rate limits
- Network errors
- Storage failures

All errors are displayed to the user with helpful messages.
