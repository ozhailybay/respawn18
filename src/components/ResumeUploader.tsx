import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { validateFile } from '../utils/security';

interface ResumeUploaderProps {
  onFileUpload: (file: File) => void;
  isAnalyzing?: boolean;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onFileUpload, isAnalyzing = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAndUploadFile = useCallback((file: File) => {
    const validation = validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB for resumes
      allowedTypes: ['application/pdf'],
      allowedExtensions: ['.pdf']
    });

    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid file');
      return;
    }

    setValidationError(null);
    setUploadedFile(file);
    onFileUpload(file);
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      validateAndUploadFile(file);
    }
  }, [validateAndUploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUploadFile(file);
    }
  }, [validateAndUploadFile]);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setValidationError(null);
  }, []);

  if (uploadedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border-2 border-gray-100 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              {isAnalyzing ? (
                <FiLoader className="w-6 h-6 text-green-600 animate-spin" />
              ) : (
                <FiCheck className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          {!isAnalyzing && (
            <button
              onClick={removeFile}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <FiX className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        {isAnalyzing && (
          <div className="mt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FiLoader className="w-4 h-4 animate-spin" />
              <span>Анализируем ваше резюме...</span>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <motion.div
          animate={{
            scale: isDragOver ? 1.05 : 1,
            y: isDragOver ? -5 : 0
          }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
            <FiUpload className="w-8 h-8 text-gray-400" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Загрузите ваше резюме
            </h3>
            <p className="text-gray-500 mb-4">
              Перетащите PDF файл сюда или нажмите для выбора
            </p>
            
            {validationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{validationError}</p>
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              <FiFile className="w-4 h-4 mr-2" />
              Выбрать файл
            </motion.button>
          </div>
          
          <div className="text-xs text-gray-400">
            Поддерживаются только PDF файлы (максимум 10MB)
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResumeUploader; 