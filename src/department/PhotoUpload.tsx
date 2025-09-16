// components/department/PhotoUpload.tsx
import React, { useState, useRef } from 'react';
import { usePhotoUpload } from './usePhotoUpload';
import {
  Camera,
  Upload,
  X,
  Loader,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

interface PhotoUploadProps {
  issueId: string;
  type: 'before' | 'after' | 'progress';
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  issueId, 
  type, 
  onUploadComplete,
  maxFiles = 5 
}) => {
  const { uploadPhotos, uploading, uploadProgress } = usePhotoUpload();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null, source: 'camera' | 'gallery') => {
    if (!files) return;

    const newFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return false;
      }
      
      return true;
    });

    if (selectedFiles.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const newPreviews: string[] = [];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newFiles.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploadStatus('idle');
    setError(null);

    try {
      const results = await uploadPhotos(selectedFiles, issueId, type);
      setUploadStatus('success');
      
      setSelectedFiles([]);
      setPreviews([]);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';

      onUploadComplete?.(results.map(r => r.url));

      setTimeout(() => setUploadStatus('idle'), 3000);

    } catch (error) {
      setUploadStatus('error');
      setError('Failed to upload photos. Please try again.');
      console.error('Upload error:', error);
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'before': return 'Before Photos';
      case 'after': return 'After Photos';
      case 'progress': return 'Progress Photos';
      default: return 'Photos';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'before': return 'border-red-300 bg-red-50';
      case 'after': return 'border-green-300 bg-green-50';
      case 'progress': return 'border-blue-300 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className={`border-2 border-dashed rounded-xl p-6 ${getTypeColor()}`}>
      <div className="text-center mb-4">
        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h4 className="font-medium text-gray-900 mb-1">{getTypeLabel()}</h4>
        <p className="text-sm text-gray-600">
          {type === 'before' && 'Upload photos showing the issue before work starts'}
          {type === 'after' && 'Upload photos showing the completed resolution'}
          {type === 'progress' && 'Upload photos showing work in progress'}
        </p>
      </div>

      {uploadStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700 text-sm font-medium">Photos uploaded successfully!</span>
        </div>
      )}

      {uploadStatus === 'error' && error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700 text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Camera className="w-5 h-5" />
          <span>Take Photo</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Upload className="w-5 h-5" />
          <span>Choose Files</span>
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => handleFileSelect(e.target.files, 'camera')}
        className="hidden"
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files, 'gallery')}
        className="hidden"
      />

      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <h5 className="font-medium text-gray-900 mb-3">Selected Photos ({selectedFiles.length}/{maxFiles})</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                  {selectedFiles[index].name.length > 15 
                    ? `${selectedFiles[index].name.substring(0, 12)}...` 
                    : selectedFiles[index].name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">Uploading photos...</span>
            <span className="text-sm text-gray-700">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload {selectedFiles.length} Photo{selectedFiles.length > 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Supported: JPG, PNG, WEBP • Max size: 10MB • Max files: {maxFiles}
        </p>
      </div>
    </div>
  );
};
