import { useRef } from 'react';
import { FileUploadState } from '../types';
import { API_ENDPOINTS } from '../../config';
import JSZip from 'jszip';

export const useFileUpload = (
  setFileUploadState: (state: FileUploadState | ((prev: FileUploadState) => FileUploadState)) => void,
  setError: (error: string | null) => void,
  updateSourceStack?: (stack: string) => void,
  setAutoDetectedStack?: (stack: string | null) => void,
  setCaptchaToken?: (token: string | null) => void
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const detectStackFromCode = async (code: string, captchaToken?: string | null): Promise<string | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.detectStack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: code, captchaToken }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.status === 403 && data.error && data.error.toLowerCase().includes('captcha')) {
        setCaptchaToken && setCaptchaToken(null);
      }
      return response.ok ? data.detectedStack : null;
    } catch {
      return null;
    }
  };

  const detectStackFromZip = async (file: File, captchaToken?: string | null): Promise<string | null> => {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      // Look for code files in the zip
      const codeFiles = Object.keys(zipContent.files).filter(filename => {
        const ext = filename.toLowerCase().split('.').pop();
        return ['js', 'jsx', 'ts', 'tsx', 'vue', 'svelte'].includes(ext || '');
      });

      if (codeFiles.length === 0) {
        return null;
      }

      // Try to detect from the first code file found
      const firstCodeFile = codeFiles[0];
      const fileContent = await zipContent.files[firstCodeFile].async('string');
      return await detectStackFromCode(fileContent, captchaToken);
    } catch {
      return null;
    }
  };

  const handleFileChange = (captchaToken?: string | null) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileUploadState(prev => ({
        ...prev,
        uploadedFile: file,
        isUploading: true,
        uploadMessage: null,
      }));
      setError(null);
      
      try {
        let detectedStack: string | null = null;

        // For single code files, try to detect the stack
        if (file.type === 'text/javascript' || file.type === 'application/javascript' || 
            file.name.endsWith('.js') || file.name.endsWith('.jsx') || 
            file.name.endsWith('.ts') || file.name.endsWith('.tsx') ||
            file.name.endsWith('.vue') || file.name.endsWith('.svelte')) {
          const code = await file.text();
          detectedStack = await detectStackFromCode(code, captchaToken);
        }
        // For zip files, try to detect from zip contents
        else if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || 
                 file.name.endsWith('.zip')) {
          detectedStack = await detectStackFromZip(file, captchaToken);
        }

        if (detectedStack && updateSourceStack) {
          updateSourceStack(detectedStack);
          if (setAutoDetectedStack) {
            setAutoDetectedStack(detectedStack);
          }
        }

        const formData = new FormData();
        formData.append('file', file);
        if (captchaToken) formData.append('captchaToken', captchaToken);
        const response = await fetch(API_ENDPOINTS.upload, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const data = await response.json();
        if (response.status === 403 && data.error && data.error.toLowerCase().includes('captcha')) {
          setCaptchaToken && setCaptchaToken(null);
        }
        if (response.ok) {
          setFileUploadState(prev => ({
            ...prev,
            uploadMessage: 'File uploaded successfully!',
            uploadedServerFilename: data.filename,
            isUploading: false,
          }));
        } else {
          setError(data.error || 'Upload failed.');
          setFileUploadState(prev => ({
            ...prev,
            uploadedFile: null,
            uploadedServerFilename: null,
            isUploading: false,
          }));
        }
      } catch {
        setError('Upload failed.');
        setFileUploadState(prev => ({
          ...prev,
          uploadedFile: null,
          uploadedServerFilename: null,
          isUploading: false,
        }));
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
    if (setAutoDetectedStack) {
      setAutoDetectedStack(null);
    }
  };

  return {
    fileInputRef,
    handleFileIconClick,
    handleFileChange,
    handleRemoveFile,
  };
}; 