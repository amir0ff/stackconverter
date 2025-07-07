import { useRef } from 'react';
import { FileUploadState } from '../types';

export const useFileUpload = (
  fileUploadState: FileUploadState,
  setFileUploadState: (state: FileUploadState) => void,
  setError: (error: string | null) => void
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileUploadState({
        ...fileUploadState,
        uploadedFile: file,
        isUploading: true,
        uploadMessage: null,
      });
      setError(null);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (response.ok) {
          setFileUploadState({
            ...fileUploadState,
            uploadMessage: 'File uploaded successfully!',
            uploadedServerFilename: data.filename,
            isUploading: false,
          });
        } else {
          setError(data.error || 'Upload failed.');
          setFileUploadState({
            ...fileUploadState,
            uploadedFile: null,
            uploadedServerFilename: null,
            isUploading: false,
          });
        }
      } catch (err) {
        setError('Upload failed.');
        setFileUploadState({
          ...fileUploadState,
          uploadedFile: null,
          uploadedServerFilename: null,
          isUploading: false,
        });
      }
    }
  };

  const handleRemoveFile = () => {
    setFileUploadState({
      uploadedFile: null,
      isUploading: false,
      uploadMessage: null,
      uploadedServerFilename: null,
    });
  };

  return {
    fileInputRef,
    handleFileIconClick,
    handleFileChange,
    handleRemoveFile,
  };
}; 