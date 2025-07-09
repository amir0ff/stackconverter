import React, { useState, useRef, useEffect } from 'react';
import { Copy, RefreshCw, Upload, Loader2, Download, Code, Edit2, Eye } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodePanelProps } from '../types';
import { stackOptions, stackToLanguage } from '../constants';

interface CodePanelPropsWithTooltips extends CodePanelProps {
  uploadTooltipProps?: React.HTMLAttributes<HTMLButtonElement>;
  resetTooltipProps?: React.HTMLAttributes<HTMLButtonElement>;
  editTooltipProps?: React.HTMLAttributes<HTMLButtonElement>;
  onCodeChange?: (code: string) => void;
  isEditable?: boolean;
  uploadDisabled?: boolean;
}

const CodePanel: React.FC<CodePanelPropsWithTooltips> = ({
  title,
  stack,
  code,
  language,
  isConverting = false,
  onCopy,
  onDownload,
  onReset,
  onFileUpload,
  onRemoveFile,
  uploadedFile,
  uploadMessage,
  isUploading = false,
  fileInputRef,
  onFileChange,
  showEmptyState = false,
  emptyStateMessage = 'Run conversion to see results',
  emptyStateIcon = <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />,
  uploadTooltipProps = {},
  resetTooltipProps = {},
  editTooltipProps = {},
  onCodeChange,
  isEditable = false,
  uploadDisabled = false,
}) => {
  const selectedStack = stackOptions.find(s => s.value === stack);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [code]);

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Converted.${stackToLanguage[stack] || 'js'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch { /* ignore */ }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onCodeChange) {
      onCodeChange(e.target.value);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    // Focus the textarea when entering edit mode
    if (!isEditing && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 flex flex-col h-full">
      <div className="bg-gray-700/50 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          {title}
          {!isConverting && (
            <>
              <span className="text-gray-300">{selectedStack?.icon}</span>
              <span>{selectedStack?.label}</span>
            </>
          )}
          {isEditable && isEditing && (
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
              Editing
            </span>
          )}
        </h3>
        <div className="flex items-center gap-4">
          {isEditable && !uploadedFile && (
            <button
              onClick={toggleEditMode}
              className="text-gray-400 hover:text-white transition-colors"
              data-tooltip-id="edit-tooltip"
              data-tooltip-content={isEditing ? "View formatted code" : "Edit code"}
              {...editTooltipProps}
            >
              {isEditing ? <Eye className="h-6 w-6" /> : <Edit2 className="h-6 w-6" />}
            </button>
          )}
          {fileInputRef && onFileChange && (
            <>
              <input
                type="file"
                accept=".zip,.js,.jsx,.ts,.tsx"
                ref={fileInputRef}
                onChange={onFileChange}
                style={{ display: 'none' }}
              />
              <button
                onClick={onFileUpload}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isUploading || uploadDisabled}
                data-tooltip-id="upload-tooltip"
                data-tooltip-content="Upload a .zip archive containing your code files (.js, .ts, .tsx, .jsx) for batch conversion. Only code files will be processed."
                {...uploadTooltipProps}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </button>
            </>
          )}
          {onReset && (
            <button 
              onClick={onReset}
              className="text-gray-400 hover:text-white transition-colors"
              data-tooltip-id="reset-tooltip"
              data-tooltip-content="Reset to example code"
              {...resetTooltipProps}
            >
              <RefreshCw className="h-6 w-6" />
            </button>
          )}
          {code && !isConverting && onCopy && (
            <button 
              onClick={handleCopyToClipboard}
              className="text-gray-400 hover:text-white transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
          {code && !isConverting && !uploadedFile && onDownload && (
            <button
              onClick={handleDownload}
              className="text-gray-400 hover:text-white transition-colors"
              title="Download converted code"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="relative flex-1 h-full min-h-[20rem]">
        {isConverting ? (
          <div className="p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl">
            <Skeleton
              count={16}
              height={18}
              style={{ marginBottom: 6, borderRadius: 3 }}
              baseColor="rgba(30,41,59,0.6)"
              highlightColor="rgba(59,130,246,0.15)"
            />
          </div>
        ) : isUploading ? (
          <div className="px-6 py-8 flex flex-col items-center justify-center text-blue-300 text-sm min-h-[20rem]">
            <Loader2 className="h-10 w-10 mb-2 text-blue-400 animate-spin" />
            <div>Uploading file...</div>
          </div>
        ) : uploadedFile ? (
          <div className="px-6 py-8 flex flex-col items-center justify-center text-blue-300 text-sm min-h-[20rem]">
            <Upload className="h-10 w-10 mb-2 text-blue-400" />
            <div className="mb-2">
              <strong>Uploaded file:</strong> {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
            </div>
            <div className="mb-4">Ready for batch conversion.</div>
            {uploadMessage && (
              <div className={uploadMessage.includes('success') ? 'text-green-400 mb-2' : 'text-red-400 mb-2'}>
                {uploadMessage}
              </div>
            )}
            {onRemoveFile && (
              <button
                onClick={onRemoveFile}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                disabled={isUploading}
              >
                Remove File
              </button>
            )}
          </div>
        ) : (
          <>
            {isEditable && isEditing ? (
              <div className="p-6 h-full">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={handleCodeChange}
                  className="w-full h-full min-h-[20rem] bg-gray-900/50 text-gray-100 font-mono text-sm leading-relaxed p-4 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder={`// Enter your ${stack} code here...
// You can edit this code directly and then convert it to another framework`}
                  spellCheck={false}
                />
              </div>
            ) : (
              <SyntaxHighlighter
                language={language}
                style={tomorrow}
                customStyle={{ minHeight: '20rem', fontSize: 14, borderRadius: '0.75rem', background: 'transparent', padding: 24 }}
                showLineNumbers
              >
                {code}
              </SyntaxHighlighter>
            )}
            {showEmptyState && !code && (
              <div className="absolute inset-0 h-full w-full flex items-center justify-center text-gray-500 pointer-events-none">
                <div className="text-center">
                  {emptyStateIcon}
                  <p>{emptyStateMessage}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CodePanel; 