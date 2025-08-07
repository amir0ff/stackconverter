import React, { useState, useRef, useEffect } from 'react';
import { Copy, RefreshCw, Upload, Loader2, Download, Code, Edit2, Eye } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodePanelProps } from '../types';
import { stackOptions } from '../constants';

interface CodePanelPropsWithTooltips extends CodePanelProps {
  uploadTooltipProps?: React.HTMLAttributes<HTMLButtonElement>;
  resetTooltipProps?: React.HTMLAttributes<HTMLButtonElement>;
  editTooltipProps?: React.HTMLAttributes<HTMLButtonElement>;
  onCodeChange?: (code: string) => void;
  isEditable?: boolean;
  uploadDisabled?: boolean;
  disableEdit?: boolean; // NEW PROP
  showEmptyState?: boolean;
  emptyStateMessage?: string;
  emptyStateIcon?: React.ReactNode;
  onExitEdit?: () => void;
  isDetectingStack?: boolean;
  onEditModeChange?: (isEditing: boolean) => void;
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
  disableEdit = false, // NEW PROP
  onExitEdit,
  isDetectingStack = false,
  onEditModeChange,
}) => {
  const selectedStack = stackOptions.find(s => s.value === stack);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Defensive: always use a boolean for showEmptyState
  const safeShowEmptyState = !!showEmptyState;
  // Disable edit if uploaded file is a zip
  const isZip = uploadedFile && uploadedFile.name.endsWith('.zip');
  const effectiveDisableEdit = disableEdit || isZip;

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [code]);


  
  // Defensive: ensure code is always a string for rendering
  const safeCode = (() => {
    if (typeof code === 'string') {
      return code;
    }
    if (Array.isArray(code)) {
      return (code as any[]).map((item: any) => typeof item === 'string' ? item : JSON.stringify(item, null, 2)).join('\n');
    }
    if (code && typeof code === 'object') {
      return JSON.stringify(code, null, 2);
    }
    return String(code || '');
  })();

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // Map stack to file extension for download
    const stackToExt: Record<string, string> = {
      react: 'jsx',
      vue: 'vue',
      angular: 'ts',
      svelte: 'svelte',
      solid: 'jsx',
      preact: 'jsx',
    };
    let baseName = 'Converted';
    if (uploadedFile && !uploadedFile.name.endsWith('.zip')) {
      const nameParts = uploadedFile.name.split('.');
      if (nameParts.length > 1) nameParts.pop(); // remove ext
      baseName = nameParts.join('.') || 'Converted';
    }
    const ext = stackToExt[stack] || 'txt';
    a.download = `${baseName}.${ext}`;
    document.body.appendChild(a);
    setTimeout(() => {
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }, 0);
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
    if (isEditing) {
      // Exiting edit mode
      onEditModeChange?.(false);
      if (onExitEdit) {
        onExitEdit();
      }
    } else {
      // Entering edit mode
      onEditModeChange?.(true);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
    setIsEditing(!isEditing);
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
          {/* Always show edit button, but disable for zip, upload, or conversion */}
          {isEditable && (
            <button
              onClick={toggleEditMode}
              className={`transition-colors ${
                effectiveDisableEdit
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white'
              }`}
              disabled={!!effectiveDisableEdit}
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
                className={`transition-colors ${
                  isUploading || uploadDisabled 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-white'
                }`}
                disabled={isUploading || uploadDisabled}
                data-tooltip-id="upload-tooltip"
                data-tooltip-content="Upload a .zip archive containing your code files (.js, .ts, .tsx, .jsx) for batch conversion. Only code files will be processed."
                {...uploadTooltipProps}
              >
                  <Upload className="h-6 w-6" />
              </button>
            </>
          )}
          {onReset && (
            <button 
              onClick={onReset}
              className={`transition-colors ${
                disableEdit 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white'
              }`}
              disabled={disableEdit}
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
              data-tooltip-id="copy-tooltip"
              data-tooltip-content="Copy to clipboard"
            >
              <Copy className="h-6 w-6" />
            </button>
          )}
          {code && !isConverting && onDownload && (
            <button
              onClick={handleDownload}
              className="text-gray-400 hover:text-white transition-colors"
              data-tooltip-id="download-tooltip"
              data-tooltip-content="Download converted code"
            >
              <Download className="h-6 w-6" />
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
        ) : isUploading || isDetectingStack ? (
          <div className="px-6 py-8 flex flex-col items-center justify-center text-blue-300 text-sm min-h-[20rem]">
            <Loader2 className="h-10 w-10 mb-2 text-blue-400 animate-spin" />
            <div>{isUploading ? 'Uploading file...' : 'Detecting stack...'}</div>
          </div>
        ) : uploadedFile && (
          // If uploaded file is a code file, allow editing via edit button (default: syntax highlighter)
          (['js','jsx','ts','tsx','vue','svelte'].some(ext => uploadedFile.name.endsWith('.' + ext))) ? (
            isEditable && isEditing ? (
              <div className="p-6 h-full">
                <textarea
                  ref={textareaRef}
                  value={safeCode}
                  onChange={handleCodeChange}
                  className="w-full h-full min-h-[20rem] bg-gray-900/50 text-gray-100 font-mono text-sm leading-relaxed p-4 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                  style={{ fontSize: 14 }}
                  placeholder={`// Enter your ${stack} code here...\n// You can edit this code directly and then convert it to another framework`}
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
                {safeCode}
              </SyntaxHighlighter>
            )
          ) : (
            // Otherwise, show batch upload UI (zip)
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
          )
        )
        || (
          <>
            {isEditable && isEditing ? (
              <div className="p-6 h-full">
                <textarea
                  ref={textareaRef}
                  value={safeCode}
                  onChange={handleCodeChange}
                  className="w-full h-full min-h-[20rem] bg-gray-900/50 text-gray-100 font-mono text-sm leading-relaxed p-4 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                  style={{ fontSize: 12 }}
                  placeholder={`// Enter your ${stack} code here...\n// You can edit this code directly and then convert it to another framework`}
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
                {safeCode}
              </SyntaxHighlighter>
            )}
            {safeShowEmptyState && !code && (
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