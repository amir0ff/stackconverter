import React from 'react';
import { useConversion } from './hooks/useConversion';
import { useFileUpload } from './hooks/useFileUpload';
import { stackOptions, stackToLanguage, exampleCode, features } from './constants';
import Header from './ui/Header';
import StackSelection from './ui/StackSelection';
import ConvertButton from './ui/ConvertButton';
import ErrorBanner from './ui/ErrorBanner';
import CodePanel from './ui/CodePanel';
import FeaturesSection from './ui/FeaturesSection';

const StackConverter: React.FC = () => {
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
  } = useConversion();

  const {
    fileInputRef,
    handleFileIconClick,
    handleFileChange,
    handleRemoveFile,
  } = useFileUpload(fileUploadState, setFileUploadState, setError);

  const handleSourceStackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSourceStack = e.target.value;
    updateSourceStack(newSourceStack);
    
    if (!fileUploadState.uploadedFile) {
      // If switching to the stack that matches the last conversion target and we have a converted result, use it
      if (newSourceStack === conversionState.targetStack && conversionState.convertedCode) {
        updateSourceCode(conversionState.convertedCode);
      } else {
        updateSourceCode(exampleCode[newSourceStack] || '');
      }
    }
  };

  const handleTargetStackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTargetStack(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <StackSelection
          sourceStack={conversionState.sourceStack}
          targetStack={conversionState.targetStack}
          onSourceStackChange={handleSourceStackChange}
          onTargetStackChange={handleTargetStackChange}
          disabled={conversionState.isConverting}
          stackOptions={stackOptions}
        />

        <ConvertButton
          onClick={convertCode}
          disabled={conversionState.isConverting || conversionState.sourceStack === conversionState.targetStack}
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
            onFileChange={handleFileChange}
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
  );
};

export default StackConverter; 