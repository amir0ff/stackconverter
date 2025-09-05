import { useState } from 'react';
import { ConversionState, FileUploadState } from '../types';
import { exampleCode } from '../constants';
import { API_ENDPOINTS } from '../../config';



export const useConversion = (
  setAutoDetectedStack?: (stack: string | null) => void,
  setCaptchaToken?: (token: string | null) => void
) => {
  // Ensure we have a valid initial code
  const getInitialCode = () => {
    const reactCode = exampleCode.react;
    if (typeof reactCode === 'string') {
      return reactCode;
    }
    return `import React, { useState } from 'react';

const Counter = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

export default Counter;`;
  };

  const initialCode = getInitialCode();

  const [conversionState, setConversionState] = useState<ConversionState>({
    sourceCode: initialCode,
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

  const convertCode = async (captchaToken?: string | null): Promise<void> => {
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

    if (
      fileUploadState.uploadedFile &&
      fileUploadState.uploadedServerFilename &&
      fileUploadState.uploadedFile.name.endsWith('.zip')
    ) {
      // Batch convert: download zip
      try {
        const response = await fetch(API_ENDPOINTS.batchConvert, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: fileUploadState.uploadedServerFilename,
            sourceStack: conversionState.sourceStack,
            targetStack: conversionState.targetStack,
            captchaToken,
          }),
          credentials: 'include',
        });
        if (response.status === 403) {
          const data = await response.json().catch(() => ({}));
          if (data.error && data.error.toLowerCase().includes('captcha')) {
            setCaptchaToken && setCaptchaToken(null);
          }
        }
        if (!response.ok) throw new Error('Batch conversion failed');
        const blob = await response.blob();
        // Download the zip file
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let zipBaseName = 'converted';
        if (fileUploadState.uploadedFile && fileUploadState.uploadedFile.name.endsWith('.zip')) {
          const nameParts = fileUploadState.uploadedFile.name.split('.');
          if (nameParts.length > 1) nameParts.pop(); // remove ext
          zipBaseName = nameParts.join('.') || 'converted';
        }
        a.download = `${zipBaseName}-${conversionState.targetStack}.zip`;
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
      } catch { /* ignore */ }
      return;
    }

    // Single file conversion
    try {
      const response = await fetch(API_ENDPOINTS.convert, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode: conversionState.sourceCode,
          sourceStack: conversionState.sourceStack,
          targetStack: conversionState.targetStack,
          captchaToken,
        }),
        credentials: 'include',
      });
      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        if (data.error && data.error.toLowerCase().includes('captcha')) {
          setCaptchaToken && setCaptchaToken(null);
        }
      }
      const data = await response.json();
      setConversionState(prev => ({
        ...prev,
        convertedCode: data.convertedCode || '// Conversion failed or no result.',
        isConverting: false,
        activeTargetStack: prev.targetStack,
      }));
    } catch {
      setError('Error connecting to backend.');
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
    setConversionState(prev => {
      const exampleCodeValue = exampleCode[prev.sourceStack];
      return {
        ...prev,
        sourceCode: typeof exampleCodeValue === 'string' ? exampleCodeValue : '',
        convertedCode: '',
      };
    });
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