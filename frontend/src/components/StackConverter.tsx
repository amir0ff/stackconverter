import React, { useState } from 'react';
import { ArrowRight, Code, Zap, Copy, RefreshCw, FileCode, Upload, Loader2, XCircle, Download } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaReact } from 'react-icons/fa';
import { SiVuedotjs, SiAngular, SiSvelte, SiSolid, SiPreact } from 'react-icons/si';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface StackOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const StackConverter: React.FC = () => {
  const [sourceCode, setSourceCode] = useState<string>(`import React, { useState } from 'react';

const Counter = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => {
    setCount(count + 1);
  };
  
  const decrement = () => {
    setCount(count - 1);
  };
  
  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

export default Counter;`);

  const [convertedCode, setConvertedCode] = useState<string>('');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [sourceStack, setSourceStack] = useState<string>('react');
  const [targetStack, setTargetStack] = useState<string>('vue');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadedServerFilename, setUploadedServerFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const stackOptions: StackOption[] = [
    { value: 'react', label: 'React', icon: <FaReact color="#61DAFB" size={24} /> },
    { value: 'vue', label: 'Vue.js', icon: <SiVuedotjs color="#42B883" size={24} /> },
    { value: 'angular', label: 'Angular', icon: <SiAngular color="#DD0031" size={24} /> },
    { value: 'svelte', label: 'Svelte', icon: <SiSvelte color="#FF3E00" size={24} /> },
    { value: 'solid', label: 'SolidJS', icon: <SiSolid color="#2C4F7C" size={24} /> },
    { value: 'preact', label: 'Preact', icon: <SiPreact color="#673AB8" size={24} /> }
  ];

  const handleFileIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setIsUploading(true);
      setUploadMessage(null);
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
          setUploadMessage('File uploaded successfully!');
          setUploadedServerFilename(data.filename);
        } else {
          setError(data.error || 'Upload failed.');
          setUploadedFile(null);
          setUploadedServerFilename(null);
        }
      } catch (err) {
        setError('Upload failed.');
        setUploadedFile(null);
        setUploadedServerFilename(null);
      }
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedServerFilename(null);
    setSourceCode(`import React, { useState } from 'react';

const Counter = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => {
    setCount(count + 1);
  };
  
  const decrement = () => {
    setCount(count - 1);
  };
  
  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

export default Counter;`);
  };

  const convertCode = async (): Promise<void> => {
    setIsConverting(true);
    setConvertedCode('');
    setError(null);
    if (uploadedFile && uploadedServerFilename) {
      // Batch convert: download zip
      try {
        const response = await fetch('/batch-convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: uploadedServerFilename,
            sourceStack,
            targetStack,
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
        setConvertedCode('// Batch conversion complete. Downloaded zip.');
      } catch (err) {
        setError('Batch conversion failed');
      }
      setIsConverting(false);
      return;
    }
    // Single file conversion (existing logic)
    try {
      const response = await fetch('/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode,
          sourceStack,
          targetStack,
        }),
      });
      const data = await response.json();
      setConvertedCode(data.convertedCode || '// Conversion failed or no result.');
    } catch (error) {
      setError('Error connecting to backend.');
    }
    setIsConverting(false);
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text');
    }
  };

  const resetCode = (): void => {
    setSourceCode(`import React, { useState } from 'react';

const Counter = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => {
    setCount(count + 1);
  };
  
  const decrement = () => {
    setCount(count - 1);
  };
  
  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

export default Counter;`);
    setConvertedCode('');
    setUploadedFile(null);
    setUploadedServerFilename(null);
    setUploadMessage(null);
  };

  // Helper to map stack to language
  const stackToLanguage: Record<string, string> = {
    react: 'jsx',
    vue: 'html',
    angular: 'typescript',
    svelte: 'html',
    solid: 'jsx',
    preact: 'jsx',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mr-4">
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">StackConverter</h1>
          </div>
          <p className="text-gray-300 text-lg">Transform your entire codebase between different tech stacks</p>
          <div className="mt-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm inline-block">
            🚀 Multi-Framework AI Codebase Converter
          </div>
        </div>

        {/* Stack Selection */}
        <div className="flex items-center justify-center mb-8 space-x-4">
          <div className="relative">
            <select 
              value={sourceStack} 
              onChange={(e) => setSourceStack(e.target.value)}
              className="appearance-none bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-xl px-6 py-3 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 pl-12"
            >
              {stackOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300">
              {stackOptions.find(s => s.value === sourceStack)?.icon}
            </div>
            <FileCode className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
            <ArrowRight className="h-6 w-6 text-white" />
          </div>
          
          <div className="relative">
            <select 
              value={targetStack} 
              onChange={(e) => setTargetStack(e.target.value)}
              className="appearance-none bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-xl px-6 py-3 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 pl-12"
            >
              {stackOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300">
              {stackOptions.find(s => s.value === targetStack)?.icon}
            </div>
            <FileCode className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Convert Button */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={convertCode}
            disabled={isConverting}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center space-x-2"
          >
            {isConverting ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Code className="h-5 w-5" />
                <span>Convert Stack</span>
              </>
            )}
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="max-w-2xl mx-auto mb-4 flex items-center bg-red-600/90 text-white px-4 py-3 rounded-lg shadow-lg">
            <XCircle className="mr-2 h-5 w-5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-white hover:text-gray-200 focus:outline-none">✕</button>
          </div>
        )}

        {/* Code Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Source Code */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 flex flex-col h-full">
            <div className="bg-gray-700/50 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                Source Code 
                <span className="text-gray-300">{stackOptions.find(s => s.value === sourceStack)?.icon}</span>
                <span>{stackOptions.find(s => s.value === sourceStack)?.label}</span>
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".zip"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={handleFileIconClick}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Upload zip file"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </button>
                <button 
                  onClick={resetCode}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Reset to example"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            {!uploadedFile ? (
              <SyntaxHighlighter
                language={stackToLanguage[sourceStack] || 'javascript'}
                style={tomorrow}
                customStyle={{ minHeight: '20rem', fontSize: 14, borderRadius: '0.75rem', background: 'transparent', padding: 24 }}
                showLineNumbers
              >
                {sourceCode}
              </SyntaxHighlighter>
            ) : (
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
                <button
                  onClick={handleRemoveFile}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                  disabled={isUploading}
                >
                  Remove File
                </button>
              </div>
            )}
          </div>

          {/* Converted Code */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 flex flex-col h-full">
            <div className="bg-gray-700/50 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                Converted Code 
                <span className="text-gray-300">{stackOptions.find(s => s.value === targetStack)?.icon}</span>
                <span>{stackOptions.find(s => s.value === targetStack)?.label}</span>
              </h3>
              <div className="flex items-center gap-2">
                {convertedCode && !isConverting && (
                  <button 
                    onClick={() => copyToClipboard(convertedCode)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
                {convertedCode && !isConverting && !uploadedFile && (
                  <button
                    onClick={() => {
                      const blob = new Blob([convertedCode], { type: 'text/plain' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Converted.${stackToLanguage[targetStack] || 'js'}`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    }}
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
              ) : (
                <>
                  <SyntaxHighlighter
                    language={stackToLanguage[targetStack] || 'javascript'}
                    style={tomorrow}
                    customStyle={{ minHeight: '20rem', fontSize: 14, borderRadius: '0.75rem', background: 'transparent', padding: 24 }}
                    showLineNumbers
                  >
                    {convertedCode}
                  </SyntaxHighlighter>
                  {!convertedCode && (
                    <div className="absolute inset-0 h-full w-full flex items-center justify-center text-gray-500 pointer-events-none">
                      <div className="text-center">
                        <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Run conversion to see results</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-blue-400 text-2xl mb-4">🔄</div>
            <h3 className="text-white font-semibold mb-2">Smart Conversion</h3>
            <p className="text-gray-300 text-sm">AI-powered analysis converts components, state management, and lifecycle methods intelligently.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-green-400 text-2xl mb-4">⚡</div>
            <h3 className="text-white font-semibold mb-2">Full Stack Support</h3>
            <p className="text-gray-300 text-sm">Convert entire projects including build configs, routing, state management, and testing.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-purple-400 text-2xl mb-4">🎯</div>
            <h3 className="text-white font-semibold mb-2">Best Practices</h3>
            <p className="text-gray-300 text-sm">Generated code follows framework conventions and modern best practices out of the box.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackConverter; 