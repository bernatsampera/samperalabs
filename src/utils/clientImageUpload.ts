/**
 * Client-side image upload utility that communicates with the server API
 */

export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  fileName?: string;
  error?: string;
}

/**
 * Uploads an image file to the server via the API endpoint
 * @param file - The image file to upload
 * @param postId - The post ID for organizing uploads
 * @returns Promise with upload response
 */
export async function uploadImageToServer(file: File, postId?: string): Promise<UploadResponse> {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    if (postId) {
      formData.append('postId', postId);
    }

    // Send to API endpoint
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Creates a loading placeholder while image is uploading
 * @param fileName - The original file name
 * @returns Loading text
 */
export function createLoadingText(fileName: string): string {
  return `⏳ Uploading ${fileName}...`;
}

/**
 * Creates an error message for failed uploads
 * @param error - The error message
 * @returns Formatted error text
 */
export function createErrorText(error: string): string {
  return `❌ Upload failed: ${error}`;
}
