export interface StackOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export interface ConversionState {
  sourceCode: string;
  convertedCode: string;
  isConverting: boolean;
  sourceStack: string;
  targetStack: string;
  activeTargetStack: string;
  error: string | null;
}

export interface FileUploadState {
  uploadedFile: File | null;
  isUploading: boolean;
  uploadMessage: string | null;
  uploadedServerFilename: string | null;
}

export interface CodePanelProps {
  title: string;
  stack: string;
  code: string;
  language: string;
  isConverting?: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
  onReset?: () => void;
  onFileUpload?: () => void;
  onRemoveFile?: () => void;
  uploadedFile?: File | null;
  uploadMessage?: string | null;
  isUploading?: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCodeChange?: (code: string) => void;
  isEditable?: boolean;
  showEmptyState?: boolean;
  emptyStateMessage?: string;
  emptyStateIcon?: React.ReactNode;
}

export interface StackSelectorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  stackOptions: StackOption[];
}

export interface ConvertButtonProps {
  onClick: () => void;
  disabled: boolean;
  isConverting: boolean;
}

export interface ErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
}

export interface FeaturesSectionProps {
  features: Array<{
    icon: string;
    title: string;
    description: string;
    color: string;
  }>;
} 