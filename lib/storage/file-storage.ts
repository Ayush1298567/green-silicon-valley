import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import sharp from "sharp";

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  compressImages?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  metadata?: Record<string, any>;
}

export class FileStorageService {
  private supabase = createClientComponentClient();
  private readonly bucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

  /**
   * Upload file with optimization and validation
   */
  async uploadFile(
    file: File,
    folder: string = 'general',
    options: FileUploadOptions = {}
  ): Promise<UploadedFile> {
    try {
      // Validate file
      await this.validateFile(file, options);

      // Process file (compress images, etc.)
      const processedFile = await this.processFile(file, options);

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileName = `${folder}/${timestamp}-${randomId}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(fileName);

      // Generate thumbnail for images
      let thumbnailUrl: string | undefined;
      if (this.isImageFile(file.type) && options.compressImages) {
        thumbnailUrl = await this.generateThumbnail(processedFile, fileName, folder);
      }

      // Create file record
      const uploadedFile: UploadedFile = {
        id: `${timestamp}-${randomId}`,
        name: fileName,
        originalName: file.name,
        size: processedFile.size,
        type: file.type,
        url: urlData.publicUrl,
        thumbnailUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'current-user', // Would be replaced with actual user ID
        metadata: {
          originalSize: file.size,
          processed: processedFile !== file,
          folder
        }
      };

      return uploadedFile;

    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    folder: string = 'general',
    options: FileUploadOptions = {}
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file
   */
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([fileName]);

      if (error) {
        console.error('File deletion error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(fileName: string): string {
    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  /**
   * List files in folder
   */
  async listFiles(folder: string = ''): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .list(folder, {
          limit: 100,
          offset: 0
        });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('List files error:', error);
      return [];
    }
  }

  /**
   * Validate file before upload
   */
  private async validateFile(file: File, options: FileUploadOptions): Promise<void> {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = []
    } = options;

    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.formatBytes(maxSize)}`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Additional security checks
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      throw new Error('Invalid file name');
    }
  }

  /**
   * Process file (compress images, etc.)
   */
  private async processFile(file: File, options: FileUploadOptions): Promise<File | Buffer> {
    const { compressImages = true, maxWidth = 1920, maxHeight = 1080, quality = 80 } = options;

    // If it's not an image or compression is disabled, return original
    if (!this.isImageFile(file.type) || !compressImages) {
      return file;
    }

    try {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Process with Sharp
      let sharpImage = sharp(buffer);

      // Get image metadata
      const metadata = await sharpImage.metadata();

      // Resize if too large
      if (metadata.width && metadata.width > maxWidth) {
        sharpImage = sharpImage.resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });
      }

      if (metadata.height && metadata.height > maxHeight) {
        sharpImage = sharpImage.resize(null, maxHeight, {
          withoutEnlargement: true,
          fit: 'inside'
        });
      }

      // Compress based on format
      let processedBuffer: Buffer;
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        processedBuffer = await sharpImage
          .jpeg({ quality, progressive: true })
          .toBuffer();
      } else if (file.type === 'image/png') {
        processedBuffer = await sharpImage
          .png({ quality, progressive: true })
          .toBuffer();
      } else if (file.type === 'image/webp') {
        processedBuffer = await sharpImage
          .webp({ quality })
          .toBuffer();
      } else {
        // For other formats, return original
        return file;
      }

      return processedBuffer;

    } catch (error) {
      console.error('Image processing error:', error);
      // Return original file if processing fails
      return file;
    }
  }

  /**
   * Generate thumbnail for images
   */
  private async generateThumbnail(
    fileBuffer: File | Buffer,
    originalFileName: string,
    folder: string
  ): Promise<string | undefined> {
    try {
      let buffer: Buffer;

      if (fileBuffer instanceof File) {
        const arrayBuffer = await fileBuffer.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        buffer = fileBuffer;
      }

      // Create thumbnail
      const thumbnailBuffer = await sharp(buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Generate thumbnail filename
      const baseName = originalFileName.replace(/\.[^/.]+$/, '');
      const thumbnailName = `${baseName}_thumb.jpg`;

      // Upload thumbnail
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .upload(thumbnailName, thumbnailBuffer, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Thumbnail upload error:', error);
        return undefined;
      }

      // Return thumbnail URL
      const { data } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(thumbnailName);

      return data.publicUrl;

    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return undefined;
    }
  }

  /**
   * Check if file is an image
   */
  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file upload presets for different use cases
   */
  static getUploadPresets(): Record<string, FileUploadOptions> {
    return {
      // Profile pictures
      avatar: {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        compressImages: true,
        maxWidth: 400,
        maxHeight: 400,
        quality: 85
      },

      // Presentation slides
      presentation: {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: [
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/pdf',
          'image/jpeg',
          'image/png'
        ],
        compressImages: true,
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 90
      },

      // General documents
      document: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ]
      },

      // Images and media
      media: {
        maxSize: 20 * 1024 * 1024, // 20MB
        allowedTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'video/mp4',
          'video/quicktime'
        ],
        compressImages: true,
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 85
      },

      // Resource downloads
      resource: {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: [
          'application/pdf',
          'application/zip',
          'application/x-zip-compressed',
          'image/jpeg',
          'image/png'
        ],
        compressImages: true,
        maxWidth: 1200,
        maxHeight: 800,
        quality: 90
      }
    };
  }
}

export const fileStorage = new FileStorageService();
