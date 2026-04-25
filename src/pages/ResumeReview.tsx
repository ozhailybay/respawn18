import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFileText, 
  FiArrowLeft, 
  FiStar, 
  FiTrendingUp, 
  FiTarget, 
  FiUser, 
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiAward,
  FiBookOpen,
  FiTool,
  FiZap,
  FiEye,
  FiHeart,
  FiArrowRight,
  FiRefreshCw,
  FiUpload,
  FiFile,
  FiCheck,
  FiX,
  FiLoader,
  FiCpu,
  FiTrendingDown,
  FiActivity,
  FiBarChart,
  FiPieChart
} from 'react-icons/fi';
import { UserContext } from '../contexts/UserContext';
import { generateText } from '../api/gemini';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { ResumeAnalysis, UserData } from '../types';
import { handleStorageWithCors, readFileAsText } from '../api/corsHandler';
import { generateResumeAnalysis, ResumeAnalysisResult } from '../api/gemini';
import { Helmet } from 'react-helmet';

const MotionBox = motion.div;
const MotionFlex = motion.div;
const MotionGrid = motion.div;

// Elegant animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const floatingElements = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface AnalysisResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  atsCompatibility: number;
  keywordDensity: number;
  sections: {
    contact: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
  };
  recommendations: string[];
  industryAlignment: number;
  readabilityScore: number;
  enhancedContent?: string;
}

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < value) {
        setCount(count + 1);
      }
    }, 20);
    return () => clearTimeout(timer);
  }, [count, value]);

  return <span>{count}{suffix}</span>;
};

// Modern File Uploader Component
const ModernResumeUploader: React.FC<{ onFileUpload: (file: File) => void; isAnalyzing: boolean }> = ({ onFileUpload, isAnalyzing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      setUploadedFile(file);
      onFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      onFileUpload(file);
    }
  };

  if (uploadedFile) {
    return (
      <MotionBox
        {...fadeInUp}
        className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
      >
        <div className="flex flex-col items-center space-y-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
            isAnalyzing ? "bg-black/5 animate-pulse" : "bg-green-50"
          }`}>
            {isAnalyzing ? (
              <FiLoader className="w-8 h-8 text-black animate-spin" />
            ) : (
              <FiCheck className="w-8 h-8 text-green-600" />
            )}
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {uploadedFile.name}
            </h3>
            <p className="text-sm text-gray-500">
              {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          
          {isAnalyzing && (
            <div className="w-full space-y-4">
              <div className="text-center">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  🤖 <span className="font-thin">ИИ</span> <span className="font-bold">анализирует</span> ваше резюме...
                </h4>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Проверяем ATS-совместимость, анализируем ключевые слова и оцениваем структуру
              </p>
            </div>
          )}
        </div>
      </MotionBox>
    );
  }

  return (
    <MotionBox
      {...fadeInUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative"
    >
      <div
        className={`relative border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragOver 
            ? "border-black bg-black/5 shadow-lg" 
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center space-y-6">
          <MotionBox
            {...floatingElements}
            className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center"
          >
            <FiUpload className="w-10 h-10 text-white" />
          </MotionBox>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">
              {isDragOver ? "Отпустите файл здесь" : "Загрузите ваше резюме"}
            </h3>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Перетащите PDF файл сюда или нажмите для выбора
            </p>
            
            <button className="inline-flex items-center px-8 py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
              <FiUpload className="w-5 h-5 mr-2" />
              Выбрать файл
            </button>
          </div>
          
          <div className="flex items-center space-x-4 pt-4">
            <span className="px-3 py-1 bg-black/5 text-gray-700 rounded-full text-sm font-medium">
              PDF
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              Бесплатно
            </span>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
              ИИ-анализ
            </span>
          </div>
        </div>
      </div>
    </MotionBox>
  );
};

// Modern Score Circle
const ModernScoreCircle: React.FC<{ score: number; size?: number; label: string }> = ({ 
  score, 
  size = 150,
  label
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div 
          className={`w-${size/8} h-${size/8} rounded-full ${getScoreBg(score)} flex items-center justify-center`}
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
              <AnimatedCounter value={score} />
            </div>
            <div className="text-sm text-gray-500">из 100</div>
          </div>
        </div>
        
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-100">
          <div 
            className={`absolute inset-0 rounded-full border-4 border-transparent ${
              score >= 80 ? 'border-t-green-500' : 
              score >= 60 ? 'border-t-yellow-500' : 'border-t-red-500'
            } animate-spin`}
            style={{ 
              borderTopWidth: '4px',
              transform: `rotate(${(score / 100) * 360}deg)`,
              animation: 'none'
            }}
          />
        </div>
      </div>
      
      <p className="text-lg font-medium text-gray-700 text-center">
        {label}
      </p>
    </div>
  );
};

const ResumeReview: React.FC = () => {
  const { user, userData, setUserData } = useContext(UserContext);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGeneratingImproved, setIsGeneratingImproved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLocalFile, setIsLocalFile] = useState<boolean>(false);
  
  const auth = getAuth();
  const db = getFirestore();
  
  useEffect(() => {
    // Load existing analysis
    const loadExistingAnalysis = async () => {
      if (user && userData?.resume?.analysis) {
        const resumeAnalysis = userData.resume.analysis;
        const analysisResult: AnalysisResult = {
          overallScore: resumeAnalysis.overallScore || 0,
          strengths: resumeAnalysis.strengths || [],
          improvements: resumeAnalysis.improvementTips?.map(tip => tip.description) || [],
          atsCompatibility: resumeAnalysis.keywordMatch || 0,
          keywordDensity: resumeAnalysis.contentScore || 0,
          sections: {
            contact: resumeAnalysis.sectionScores?.content || 0,
            summary: resumeAnalysis.sectionScores?.formatting || 0,
            experience: resumeAnalysis.sectionScores?.relevance || 0,
            education: resumeAnalysis.sectionScores?.language || 0,
            skills: resumeAnalysis.sectionScores?.achievements || 0
          },
          recommendations: resumeAnalysis.recommendations?.map(rec => rec.description) || [],
          industryAlignment: resumeAnalysis.formattingScore || 0,
          readabilityScore: resumeAnalysis.contentScore || 0,
          enhancedContent: resumeAnalysis.enhancedContent
        };
        setAnalysis(analysisResult);
        setResumeUrl(userData.resume.url || null);
        setFileName(userData.resume.fileName || '');
        setCurrentStep(3);
      }
    };
    
    loadExistingAnalysis();
  }, [user, userData]);

  // Function to convert ResumeAnalysisResult to AnalysisResult
  const convertAnalysisResult = (result: ResumeAnalysisResult): AnalysisResult => {
    // Calculate average keyword density safely
    let avgKeywordDensity = 70; // default value
    if (result.keywordDensity && typeof result.keywordDensity === 'object') {
      const densityValues = Object.values(result.keywordDensity).filter(val => typeof val === 'number');
      if (densityValues.length > 0) {
        avgKeywordDensity = densityValues.reduce((sum, val) => sum + val, 0) / densityValues.length;
      }
    }

    return {
      overallScore: result.score || 0,
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      atsCompatibility: result.industryFit || 75,
      keywordDensity: avgKeywordDensity,
      sections: {
        contact: result.skillScores?.contact || 85,
        summary: result.skillScores?.summary || 80,
        experience: result.experienceScore || 75,
        education: result.educationScore || 80,
        skills: result.technicalScore || 70
      },
      recommendations: result.detailedFeedback ? [result.detailedFeedback] : [],
      industryAlignment: result.industryFit || 75,
      readabilityScore: result.readabilityScore || 80,
      enhancedContent: result.enhancedContent
    };
  };
  
  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Read file content
      const fileContent = await readFileAsText(file);
      
      // Prepare user context from localStorage or default values
      const userData = {
        role: localStorage.getItem('userRole') || 'Software Developer',
        field: localStorage.getItem('userField') || 'Technology',
        skills: JSON.parse(localStorage.getItem('userSkills') || '["JavaScript", "React", "Node.js"]'),
        education: JSON.parse(localStorage.getItem('userEducation') || '[{"degree": "Bachelor", "institution": "University", "year": "2020"}]'),
        experience: JSON.parse(localStorage.getItem('userExperience') || '[{"title": "Developer", "company": "Tech Corp", "description": "Software development"}]'),
        interests: JSON.parse(localStorage.getItem('userInterests') || '["Technology", "Innovation"]')
      };

      // Generate analysis using Gemini API
      const apiResult = await generateResumeAnalysis(fileContent, userData);
      
      // Convert to expected format
      const analysisResult = convertAnalysisResult(apiResult);
      
      setAnalysis(analysisResult);
      
      // Save to localStorage
      localStorage.setItem('resumeAnalysis', JSON.stringify(analysisResult));
      localStorage.setItem('resumeAnalysisDate', new Date().toISOString());
      
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError('Произошла ошибка при анализе резюме. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleDownloadPDF = () => {
    if (!analysis) return;
    
    const doc = new jsPDF();
    doc.text('Анализ резюме - Jumys Al', 20, 20);
    doc.text(`Общая оценка: ${analysis.overallScore}/100`, 20, 40);
      doc.save('resume-analysis.pdf');
  };
  
  return (
    <>
      <Helmet>
        <title>ИИ-анализ резюме - Jumys Al</title>
        <meta name="description" content="Получите профессиональный анализ вашего резюме с помощью искусственного интеллекта. ATS-совместимость, рекомендации и детальная аналитика." />
      </Helmet>

      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <MotionBox
            {...floatingElements}
            className="absolute top-20 left-10 w-32 h-32 bg-black/5 rounded-full"
          />
          <MotionBox
            {...floatingElements}
            className="absolute top-40 right-20 w-24 h-24 bg-gray-100 rounded-full"
            style={{ animationDelay: '1s' }}
          />
      <MotionBox
            {...floatingElements}
            className="absolute bottom-32 left-20 w-20 h-20 bg-black/10 rounded-full"
            style={{ animationDelay: '2s' }}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          {/* Hero Section */}
          <MotionBox
            {...fadeInUp}
            className="text-center mb-16"
          >
            <div className="space-y-8">
              <div className="inline-flex items-center px-6 py-2 bg-black/5 rounded-full text-sm font-medium text-gray-700 mb-6">
                🚀 <span className="ml-2">Powered by AI</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                <span className="font-thin">Революционный</span> <span className="font-bold">анализ</span>
                <br />
                <span className="font-thin italic">вашего</span> <span className="font-bold underline decoration-4 decoration-black/20">резюме</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Получите детальную оценку от ИИ, проверьте ATS-совместимость 
                и узнайте, как увеличить свои шансы на получение работы мечты на <span className="font-bold">300%</span>
              </p>
              
              <div className="flex items-center justify-center space-x-12 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-gray-600">Проанализированных резюме</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">95%</div>
                  <div className="text-gray-600">Точность анализа</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">3x</div>
                  <div className="text-gray-600">Больше приглашений</div>
                </div>
              </div>
            </div>
          </MotionBox>
          
          {/* Upload Section */}
          <MotionBox
            {...fadeInUp}
            className="mb-16"
          >
            <ModernResumeUploader onFileUpload={handleFileUpload} isAnalyzing={isAnalyzing} />
          </MotionBox>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8"
              >
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center">
                    <FiAlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-red-800">Ошибка!</h3>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Analysis Results */}
          <AnimatePresence>
            {analysis && (
              <MotionBox
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.8 }}
                className="space-y-12"
              >
                {/* Overall Score Section */}
                <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        ✨ Анализ завершен
                      </div>
                      
                      <h2 className="text-3xl font-bold text-gray-900">
                        Ваш результат готов!
                      </h2>
                      
                      <p className="text-xl text-gray-600 leading-relaxed">
                        Наш ИИ проанализировал ваше резюме по <span className="font-bold">50+</span> критериям и готов 
                        поделиться персональными рекомендациями для улучшения
                      </p>
                      
                      <div className="flex items-center space-x-4 pt-4">
                        <button
                          onClick={handleDownloadPDF}
                          className="inline-flex items-center px-8 py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                        >
                          <FiDownload className="w-5 h-5 mr-2" />
                          Скачать отчет
                        </button>
                        
                        <button
                          onClick={() => window.location.reload()}
                          className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                          <FiRefreshCw className="w-5 h-5 mr-2" />
                          Новый анализ
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <ModernScoreCircle 
                        score={analysis.overallScore} 
                        size={200} 
                        label="Общая оценка"
                      />
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { 
                      label: 'ATS Совместимость', 
                      value: analysis.atsCompatibility, 
                      icon: FiCpu,
                      description: 'Вероятность прохождения автоматических фильтров'
                    },
                    { 
                      label: 'Ключевые слова', 
                      value: analysis.keywordDensity, 
                      icon: FiTarget,
                      description: 'Плотность релевантных ключевых слов'
                    },
                    { 
                      label: 'Соответствие индустрии', 
                      value: analysis.industryAlignment, 
                      icon: FiTrendingUp,
                      description: 'Соответствие требованиям отрасли'
                    },
                    { 
                      label: 'Читаемость', 
                      value: analysis.readabilityScore, 
                      icon: FiEye,
                      description: 'Легкость восприятия информации'
                    }
                  ].map((metric, index) => (
                    <MotionBox
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center">
                            <metric.icon className="w-6 h-6 text-gray-700" />
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            <AnimatedCounter value={metric.value} suffix="%" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg text-gray-900">
                            {metric.label}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {metric.description}
                          </p>
                        </div>
                        
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-black h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                      </div>
                    </MotionBox>
                  ))}
                </div>

                {/* Section Scores */}
                <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
                  <div className="space-y-8">
                    <div className="flex items-center space-x-4">
                      <FiBarChart className="w-8 h-8 text-gray-700" />
                      <h2 className="text-2xl font-bold text-gray-900">
                        Детальная оценка по разделам
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                      {Object.entries(analysis.sections).map(([section, score], index) => {
                        const sectionData = {
                          contact: { name: 'Контакты', icon: FiUser },
                          summary: { name: 'Резюме', icon: FiFileText },
                          experience: { name: 'Опыт', icon: FiTool },
                          education: { name: 'Образование', icon: FiBookOpen },
                          skills: { name: 'Навыки', icon: FiZap }
                        };
                        
                        const data = sectionData[section as keyof typeof sectionData];
                        
                        return (
                          <MotionBox
                            key={section}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="text-center"
                          >
                            <ModernScoreCircle 
                              score={score} 
                              size={120} 
                              label={data.name}
                            />
                          </MotionBox>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Strengths and Improvements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Strengths */}
                  <MotionBox
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="bg-green-50 rounded-3xl p-8 border border-green-100 h-full"
                  >
                    <div className="space-y-6 h-full flex flex-col">
                      <div className="flex items-center space-x-4">
                        <FiCheckCircle className="w-8 h-8 text-green-600" />
                        <h2 className="text-2xl font-bold text-green-900">
                          Сильные стороны
                        </h2>
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        {analysis.strengths.map((strength, index) => (
                          <MotionBox
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            className="bg-white rounded-xl p-4 shadow-sm"
                          >
                            <div className="flex items-start space-x-3">
                              <FiHeart className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <p className="text-green-800 font-medium leading-relaxed">
                                {strength}
                              </p>
                            </div>
                          </MotionBox>
                        ))}
                      </div>
                    </div>
                  </MotionBox>

                  {/* Improvements */}
                  <MotionBox
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="bg-orange-50 rounded-3xl p-8 border border-orange-100 h-full"
                  >
                    <div className="space-y-6 h-full flex flex-col">
                      <div className="flex items-center space-x-4">
                        <FiZap className="w-8 h-8 text-orange-600" />
                        <h2 className="text-2xl font-bold text-orange-900">
                          Рекомендации
                        </h2>
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        {analysis.improvements.map((improvement, index) => (
                          <MotionBox
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            className="bg-white rounded-xl p-4 shadow-sm"
                          >
                            <div className="flex items-start space-x-3">
                              <FiArrowRight className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                              <p className="text-orange-800 font-medium leading-relaxed">
                                {improvement}
                              </p>
                            </div>
                          </MotionBox>
                        ))}
                      </div>
                    </div>
                  </MotionBox>
                </div>

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <MotionBox
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100"
                  >
                    <div className="space-y-8">
                      <div className="flex items-center space-x-4">
                        <FiStar className="w-8 h-8 text-gray-700" />
                        <h2 className="text-2xl font-bold text-gray-900">
                          Персональные рекомендации
                        </h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analysis.recommendations.map((recommendation, index) => (
                          <MotionBox
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                            className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">
                                  {index + 1}
                                </span>
                              </div>
                              <p className="text-gray-800 font-medium leading-relaxed">
                                {recommendation}
                              </p>
                            </div>
                          </MotionBox>
                        ))}
                      </div>
                    </div>
                  </MotionBox>
                )}
              </MotionBox>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default ResumeReview; 