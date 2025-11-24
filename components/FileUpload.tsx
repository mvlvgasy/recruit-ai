import React, { useCallback } from 'react';
import { Upload, X, FileType } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesSelected: (newFiles: File[]) => void;
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
  multiple?: boolean;
  label: string; // Changed to required for i18n
  subLabel?: string;
  compact?: boolean;
  btnLabel: string; // New prop for button text
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  files, 
  onFilesSelected, 
  onRemoveFile, 
  disabled, 
  multiple = true,
  label,
  subLabel = "PDF Only",
  compact = false,
  btnLabel
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      let newFiles = Array.from(e.dataTransfer.files).filter((f: any) => f.type === 'application/pdf');
      if (!multiple && newFiles.length > 0) {
        newFiles = [newFiles[0]];
      }
      if(newFiles.length > 0) onFilesSelected(newFiles);
    }
  }, [disabled, onFilesSelected, multiple]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      let newFiles = Array.from(e.target.files).filter((f: any) => f.type === 'application/pdf');
       if (!multiple && newFiles.length > 0) {
        newFiles = [newFiles[0]];
      }
      if(newFiles.length > 0) onFilesSelected(newFiles);
    }
  };

  return (
    <div className="w-full space-y-3">
      {files.length === 0 || multiple ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center text-center group
            ${compact ? 'p-4' : 'p-8'}
            ${disabled 
              ? 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed opacity-60' 
              : 'border-brand-violet/30 bg-brand-violet/5 hover:bg-brand-violet/10 hover:border-brand-violet dark:border-brand-violet/40 dark:bg-brand-violet/10 cursor-pointer'
            }`}
        >
          <div className={`rounded-full shadow-sm transition-transform group-hover:scale-110 duration-300 ${compact ? 'p-2 mb-2' : 'p-3 mb-4'} ${disabled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
            <Upload className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} ${disabled ? 'text-gray-400' : 'text-brand-violet'}`} />
          </div>
          <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-display font-medium text-brand-text dark:text-white mb-1`}>{label}</h3>
          {!compact && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{subLabel}</p>}
          
          <input
            type="file"
            multiple={multiple}
            accept=".pdf"
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
            id={`file-upload-${multiple ? 'multi' : 'single'}-${label}`}
          />
          <label
            htmlFor={`file-upload-${multiple ? 'multi' : 'single'}-${label}`}
            className={`rounded-lg text-sm font-medium transition-all duration-300
              ${compact ? 'px-3 py-1.5 text-xs' : 'px-6 py-2.5'}
              ${disabled
                ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 pointer-events-none'
                : 'bg-gradient-to-r from-brand-dark to-brand-violet text-white hover:shadow-lg hover:shadow-brand-violet/30 cursor-pointer'
              }`}
          >
            {btnLabel}
          </label>
        </div>
      ) : null}

      {files.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
          <ul className={`divide-y divide-gray-100 dark:divide-gray-700 ${multiple ? 'max-h-48 overflow-y-auto' : ''}`}>
            {files.map((file, idx) => (
              <li key={`${file.name}-${idx}`} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2 bg-brand-teal/10 rounded-lg">
                    <FileType className="w-4 h-4 text-brand-teal flex-shrink-0" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-sm font-medium text-brand-text dark:text-gray-200 truncate">{file.name}</span>
                    <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                {!disabled && (
                  <button
                    onClick={() => onRemoveFile(idx)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};