import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as crypto from 'crypto';

/**
 * Service to handle Upload, Optimize, and Transform with Cloudinary
 */
@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload file to Cloudinary
   * @param file - File buffer or stream
   * @param options - Upload options (folder, public_id, resource_type, etc)
   * @returns Upload response
   */
  async uploadFile(
    file: any,
    options: any = {},
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Upload file from URL
   * @param url - URL of the file
   * @param options - Upload options
   * @returns Upload response
   */
  async uploadFromUrl(
    url: string,
    options: any = {},
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return cloudinary.uploader.upload(url, options);
  }

  /**
   * Delete file from Cloudinary
   * @param publicId - Public ID of resource
   * @param options - Delete options
   */
  async deleteFile(publicId: string, options: any = {}) {
    return cloudinary.uploader.destroy(publicId, options);
  }

  /**
   * Rename file
   * @param fromPublicId - Current public ID
   * @param toPublicId - New public ID
   */
  async renameFile(fromPublicId: string, toPublicId: string) {
    return cloudinary.uploader.rename(fromPublicId, toPublicId);
  }

  /**
   * Get resource info
   * @param publicId - Public ID of resource
   */
  async getResourceInfo(publicId: string) {
    return cloudinary.api.resource(publicId);
  }

  /**
   * Transform URL with presets
   * @param publicId - Public ID
   * @param transform - Transform object
   * @returns Transformed URL
   */
  getTransformUrl(publicId: string, transform: any = {}): string {
    return cloudinary.url(publicId, transform);
  }

  /**
   * Transform URL with multiple transforms
   * @param publicId - Public ID
   * @param transforms - Array of transform objects
   * @returns Transformed URL
   */
  getMultiTransformUrl(publicId: string, transforms: any[]): string {
    return cloudinary.url(publicId, {
      transformation: transforms,
    });
  }

  /**
   * Get responsive URL (automatically resizes based on device)
   * @param publicId - Public ID
   * @param options - Transform options
   * @returns Responsive URL
   */
  getResponsiveUrl(publicId: string, options: any = {}): string {
    return cloudinary.url(publicId, {
      crop: 'scale',
      width: 'auto',
      dpr: 'auto',
      fetch_format: 'auto',
      quality: 'auto',
      ...options,
    });
  }

  /**
   * Get optimized thumbnail
   * @param publicId - Public ID
   * @param width - Width (default: 200)
   * @param height - Height (default: 200)
   * @returns Thumbnail URL
   */
  getThumbnailUrl(
    publicId: string,
    width: number = 200,
    height: number = 200,
  ): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good',
      fetch_format: 'auto',
    });
  }

  /**
   * Get avatar URL (optimized for profile images)
   * @param publicId - Public ID
   * @param size - Avatar size (default: 200)
   * @returns Avatar URL
   */
  getAvatarUrl(publicId: string, size: number = 200): string {
    return cloudinary.url(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto:best',
      fetch_format: 'auto',
    });
  }

  /**
   * Get optimized image for web
   * @param publicId - Public ID
   * @param width - Width (default: auto)
   * @param options - Additional options
   * @returns Optimized URL
   */
  getWebImage(
    publicId: string,
    width: number = 800,
    options: any = {},
  ): string {
    return cloudinary.url(publicId, {
      width,
      crop: 'scale',
      quality: 'auto',
      fetch_format: 'auto',
      dpr: 'auto',
      ...options,
    });
  }

  /**
   * Get optimized image for mobile
   * @param publicId - Public ID
   * @param width - Width (default: 400)
   * @returns Optimized URL
   */
  getMobileImage(publicId: string, width: number = 400): string {
    return cloudinary.url(publicId, {
      width,
      crop: 'scale',
      quality: 'auto:good',
      fetch_format: 'auto',
      dpr: 'auto',
    });
  }

  /**
   * Get multiple optimized URLs (responsive set)
   * @param publicId - Public ID
   * @returns Object containing URLs for different screen sizes
   */
  getResponsiveImageSet(publicId: string): Record<string, string> {
    const sizes = {
      mobile: 400,
      tablet: 768,
      desktop: 1024,
      large: 1400,
    };

    const result = {};
    for (const [key, width] of Object.entries(sizes)) {
      result[key] = cloudinary.url(publicId, {
        width,
        crop: 'scale',
        quality: 'auto',
        fetch_format: 'auto',
      });
    }

    return result;
  }

  /**
   * Batch delete resources
   * @param publicIds - Array of public IDs
   */
  async deleteMultiple(publicIds: string[]) {
    return cloudinary.api.delete_resources(publicIds);
  }

  /**
   * List resources in folder
   * @param folder - Folder path
   * @param options - Additional options
   */
  async listResources(folder: string, options: any = {}) {
    return cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      ...options,
    });
  }

  /**
   * Create signed URL (requires API secret for signing)
   * @param publicId - Public ID
   * @param expiresIn - Expiration time (seconds)
   * @returns Signed URL
   */
  getSignedUrl(publicId: string, expiresIn: number = 3600): string {
    const timestamp = Math.round(new Date().getTime() / 1000) + expiresIn;
    const auth_token = crypto
      .createHash('sha256')
      .update(`public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
      .digest('hex');

    return cloudinary.url(publicId, {
      sign_url: true,
      auth_token,
      timestamp,
    });
  }
}
