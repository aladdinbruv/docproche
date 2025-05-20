import { useState, useRef } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { AlertCircle, File, FileText, Check, X, Upload } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface FileUploadSectionProps {
  patientId: string;
  onFileUploaded: (fileUrl: string, fileName: string) => void;
  maxFileSizeMB?: number;
  allowedFileTypes?: string[];
}

export function FileUploadSection({
  patientId,
  onFileUploaded,
  maxFileSizeMB = 10,
  allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/dicom',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
}: FileUploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxFileSizeMB * 1024 * 1024; // Convert MB to bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return;
    }

    const selectedFile = e.target.files[0];
    
    // Check file size
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds the maximum limit of ${maxFileSizeMB}MB.`);
      setFile(null);
      return;
    }
    
    // Check file type
    if (!allowedFileTypes.includes(selectedFile.type)) {
      setError('File type not supported. Please upload a PDF, JPEG, PNG, DICOM, or document file.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const uploadFile = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const supabase = createClientComponentClient();
      
      // Create a unique filename with patient ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${patientId}/${Date.now()}.${fileExt}`;
      const filePath = `medical-records/${fileName}`;
      
      // Upload file with progress tracking
      const { data, error: uploadError } = await supabase.storage
        .from('health-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;
      
      // Get public URL (or private URL with temporary access token)
      const { data: urlData } = supabase.storage
        .from('health-documents')
        .getPublicUrl(filePath);
        
      // Notify parent component of successful upload
      onFileUploaded(urlData.publicUrl, file.name);
      
      setSuccess(true);
      // Reset file selection
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'An error occurred while uploading the file.');
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  const renderFileIcon = () => {
    if (!file) return null;
    
    const fileType = file.type;
    if (fileType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <File className="h-8 w-8 text-blue-500" />;
    } else if (fileType.includes('document')) {
      return <File className="h-8 w-8 text-blue-700" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const cancelUpload = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mt-4 p-4 border border-dashed rounded-lg">
      <h3 className="font-medium mb-2">Upload Medical Document</h3>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <Check className="h-4 w-4 mr-2 text-green-500" />
          <AlertDescription className="text-green-700">File uploaded successfully!</AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-center w-full">
        <label 
          htmlFor="dropzone-file" 
          className={`flex flex-col items-center justify-center w-full h-32 border-2 ${
            file ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
          } border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100`}
        >
          {!file ? (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, JPEG, PNG, DICOM, DOC, DOCX, XLS, XLSX (Max {maxFileSizeMB}MB)
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-3">
              {renderFileIcon()}
              <p className="mt-2 text-sm text-gray-700 truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          )}
          <input 
            id="dropzone-file" 
            type="file" 
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
            ref={fileInputRef}
          />
        </label>
      </div>
      
      {file && (
        <>
          {uploading && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center mt-1 text-gray-500">Uploading: {progress}%</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cancelUpload}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={uploadFile}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-1" /> Upload
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 