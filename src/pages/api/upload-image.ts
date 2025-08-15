import type { APIRoute } from 'astro';
import { processAndUploadImage, generateImageFileName, getImageUrl } from '../../utils/imageUpload';

const MINIO_BUCKET = import.meta.env.MINIO_BUCKET;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const postId = formData.get('postId') as string;

    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Only image files are allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File size too large. Maximum size is 10MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate unique filename
    const currentPostId = postId || 'draft-' + Date.now();
    const fileName = generateImageFileName(currentPostId, imageFile.name);

    // Upload and process the image
    const uploadedFileName = await processAndUploadImage(imageFile, MINIO_BUCKET, fileName);

    // Get the public URL
    const imageUrl = getImageUrl(MINIO_BUCKET, uploadedFileName);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        fileName: uploadedFileName,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error uploading image:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({
        error: `Failed to upload image: ${errorMessage}`,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
