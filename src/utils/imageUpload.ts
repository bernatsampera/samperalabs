import { Client } from 'minio';
import sharp from 'sharp';

// MinIO client configuration
const minioClient = new Client({
  endPoint: import.meta.env.MINIO_ENDPOINT,
  useSSL: true,
  accessKey: import.meta.env.MINIO_ACCESS_KEY,
  secretKey: import.meta.env.MINIO_SECRET_KEY,
});

export type BucketType = 'samperalabs';

export async function processAndUploadImage(
  imageFile: File,
  bucketName: BucketType,
  fileName: string
): Promise<string> {
  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Process the image
  const processedImageBuffer = await sharp(buffer)
    .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90 })
    .toBuffer();

  // Upload to MinIO
  await minioClient.putObject(bucketName, fileName, processedImageBuffer);

  return fileName;
}

/**
 * Generates a unique filename for an uploaded image
 * @param postId - The ID or slug of the post
 * @param originalName - Original filename
 * @returns A unique filename
 */
export function generateImageFileName(postId: string, originalName: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const sanitizedPostId = postId.replace(/[^a-zA-Z0-9-_]/g, '-');
  const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'webp';

  return `${sanitizedPostId}-${timestamp}-${randomId}.${fileExtension}`;
}

/**
 * Gets the public URL for an uploaded image
 * @param bucketName - The MinIO bucket name
 * @param fileName - The uploaded filename
 * @returns The public URL for the image
 */
export function getImageUrl(bucketName: BucketType, fileName: string): string {
  const endpoint = import.meta.env.MINIO_ENDPOINT;
  const protocol = import.meta.env.MINIO_USE_SSL === 'false' ? 'http' : 'https';
  return `${protocol}://${endpoint}/${bucketName}/${fileName}`;
}

/**
 * Handles file upload for Tiptap editor
 * @param file - The file to upload
 * @param postId - The post ID or slug for naming
 * @param bucketName - The bucket to upload to
 * @returns Promise with the image URL
 */
export async function handleEditorImageUpload(
  file: File,
  postId: string,
  bucketName: BucketType = 'samperalabs'
): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB');
    }

    // Generate unique filename
    const fileName = generateImageFileName(postId, file.name);

    // Upload and process the image
    const uploadedFileName = await processAndUploadImage(file, bucketName, fileName);

    // Return the public URL
    return getImageUrl(bucketName, uploadedFileName);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
