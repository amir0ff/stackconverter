import React, { useState, useRef } from 'react';
import { useConversion } from './hooks/useConversion';
import { useFileUpload } from './hooks/useFileUpload';
import { stackOptions, stackToLanguage, exampleCode, features } from './constants';
import Header from './ui/Header';
import StackSelection from './ui/StackSelection';
import ConvertButton from './ui/ConvertButton';
import ErrorBanner from './ui/ErrorBanner';
import CodePanel from './ui/CodePanel';
import FeaturesSection from './ui/FeaturesSection';
import { Tooltip } from 'react-tooltip';
import { Turnstile } from '@marsidev/react-turnstile';
import { API_ENDPOINTS } from '../config';



const StackConverter: React.FC = () => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [autoDetectedStack, setAutoDetectedStack] = useState<string | null>(null);
  const [isDetectingStack, setIsDetectingStack] = useState(false);
  const lastDetectedCode = useRef<string | null>(null);
  const editStartCode = useRef<string | null>(null);

  const {
    conversionState,
    fileUploadState,
    convertCode,
    updateSourceCode,
    updateSourceStack,
    updateTargetStack,
    setError,
    resetCode,
    setFileUploadState,
  } = useConversion(setAutoDetectedStack, setCaptchaToken);

  const {
    fileInputRef,
    handleFileIconClick,
    handleFileChange,
    handleRemoveFile,
  } = useFileUpload(setFileUploadState, setError, updateSourceStack, setAutoDetectedStack, setCaptchaToken, updateSourceCode);

  const detectStackFromCode = async (code: string, captchaToken?: string | null) => {
    try {
      const response = await fetch(API_ENDPOINTS.detectStack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: code, captchaToken }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.status === 403 && data.error && data.error.toLowerCase().includes('captcha')) {
        setCaptchaToken(null);
      }
      return response.ok ? data.detectedStack : null;
    } catch {
      return null;
    }
  };

  // Pass this to CodePanel to track when edit mode is entered/exited
  const handleEditModeChange = (isEditing: boolean) => {
    if (isEditing) {
      // Entering edit mode: store the code at the start of editing
      editStartCode.current = conversionState.sourceCode;
    }
  };

  const handleExitEdit = async () => {
    // Only run detection if code changed since last detection AND since entering edit mode
    if (lastDetectedCode.current === conversionState.sourceCode || editStartCode.current === conversionState.sourceCode) return;
    setIsDetectingStack(true);
    const detectedStack = await detectStackFromCode(conversionState.sourceCode, captchaToken);
    if (detectedStack && detectedStack !== conversionState.sourceStack) {
      updateSourceStack(detectedStack);
      setAutoDetectedStack(detectedStack);
    }
    lastDetectedCode.current = conversionState.sourceCode;
    setIsDetectingStack(false);
  };

  const handleSourceStackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSourceStack = e.target.value;
    updateSourceStack(newSourceStack);
    setAutoDetectedStack(null); // Clear auto-detection when user manually changes
    
    if (!fileUploadState.uploadedFile) {
      // If switching to the stack that matches the last conversion target and we have a converted result, use it
      if (newSourceStack === conversionState.targetStack && conversionState.convertedCode) {
        updateSourceCode(conversionState.convertedCode);
      } else {
        updateSourceCode(typeof exampleCode[newSourceStack] === 'string' 
          ? exampleCode[newSourceStack] 
          : '');
      }
    }
  };

  const handleTargetStackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTargetStack(e.target.value);
  };

  // --- Replace onFileChange and onClick handlers to always use latest captchaToken ---

  // Instead of partially applying captchaToken at render, use a callback that fetches the latest value
  const handleFileChangeWithCaptcha = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(captchaToken)(e);
  };

  const handleConvertClick = () => {
    convertCode(captchaToken);
  };

  return (
    <>
      <Tooltip id="upload-tooltip" place="top" className="!z-50 !text-sm !rounded-lg !bg-gray-900 !text-white !px-3 !py-2" />
      <Tooltip id="reset-tooltip" place="top" className="!z-50 !text-sm !rounded-lg !bg-gray-900 !text-white !px-3 !py-2" />
      <Tooltip id="edit-tooltip" place="top" className="!z-50 !text-sm !rounded-lg !bg-gray-900 !text-white !px-3 !py-2" />
      <Tooltip id="copy-tooltip" place="top" className="!z-50 !text-sm !rounded-lg !bg-gray-900 !text-white !px-3 !py-2" />
      <Tooltip id="download-tooltip" place="top" className="!z-50 !text-sm !rounded-lg !bg-gray-900 !text-white !px-3 !py-2" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
        <div className="max-w-7xl mx-auto">
          <Header />
          
          <StackSelection
            sourceStack={conversionState.sourceStack}
            targetStack={conversionState.targetStack}
            onSourceStackChange={handleSourceStackChange}
            onTargetStackChange={handleTargetStackChange}
            disabled={conversionState.isConverting || fileUploadState.isUploading}
            stackOptions={stackOptions}
            autoDetectedStack={autoDetectedStack}
          />

          {import.meta.env.MODE === 'production' && !captchaToken && (
            <div className="flex justify-center my-4">
              <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={setCaptchaToken}
                options={{ theme: 'light' }}
              />
            </div>
          )}

          <ConvertButton
            onClick={handleConvertClick}
            disabled={
              conversionState.isConverting ||
              conversionState.sourceStack === conversionState.targetStack ||
              (import.meta.env.MODE === 'production' && !captchaToken) ||
              fileUploadState.isUploading
            }
            isConverting={conversionState.isConverting}
          />

          <ErrorBanner
            error={conversionState.error}
            onDismiss={() => setError(null)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <CodePanel
              title="Source Code"
              stack={conversionState.sourceStack}
              code={conversionState.sourceCode}
              language={stackToLanguage[conversionState.sourceStack] || 'javascript'}
              onReset={resetCode}
              onFileUpload={handleFileIconClick}
              onRemoveFile={handleRemoveFile}
              uploadedFile={fileUploadState.uploadedFile}
              uploadMessage={fileUploadState.uploadMessage}
              isUploading={fileUploadState.isUploading}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChangeWithCaptcha}
              onCodeChange={updateSourceCode}
              isEditable={true}
              uploadDisabled={import.meta.env.MODE === 'production' && !captchaToken || conversionState.isConverting || fileUploadState.isUploading}
              disableEdit={import.meta.env.MODE === 'production' && !captchaToken || conversionState.isConverting || fileUploadState.isUploading}
              onExitEdit={handleExitEdit}
              onEditModeChange={handleEditModeChange}
              isDetectingStack={isDetectingStack}
            />

            <CodePanel
              title="Converted Code"
              stack={conversionState.activeTargetStack}
              code={conversionState.convertedCode}
              language={stackToLanguage[conversionState.activeTargetStack] || 'javascript'}
              isConverting={conversionState.isConverting}
              onCopy={() => {}} // Handled internally in CodePanel
              onDownload={() => {}} // Handled internally in CodePanel
              showEmptyState={true}
            />
          </div>

          <FeaturesSection features={features} />
        </div>
      </div>
    </>
  );
};

export default StackConverter; 