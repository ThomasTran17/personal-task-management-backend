import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Configuration
 * Configuration for optimization, transformation, and upload settings
 */

// Transform presets for different use cases
export const CLOUDINARY_TRANSFORMS = {
  // Avatar/Profile Image (optimized for web)
  avatar: {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto',
  },

  // Thumbnail (compact)
  thumbnail: {
    width: 150,
    height: 150,
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto',
  },

  // Task Image (responsive)
  taskImage: {
    width: 800,
    height: 600,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
    dpr: 'auto',
  },

  // Background Image (optimized for backgrounds)
  background: {
    width: 1920,
    height: 1080,
    crop: 'fill',
    quality: 'auto:best',
    fetch_format: 'auto',
  },

  // Mobile Responsive (optimized for mobile devices)
  mobile: {
    width: 400,
    crop: 'scale',
    quality: 'auto:good',
    fetch_format: 'auto',
  },

  // Icon (small)
  icon: {
    width: 64,
    height: 64,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  },
};

// Upload presets - default configuration for uploads
export const CLOUDINARY_UPLOAD_PRESETS = {
  // Documents
  documents: {
    folder: 'personal-task/documents',
    resource_type: 'auto',
    allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    max_file_size: 50000000, // 50MB
  },

  // Images
  images: {
    folder: 'personal-task/images',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    max_file_size: 10000000, // 10MB
    quality: 'auto:good',
    fetch_format: 'auto',
  },

  // Video
  videos: {
    folder: 'personal-task/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'avi', 'mov', 'webm'],
    max_file_size: 100000000, // 100MB
    eager: [
      { width: 300, height: 300, crop: 'pad', background: 'auto' },
    ],
  },

  // Avatar
  avatars: {
    folder: 'personal-task/avatars',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 5000000, // 5MB
    quality: 'auto:best',
  },

  // Task Images
  taskImages: {
    folder: 'personal-task/task-images',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    max_file_size: 20000000, // 20MB
    quality: 'auto',
  },
};

// Optimization presets
export const CLOUDINARY_OPTIMIZATION = {
  // Optimize image for web
  webImage: {
    quality: 'auto',
    fetch_format: 'auto',
    dpr: 'auto',
  },

  // Optimize image for mobile
  mobileImage: {
    quality: 'auto:good',
    fetch_format: 'auto',
    width: 400,
    crop: 'scale',
    dpr: 'auto',
  },

  // Optimize video
  video: {
    quality: 'auto',
    video_codec: 'auto',
    audio_codec: 'aac',
    bit_rate: 'auto',
  },

  // Optimize for thumbnails
  thumbnail: {
    quality: 'auto:good',
    fetch_format: 'auto',
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'auto',
  },
};

// Cloudinary SDK Configuration
export const setupCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return cloudinary;
};

/**
 * Helper function to create a transform URL
 * @param publicId - Public ID of resource on Cloudinary
 * @param transform - Transform object
 * @returns Transformed URL
 */
export const getTransformUrl = (publicId: string, transform: any) => {
  return cloudinary.url(publicId, transform);
};

/**
 * Helper function to create a URL with multiple transforms
 * @param publicId - Public ID of resource
 * @param transforms - Array of transform objects
 * @returns Transformed URL
 */
export const getMultiTransformUrl = (publicId: string, transforms: any[]) => {
  return cloudinary.url(publicId, {
    transformation: transforms,
  });
};
