import React, { useState } from 'react';
import { FiUpload, FiFile, FiCheck, FiX, FiLoader } from 'react-icons/fi';

interface SimpleResumeUploaderProps {
  onFileUpload: (file: File) => void;
  isAnalyzing?: boolean;
}

const SimpleResumeUploader: React.FC<SimpleResumeUploaderProps> = ({ onFileUpload, isAnalyzing = false }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      onFileUpload(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  if (uploadedFile) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              {isAnalyzing ? (
                <FiLoader className="w-5 h-5 text-green-600 animate-spin" />
              ) : (
                <FiCheck className="w-5 h-5 text-green-600" />
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
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
            >
              <FiX className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        {isAnalyzing && (
          <div className="mt-4 text-sm text-gray-600">
            Анализируем ваше резюме...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 transition-colors">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        id="resume-upload"
      />
      
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
        <FiUpload className="w-6 h-6 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Загрузите ваше резюме
      </h3>
      <p className="text-gray-500 mb-4">
        Выберите PDF файл для анализа
      </p>
      
      <label
        htmlFor="resume-upload"
        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer"
      >
        <FiFile className="w-4 h-4 mr-2" />
        Выбрать файл
      </label>
    </div>
  );
};

export default SimpleResumeUploader; 