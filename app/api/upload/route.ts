import { NextRequest, NextResponse } from 'next/server';
import { fileStorage, FileStorageService } from '@/lib/storage/file-storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';
    const preset = formData.get('preset') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get upload preset
    const presets = FileStorageService.getUploadPresets();
    const options = presets[preset] || presets.general;

    // Upload file with optimization
    const uploadedFile = await fileStorage.uploadFile(file, folder, options);

    return NextResponse.json({
      success: true,
      file: uploadedFile
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    const success = await fileStorage.deleteFile(fileName);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Deletion failed' },
      { status: 500 }
    );
  }
}
