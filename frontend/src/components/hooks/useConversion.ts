import { useState } from 'react';
import { ConversionState, FileUploadState } from '../types';
import { exampleCode } from '../constants';

export const useConversion = () => {
  const [conversionState, setConversionState] = useState<ConversionState>({
    sourceCode: exampleCode.react,
    convertedCode: '',
    isConverting: false,
    sourceStack: 'react',
    targetStack: 'vue',
    activeTargetStack: 'vue',
    error: null,
  });

  const [fileUploadState, setFileUploadState] = useState<FileUploadState>({
    uploadedFile: null,
    isUploading: false,
    uploadMessage: null,
    uploadedServerFilename: null,
  });

  const convertCode = async (): Promise<void> => {
    setConversionState(prev => ({ ...prev, isConverting: true, convertedCode: '', error: null }));
    
    if (conversionState.sourceStack === conversionState.targetStack) {
      setConversionState(prev => ({
        ...prev,
        convertedCode: prev.sourceCode,
        isConverting: false,
        activeTargetStack: prev.targetStack,
      }));
      return;
    }

    if (fileUploadState.uploadedFile && fileUploadState.uploadedServerFilename) {
      // Batch convert: download zip
      try {
        const response = await fetch('/batch-convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: fileUploadState.uploadedServerFilename,
            sourceStack: conversionState.sourceStack,
            targetStack: conversionState.targetStack,
          }),
        });
        if (!response.ok) throw new Error('Batch conversion failed');
        const blob = await response.blob();
        // Download the zip file
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setConversionState(prev => ({
          ...prev,
          convertedCode: '// Batch conversion complete. Downloaded zip.',
          isConverting: false,
          activeTargetStack: prev.targetStack,
        }));
      } catch (err) {
        setConversionState(prev => ({
          ...prev,
          error: 'Batch conversion failed',
          isConverting: false,
        }));
      }
      return;
    }

    // Single file conversion
    try {
      const response = await fetch('/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode: conversionState.sourceCode,
          sourceStack: conversionState.sourceStack,
          targetStack: conversionState.targetStack,
        }),
      });
      const data = await response.json();
      setConversionState(prev => ({
        ...prev,
        convertedCode: data.convertedCode || '// Conversion failed or no result.',
        isConverting: false,
        activeTargetStack: prev.targetStack,
      }));
    } catch (error) {
      setConversionState(prev => ({
        ...prev,
        error: 'Error connecting to backend.',
        isConverting: false,
      }));
    }
  };

  const updateSourceCode = (code: string) => {
    setConversionState(prev => ({ ...prev, sourceCode: code }));
  };

  const updateSourceStack = (stack: string) => {
    setConversionState(prev => ({ ...prev, sourceStack: stack }));
  };

  const updateTargetStack = (stack: string) => {
    setConversionState(prev => ({ ...prev, targetStack: stack }));
  };

  const setError = (error: string | null) => {
    setConversionState(prev => ({ ...prev, error }));
  };

  const resetCode = () => {
    setConversionState(prev => ({
      ...prev,
      sourceCode: exampleCode[prev.sourceStack] || '',
      convertedCode: '',
    }));
    setFileUploadState({
      uploadedFile: null,
      isUploading: false,
      uploadMessage: null,
      uploadedServerFilename: null,
    });
  };

  return {
    conversionState,
    fileUploadState,
    convertCode,
    updateSourceCode,
    updateSourceStack,
    updateTargetStack,
    setError,
    resetCode,
    setFileUploadState,
  };
}; 