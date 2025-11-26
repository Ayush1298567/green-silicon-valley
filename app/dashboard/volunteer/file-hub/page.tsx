"use client";
import { useState, useEffect } from "react";
import { Upload, Download, FileText, Image, Video, File, Trash2, Eye, Calendar, User, FolderOpen, Plus } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface FileItem {
  id: string;
  name: string;
  type: 'presentation' | 'image' | 'video' | 'document' | 'other';
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  category: string;
  presentationId?: string;
  description?: string;
}

interface PresentationTemplate {
  id: string;
  name: string;
  version: string;
  description: string;
  fileUrl: string;
  fileSize: number;
  updatedAt: string;
  isCurrent: boolean;
}

export default function FileHubPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [templates, setTemplates] = useState<PresentationTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'my-files' | 'templates'>('my-files');
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dragActive, setDragActive] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadFiles();
    loadTemplates();
  }, []);

  const loadFiles = async () => {
    try {
      // In production, this would load from the database
      // For now, we'll use sample data
      const sampleFiles: FileItem[] = [
        {
          id: '1',
          name: 'Environmental STEM Presentation - Grade 3.pptx',
          type: 'presentation',
          fileUrl: '/sample-files/presentation.pptx',
          fileSize: 2457600, // 2.4MB
          uploadedAt: '2024-01-15T10:30:00Z',
          uploadedBy: 'Current User',
          category: 'presentations',
          presentationId: 'pres-001',
          description: 'Complete presentation for 3rd grade environmental science'
        },
        {
          id: '2',
          name: 'Climate Change Activity Handouts.pdf',
          type: 'document',
          fileUrl: '/sample-files/handouts.pdf',
          fileSize: 512000, // 512KB
          uploadedAt: '2024-01-14T14:20:00Z',
          uploadedBy: 'Current User',
          category: 'handouts',
          description: 'Printable activities and worksheets'
        },
        {
          id: '3',
          name: 'Presentation Photos - Jan 2024.zip',
          type: 'other',
          fileUrl: '/sample-files/photos.zip',
          fileSize: 15728640, // 15MB
          uploadedAt: '2024-01-13T16:45:00Z',
          uploadedBy: 'Current User',
          category: 'photos',
          description: 'Photos from recent presentations'
        }
      ];
      setFiles(sampleFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      // Sample template data
      const sampleTemplates: PresentationTemplate[] = [
        {
          id: '1',
          name: 'Environmental STEM Presentation Template',
          version: '2.1',
          description: 'Current template with updated climate data and activities',
          fileUrl: '/templates/presentation-template-v2.1.pptx',
          fileSize: 3145728, // 3MB
          updatedAt: '2024-01-10T09:00:00Z',
          isCurrent: true
        },
        {
          id: '2',
          name: 'Environmental STEM Presentation Template',
          version: '2.0',
          description: 'Previous version with legacy content',
          fileUrl: '/templates/presentation-template-v2.0.pptx',
          fileSize: 2936012, // 2.8MB
          updatedAt: '2023-11-15T11:30:00Z',
          isCurrent: false
        },
        {
          id: '3',
          name: 'Activity Worksheets Template',
          version: '1.3',
          description: 'Updated worksheets with new environmental challenges',
          fileUrl: '/templates/worksheets-template-v1.3.docx',
          fileSize: 524288, // 512KB
          updatedAt: '2024-01-05T14:20:00Z',
          isCurrent: true
        }
      ];
      setTemplates(sampleTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // In production, upload to Supabase Storage
        // const { data, error } = await supabase.storage
        //   .from('volunteer-files')
        //   .upload(`${Date.now()}-${file.name}`, file);

        // For now, simulate upload
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newFile: FileItem = {
          id: Date.now().toString(),
          name: file.name,
          type: getFileType(file.name),
          fileUrl: `/uploaded/${file.name}`,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Current User',
          category: 'uploaded',
          description: `Uploaded ${file.name}`
        };

        setFiles(prev => [newFile, ...prev]);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const getFileType = (filename: string): FileItem['type'] => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pptx':
      case 'ppt':
      case 'key':
        return 'presentation';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'mp4':
      case 'mov':
      case 'avi':
        return 'video';
      case 'pdf':
      case 'doc':
      case 'docx':
        return 'document';
      default:
        return 'other';
    }
  };

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'presentation': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      case 'document': return File;
      default: return File;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const filteredFiles = selectedCategory === 'all'
    ? files
    : files.filter(file => file.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(files.map(f => f.category)))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">File Hub</h1>
            <p className="text-gray-600">Upload, organize, and access all your presentation materials</p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('my-files')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'my-files'
                      ? 'border-gsv-green text-gsv-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Files
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'templates'
                      ? 'border-gsv-green text-gsv-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Presentation Templates
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'my-files' ? (
            <>
              {/* Upload Section */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h2>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-gsv-green bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Drag and drop files here, or{' '}
                    <label className="text-gsv-green hover:text-gsv-greenDark cursor-pointer font-medium">
                      browse to upload
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileInput}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.zip"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, Word, PowerPoint, Images, Videos, Archives
                  </p>
                  {uploading && (
                    <div className="mt-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gsv-green mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Uploading files...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Files Section */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">My Files</h2>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gsv-green focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Files' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {filteredFiles.length === 0 ? (
                    <div className="p-8 text-center">
                      <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No files uploaded yet</p>
                      <p className="text-sm text-gray-400 mt-1">Upload your first file to get started</p>
                    </div>
                  ) : (
                    filteredFiles.map((file) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div key={file.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FileIcon className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                                <p className="text-sm text-gray-600 truncate">{file.description}</p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                  <span>{formatFileSize(file.fileSize)}</span>
                                  <span>•</span>
                                  <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                    {file.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 text-gray-400 hover:text-gsv-green transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Templates Section */
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Presentation Templates</h2>
                <p className="text-gray-600 mb-6">
                  Access the latest presentation templates and materials. Always use the current version for new presentations.
                </p>

                <div className="space-y-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gsv-green/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gsv-green" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {template.name}
                              {template.isCurrent && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Current
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600">{template.description}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>Version {template.version}</span>
                              <span>•</span>
                              <span>{formatFileSize(template.fileSize)}</span>
                              <span>•</span>
                              <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-4 py-2 bg-gsv-green text-white rounded-lg hover:bg-gsv-greenDark transition-colors text-sm font-medium flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">Template Version Control</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Templates are regularly updated with new content, improved activities, and current environmental data.
                        Always download the latest version before presentations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Custom Materials */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Custom Materials</h2>
                <p className="text-gray-600 mb-4">
                  Have additional materials you&apos;d like to share with your team? Upload them here.
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Upload additional materials</p>
                  <label className="text-gsv-green hover:text-gsv-greenDark cursor-pointer font-medium">
                    Choose files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileInput}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.zip"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
