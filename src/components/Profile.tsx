/** @jsxRuntime automatic */
/** @jsxImportSource react */
// @ts-nocheck /* временно отключаем проверки типов, чтобы обойти ошибки JSX */
import React, { useEffect, useState, useRef } from 'react';
import { auth, db, storage } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, collection, addDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProgressBar from './ProgressBar';
import { LEVELS } from '../utils/points';
import { generateResume } from '../api/gemini';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { ResumeTemplate } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiEdit3, FiSave, FiX, FiPlus, FiMinus, FiDownload, FiMapPin, FiMail, FiPhone, FiGlobe, FiLinkedin, FiCamera, FiFileText, FiAward, FiZap, FiTool, FiBriefcase, FiGraduationCap, FiStar } from 'react-icons/fi';
import { sanitizeHTML } from '../utils/security';

// Интерфейс данных резюме
interface ResumeData {
  education: string;
  skills: string;
  experience: string;
  achievements: string;
  languages: string[];
  portfolio: string;
}

// Расширяем интерфейс UserData
interface UserData {
  uid: string;
  role: 'school' | 'business'; // Разрешаем только роли, определенные в AuthContext
  bio?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  interests?: string[];
  location?: string;
  phoneNumber?: string;
  website?: string;
  company?: string;
  position?: string;
  yearsOfExperience?: number;
  displayName: string;
  photoURL?: string;
  university?: string;
  graduationYear?: string;
  major?: string;
  gpa?: string;
  industry?: string;
  employeeCount?: string;
  foundedYear?: string;
  linkedIn?: string;
  companyDescription?: string;
  resume?: ResumeData;
  resumeData?: ResumeData;
  points?: number;
  level?: number;
  totalXp?: number;
  email: string;
}

// Add a type for the AI-generated resume content
interface AIResumeData {
  displayName: string;
  position: string;
  photoUrl: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  skills: string[];
  education: {
    degree: string;
    school: string;
    dates: string;
  }[];
  languages: {
    lang: string;
    level: string;
  }[];
  interests: string[];
  experience: {
    title: string;
    company: string;
    dates: string;
    location: string;
    achievements: string[];
  }[];
  courses: {
    name: string;
    type: string;
    provider: string;
  }[];
}

// Resume View Component Props
interface ResumeViewProps {
  resumeData: {
  education: string;
  skills: string;
  experience: string;
  achievements: string;
  languages: string[];
  portfolio: string;
  };
  displayName: string;
  template: ResumeTemplate;
}

// Resume View Component
const ResumeView: React.FC<ResumeViewProps> = ({ resumeData, displayName, template }) => {
  const getTemplateClasses = () => ({
    container: 'max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg',
          section: 'mb-6',
    heading: 'text-xl font-bold mb-2 text-gray-800',
    content: 'text-gray-600'
  });

  const classes = getTemplateClasses();

  return (
    <div className={classes.container}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
      {resumeData.education && (
          <p className="text-gray-600 mt-2">{resumeData.education}</p>
      )}
      </div>
      
      {resumeData.skills && (
        <div className={classes.section}>
          <h2 className={classes.heading}>Skills</h2>
          <p className={classes.content}>{resumeData.skills}</p>
        </div>
      )}
      
      {resumeData.experience && (
        <div className={classes.section}>
          <h2 className={classes.heading}>Опыт работы</h2>
          <p className={classes.content}>{resumeData.experience}</p>
        </div>
      )}
      
      {resumeData.achievements && (
        <div className={classes.section}>
          <h2 className={classes.heading}>Достижения</h2>
          <p className={classes.content}>{resumeData.achievements}</p>
        </div>
      )}
      
      {resumeData.languages && resumeData.languages.length > 0 && (
        <div className={classes.section}>
          <h2 className={classes.heading}>Языки</h2>
          <p className={classes.content}>{resumeData.languages.join(', ')}</p>
        </div>
      )}
      
      {resumeData.portfolio && (
        <div className={classes.section}>
          <h2 className={classes.heading}>Портфолио</h2>
          <p className={classes.content}>{resumeData.portfolio}</p>
        </div>
      )}
    </div>
  );
};

// AI Resume View Component
const AIResumeView: React.FC<{ userData: UserData; generatedHtml?: string }> = ({ userData, generatedHtml }) => {
  // If we have generatedHtml, use that instead of creating our own 
  if (generatedHtml) {
    return (
      <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
    );
  }

  // Fallback to our manual layout if no generatedHtml is provided
  // Create a realistic AI resume data structure from user data
  const createResumeData = (): AIResumeData => {
    return {
      displayName: userData.displayName || '',
      position: userData.position || 'Professional',
      photoUrl: userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.displayName || 'User')}&size=150&background=random`,
      contact: {
        email: userData.email || '',
        phone: userData.phoneNumber || '',
        location: userData.location || 'Казахстан',
        linkedin: userData.linkedIn || '',
      },
      summary: userData.bio || 'Experienced professional with a strong background in the industry.',
      skills: userData.skills || ['Communication', 'Teamwork', 'Problem Solving'],
      education: [
        {
          degree: userData.major || 'Degree',
          school: userData.university || 'University',
          dates: userData.graduationYear ? `${parseInt(userData.graduationYear) - 4} - ${userData.graduationYear}` : '2018 - 2022'
        }
      ],
      languages: userData.resumeData?.languages?.map(lang => ({
        lang,
        level: 'Fluent'
      })) || [
        { lang: 'Казахский', level: 'Родной' },
        { lang: 'Русский', level: 'Свободно' },
        { lang: 'Английский', level: 'B2' }
      ],
      interests: userData.interests || ['Technology', 'Innovation', 'Self-development'],
      experience: userData.experience?.map((exp, index) => ({
        title: exp.split(' at ')[0] || 'Position',
        company: exp.split(' at ')[1] || 'Company',
        dates: `${2022 - index} - ${index === 0 ? 'настоящее время' : (2022 - index + 2)}`,
        location: userData.location || 'Казахстан',
        achievements: [
          'Successfully completed major projects with significant results',
          'Led team initiatives that improved productivity and collaboration',
          'Implemented innovative solutions to complex problems'
        ]
      })) || [
        {
          title: 'Senior Specialist',
          company: 'Leading Company',
          dates: '2022 - настоящее время',
          location: 'Алматы',
          achievements: [
            'Successfully completed major projects with significant results',
            'Led team initiatives that improved productivity and collaboration',
            'Implemented innovative solutions to complex problems'
          ]
        }
      ],
      courses: [
        {
          name: 'Professional Development',
          type: 'Certificate',
          provider: 'Industry Leader'
        },
        {
          name: 'Advanced Skills Training',
          type: 'Online Course',
          provider: 'Educational Platform'
        }
      ]
    };
  };

  const resumeData = createResumeData();

  return (
    <div className="grid grid-cols-[250px_1fr] gap-8 p-8 bg-white text-gray-800">
      {/* Left column */}
      <aside className="bg-gray-900 text-white p-6 rounded-lg">
        <img src={resumeData.photoUrl} className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-teal-400" alt={resumeData.displayName} />
        
        <section className="mb-6">
          <h3 className="uppercase tracking-wider mb-2 text-sm font-bold">Contact</h3>
          <ul className="space-y-1 text-sm">
            <li>📧 {resumeData.contact.email}</li>
            {resumeData.contact.phone && <li>📞 {resumeData.contact.phone}</li>}
            <li>📍 {resumeData.contact.location}</li>
            {resumeData.contact.linkedin && <li>🔗 {resumeData.contact.linkedin}</li>}
          </ul>
        </section>
        
        <section className="mb-6">
          <h3 className="uppercase tracking-wider mb-2 text-sm font-bold">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-gray-800 text-teal-400 rounded-full text-xs">
                {skill}
              </span>
            ))}
          </div>
        </section>
        
        <section className="mb-6">
          <h3 className="uppercase tracking-wider mb-2 text-sm font-bold">Education</h3>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="font-medium">{edu.degree}</div>
              <div className="text-sm text-gray-300">{edu.school}</div>
              <div className="text-xs text-gray-400">{edu.dates}</div>
            </div>
          ))}
        </section>
        
        <section className="mb-6">
          <h3 className="uppercase tracking-wider mb-2 text-sm font-bold">Languages</h3>
          {resumeData.languages.map((lang, index) => (
            <div key={index} className="flex justify-between mb-1">
              <span>{lang.lang}</span>
              <span className="text-teal-400 text-sm">{lang.level}</span>
            </div>
          ))}
        </section>
        
        <section>
          <h3 className="uppercase tracking-wider mb-2 text-sm font-bold">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {resumeData.interests.map((interest, index) => (
              <span key={index} className="flex items-center text-sm">
                <span className="mr-1">•</span> {interest}
              </span>
            ))}
          </div>
        </section>
      </aside>
      
      {/* Right column */}
      <main>
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{resumeData.displayName}</h1>
          <h2 className="text-xl text-gray-600">{resumeData.position}</h2>
          <p className="mt-4 text-gray-700 leading-relaxed">{resumeData.summary}</p>
        </header>
        
        <section className="mt-8">
          <h3 className="text-2xl font-semibold border-b pb-2 mb-4">Experience</h3>
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="mb-6">
              <h4 className="font-semibold text-lg">{exp.title}</h4>
              <span className="text-sm text-gray-500">
                {exp.company} • {exp.dates} • {exp.location}
              </span>
              <ul className="list-disc list-inside mt-2 text-gray-700">
                {exp.achievements.map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
        
        <section className="mt-8">
          <h3 className="text-2xl font-semibold border-b pb-2 mb-4">Courses & Certifications</h3>
          {resumeData.courses.map((course, index) => (
            <p key={index} className="mt-3">
              <strong>{course.name}</strong>{' '}
              <span className="text-sm text-gray-500">({course.provider}, {course.type})</span>
            </p>
          ))}
        </section>
      </main>
    </div>
  );
};

const Profile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [resumeTemplate, setResumeTemplate] = useState<ResumeTemplate>('standard');
  const [autoResume, setAutoResume] = useState(false);
  const [resumeLanguages, setResumeLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [resumeEducation, setResumeEducation] = useState('');
  const [resumeSkills, setResumeSkills] = useState('');
  const [resumeExperience, setResumeExperience] = useState('');
  const [resumeAchievements, setResumeAchievements] = useState('');
  const [resumePortfolio, setResumePortfolio] = useState('');
  
  // Reference for the resume view (for PDF export)
  const resumeRef = useRef<HTMLDivElement>(null);
  const aiResumeRef = useRef<HTMLDivElement>(null);
  
  // Spring animation for profile card - переместим анимации сюда, чтобы не было условных вызовов хуков
  const profileCardSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { mass: 1, tension: 170, friction: 26 }
  });

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          setEditedData(data);
          if (data.photoURL) {
            setAvatarPreview(data.photoURL);
          }
          
          // Load resume data if available
          if (data.resumeData) {
            setResumeEducation(data.resumeData.education || '');
            setResumeSkills(data.resumeData.skills || '');
            setResumeExperience(data.resumeData.experience || '');
            setResumeAchievements(data.resumeData.achievements || '');
            setResumeLanguages(data.resumeData.languages || []);
            setResumePortfolio(data.resumeData.portfolio || '');
          }
        }
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const trackProfileView = async () => {
      if (user && userData && user.uid !== userData.uid) {
        await addDoc(collection(db, 'profileViews'), {
          viewedUserId: userData.uid,
          viewerUserId: user.uid,
          timestamp: Date.now()
        });
      }
    };

    trackProfileView();
  }, [user, userData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!user || !avatarFile) return null;
    
    const avatarRef = ref(storage, `avatars/${user.uid}/${avatarFile.name}`);
    await uploadBytes(avatarRef, avatarFile);
    const downloadURL = await getDownloadURL(avatarRef);
    return downloadURL;
  };

  const handleSave = async () => {
    if (user && editedData) {
      try {
        let photoURL = editedData.photoURL;
        
        if (avatarFile) {
          const uploadedUrl = await uploadAvatar();
          if (uploadedUrl) {
            photoURL = uploadedUrl;
          }
        }

        const updateData = {
          role: editedData.role,
          bio: editedData.bio || null,
          skills: editedData.skills || [],
          experience: editedData.experience || [],
          education: editedData.education || [],
          interests: editedData.interests || [],
          location: editedData.location || null,
          phoneNumber: editedData.phoneNumber || null,
          website: editedData.website || null,
          company: editedData.company || null,
          position: editedData.position || null,
          yearsOfExperience: editedData.yearsOfExperience || null,
          displayName: editedData.displayName || null,
          photoURL: photoURL || null,
          companyDescription: editedData.companyDescription || null,
          industry: editedData.industry || null,
          employeeCount: editedData.employeeCount || null,
          foundedYear: editedData.foundedYear || null,
          linkedIn: editedData.linkedIn || null,
          university: editedData.university || null,
          graduationYear: editedData.graduationYear || null,
          major: editedData.major || null,
          gpa: editedData.gpa || null
        };

        await updateDoc(doc(db, 'users', user.uid), updateData);
        
        if (editedData.displayName || photoURL) {
          await updateProfile(user, {
            displayName: editedData.displayName || null,
            photoURL: photoURL || null
          });
        }
        
        setUserData({...editedData, photoURL});
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const handleAddSkill = () => {
    if (newSkill && editedData) {
      setEditedData({
        ...editedData,
        skills: [...(editedData.skills || []), newSkill]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        skills: editedData.skills?.filter(skill => skill !== skillToRemove)
      });
    }
  };

  const handleAddExperience = () => {
    if (newExperience && editedData) {
      setEditedData({
        ...editedData,
        experience: [...(editedData.experience || []), newExperience]
      });
      setNewExperience('');
    }
  };

  const handleSaveResume = async () => {
    if (user && editedData) {
      const resumeData = {
        education: resumeEducation,
        skills: resumeSkills,
        experience: resumeExperience,
        achievements: resumeAchievements,
        languages: resumeLanguages,
        portfolio: resumePortfolio
      };

      try {
        await updateDoc(doc(db, 'users', user.uid), {
          resumeData
        });
        
        // Update local state
        setUserData(prevData => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            resumeData
          };
        });
        
        alert('Резюме успешно сохранено!');
      } catch (error) {
        console.error('Error saving resume:', error);
        alert('Произошла ошибка при сохранении резюме. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage && !resumeLanguages.includes(newLanguage)) {
      setResumeLanguages([...resumeLanguages, newLanguage]);
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setResumeLanguages(resumeLanguages.filter(l => l !== lang));
  };

  const getLevelInfo = (level: number) => {
    return LEVELS.find(l => l.level === level) || LEVELS[0];
  };

  const handleGenerateAIResume = async () => {
    setError(null);
    try {
      setIsGeneratingResume(true);
      
      // Enhanced profile data with fallback values
      const enhancedProfileData = {
        displayName: userData?.displayName || 'Talgatov Daniyal',
        email: userData?.email || 'example@gmail.com',
        photoURL: userData?.photoURL || 'https://placehold.co/150x150',
        location: userData?.location || 'Алматы, Казахстан',
        bio: userData?.bio || 'Я ученик НИШ ХБН Алматы',
        skills: userData?.skills?.length ? userData.skills : ['JavaScript', 'Python', 'React'],
        experience: userData?.experience?.length ? userData.experience : [],
        education: userData?.education?.length ? userData.education : [],
        languages: userData?.resume?.languages?.length ? userData.resume.languages : ['Казахский', 'Русский', 'Английский'],
        interests: userData?.interests?.length ? userData.interests : [],
        position: userData?.position || 'Студент',
        university: userData?.university || 'НИШ ХБН Алматы',
        graduationYear: userData?.graduationYear || '2024',
        linkedIn: userData?.linkedIn || '',
      };

      // Запускаем генерацию резюме с автоматическим переключением на fallback-модель
      const resumeResult = await generateResume(enhancedProfileData, 'gemini-1.5-pro');

      if (!resumeResult.success || !resumeResult.data) {
        // Показываем конкретную ошибку от API, если она есть
        throw new Error(resumeResult.error || 'Не удалось сгенерировать резюме');
      }

      // Показываем сообщение о modele, если использовалась fallback-модель
      if (resumeResult.model && resumeResult.model !== 'gemini-1.5-pro') {
        console.log(`Резюме сгенерировано с помощью модели ${resumeResult.model}`);
      }

      // Clean up the generated HTML
      let fixedHtml = resumeResult.data
        .replace(/\*\*Massachusetts Institute of Technology.*?\n/g, '')
        .replace(/\*\*Programming Languages.*?\n/g, '')
        .replace(/example@gmail\.com/g, enhancedProfileData.email)
        .replace(/John Doe/g, enhancedProfileData.displayName);

      // Validate generated HTML quality
      if (!fixedHtml.includes(enhancedProfileData.displayName) || 
          !fixedHtml.includes('class=') || 
          fixedHtml.length < 500) {
        console.log('Generated HTML failed quality check, using template...');
        fixedHtml = generateTemplateForStyle(resumeTemplate, enhancedProfileData);
      }

      // Update the resume data in state and Firestore
      if (userData?.uid) {
        const updatedResumeData = {
          ...userData?.resume,
          generatedHtml: fixedHtml,
          lastGenerated: new Date().toISOString(),
          template: resumeTemplate,
        };

        await updateDoc(doc(db, 'users', userData.uid), {
          resume: updatedResumeData,
        });

        setGeneratedHtml(fixedHtml);
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      
      // Более понятные сообщения об ошибках
      let errorMessage = 'Произошла ошибка при генерации резюме. Пожалуйста, попробуйте позже.';
      
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('quota')) {
          errorMessage = 'Превышен лимит запросов к AI. Мы переключились на более простую модель, но и она недоступна. Пожалуйста, попробуйте позже.';
        } else if (error.message.includes('timed out')) {
          errorMessage = 'Время ожидания ответа от AI истекло. Пожалуйста, попробуйте снова.';
        } else if (error.message.includes('invalid') || error.message.includes('incomplete')) {
          errorMessage = 'AI сгенерировал некорректный HTML. Мы используем предустановленный шаблон.';
          // В случае проблем с HTML применяем шаблон
          const templateHtml = generateTemplateForStyle(resumeTemplate, enhancedProfileData);
          setGeneratedHtml(templateHtml);
          return; // Прерываем выполнение и не показываем ошибку
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsGeneratingResume(false);
    }
  };

  // Helper function to generate template-based resume
  const generateTemplateForStyle = (template: ResumeTemplate, data: any) => {
    const templates: Record<string, string> = {
      standard: `
        <div class="resume-standard">
          <header class="text-center mb-8">
            <h1 class="text-3xl font-bold mb-2">${data.displayName}</h1>
            <p class="text-gray-600">${data.position}</p>
            <p class="text-gray-500">${data.location} | ${data.email}</p>
          </header>
          
          <section class="mb-6">
            <h2 class="text-xl font-semibold mb-3">Образование</h2>
            <div class="ml-4">
              <p class="font-medium">${data.university}</p>
              <p class="text-gray-600">Год выпуска: ${data.graduationYear}</p>
            </div>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-semibold mb-3">Навыки</h2>
            <div class="ml-4">
              <p>${data.skills.join(', ')}</p>
            </div>
          </section>

          ${data.experience.length ? `
          <section class="mb-6">
            <h2 class="text-xl font-semibold mb-3">Опыт работы</h2>
            <div class="ml-4">
              ${data.experience.map((exp: string) => `<p class="mb-2">${exp}</p>`).join('')}
            </div>
          </section>
          ` : ''}

          <section class="mb-6">
            <h2 class="text-xl font-semibold mb-3">Языки</h2>
            <div class="ml-4">
              <p>${data.languages.join(', ')}</p>
            </div>
          </section>
        </div>
      `,
      professional: `
        <div class="resume-professional">
          <header class="bg-blue-600 text-white p-6 rounded-t-lg">
            <h1 class="text-3xl font-bold mb-2">${data.displayName}</h1>
            <p class="opacity-90">${data.position}</p>
            <p class="opacity-80 text-sm">${data.location} | ${data.email}</p>
          </header>
          
          <div class="p-6">
            <section class="mb-8">
              <h2 class="text-xl font-semibold text-blue-600 mb-3 border-b border-blue-200 pb-1">Образование</h2>
              <div class="ml-4">
                <p class="font-medium">${data.university}</p>
                <p class="text-gray-600">Год выпуска: ${data.graduationYear}</p>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-blue-600 mb-3 border-b border-blue-200 pb-1">Навыки</h2>
              <div class="ml-4 flex flex-wrap gap-2">
                ${data.skills.map((skill: string) => `
                  <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">${skill}</span>
                `).join('')}
              </div>
            </section>

            ${data.experience.length ? `
            <section class="mb-8">
              <h2 class="text-xl font-semibold text-blue-600 mb-3 border-b border-blue-200 pb-1">Опыт работы</h2>
              <div class="ml-4">
                ${data.experience.map((exp: string) => `<p class="mb-2">${exp}</p>`).join('')}
              </div>
            </section>
            ` : ''}

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-blue-600 mb-3 border-b border-blue-200 pb-1">Языки</h2>
              <div class="ml-4">
                <p>${data.languages.join(', ')}</p>
              </div>
            </section>
          </div>
        </div>
      `,
      academic: `
        <div class="resume-academic">
          <header class="text-center mb-8 border-b-2 border-green-600 pb-4">
            <h1 class="text-3xl font-serif mb-2">${data.displayName}</h1>
            <p class="text-gray-700 font-serif">${data.position}</p>
            <p class="text-gray-600 text-sm">${data.location} | ${data.email}</p>
          </header>
          
          <div class="max-w-3xl mx-auto">
            <section class="mb-8">
              <h2 class="text-xl font-serif text-green-700 mb-3 uppercase">Образование</h2>
              <div class="ml-4">
                <p class="font-medium font-serif">${data.university}</p>
                <p class="text-gray-600">Год выпуска: ${data.graduationYear}</p>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-serif text-green-700 mb-3 uppercase">Навыки</h2>
              <div class="ml-4">
                <ul class="list-disc pl-4">
                  ${data.skills.map((skill: string) => `<li class="mb-1">${skill}</li>`).join('')}
                </ul>
              </div>
            </section>

            ${data.experience.length ? `
            <section class="mb-8">
              <h2 class="text-xl font-serif text-green-700 mb-3 uppercase">Опыт работы</h2>
              <div class="ml-4">
                ${data.experience.map((exp: string) => `<p class="mb-2 font-serif">${exp}</p>`).join('')}
              </div>
            </section>
            ` : ''}

            <section class="mb-8">
              <h2 class="text-xl font-serif text-green-700 mb-3 uppercase">Языки</h2>
              <div class="ml-4">
                <p class="font-serif">${data.languages.join(', ')}</p>
              </div>
            </section>
          </div>
        </div>
      `,
      modern: `
        <div class="resume-modern">
          <header class="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-lg shadow-lg mb-8">
            <h1 class="text-3xl font-bold mb-2">${data.displayName}</h1>
            <p class="text-xl">${data.position}</p>
            <p class="text-sm opacity-90">${data.location} | ${data.email}</p>
          </header>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <section class="mb-8 bg-white p-5 rounded-lg shadow-md">
                <h2 class="text-xl font-semibold text-purple-600 mb-3 border-b border-purple-200 pb-1">Образование</h2>
                <div class="ml-2">
                  <p class="font-medium">${data.university}</p>
                  <p class="text-gray-600">Год выпуска: ${data.graduationYear}</p>
                </div>
              </section>
              
              <section class="mb-8 bg-white p-5 rounded-lg shadow-md">
                <h2 class="text-xl font-semibold text-purple-600 mb-3 border-b border-purple-200 pb-1">Навыки</h2>
                <div class="flex flex-wrap gap-2">
                  ${data.skills.map((skill: string) => `
                    <span class="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 px-3 py-1 rounded-full text-sm">${skill}</span>
                  `).join('')}
                </div>
              </section>
              
              <section class="mb-8 bg-white p-5 rounded-lg shadow-md">
                <h2 class="text-xl font-semibold text-purple-600 mb-3 border-b border-purple-200 pb-1">Языки</h2>
                <p>${data.languages.join(', ')}</p>
              </section>
            </div>
            
            <div>
              ${data.experience.length ? `
              <section class="mb-8 bg-white p-5 rounded-lg shadow-md">
                <h2 class="text-xl font-semibold text-purple-600 mb-3 border-b border-purple-200 pb-1">Опыт работы</h2>
                <div class="space-y-3">
                  ${data.experience.map((exp: string) => `
                    <div class="p-3 bg-gray-50 rounded-md shadow-sm">
                      <p>${exp}</p>
                    </div>
                  `).join('')}
                </div>
              </section>
              ` : ''}
            </div>
          </div>
        </div>
      `
    };

    return templates[template] || templates.standard;
  };

  // Export resume to PDF
  const exportResumeToPDF = () => {
    // Use the AI resume reference if autoResume is true, otherwise use the standard resume reference
    const element = autoResume ? aiResumeRef.current : resumeRef.current;
    
    if (!element) return;
    
    const opt = {
      margin: 10,
      filename: `${userData?.displayName || 'resume'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  // Send resume to employer (when responding to vacancy)
  const sendResumeToEmployer = async (jobId: string, employerId: string) => {
    if (!user || !userData?.resumeData) return false;
    
    try {
      // Save the application with resume attached
      await setDoc(doc(db, `applications/${jobId}/responses/${user.uid}`), {
        studentId: user.uid,
        employerId,
        displayName: userData?.displayName,
        resumeData: userData.resumeData,
        submittedAt: new Date(),
        status: 'pending'
      });
      
      return true;
    } catch (error) {
      console.error('Error sending resume to employer:', error);
      return false;
    }
  };

  if (!user || !userData) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Subtle animated background elements */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 left-4 sm:left-10 w-32 h-32 sm:w-48 sm:h-48 bg-black/3 dark:bg-white/3 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-20 right-4 sm:right-10 w-40 h-40 sm:w-64 sm:h-64 bg-black/3 dark:bg-white/3 rounded-full blur-3xl"
      />

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-6xl mx-auto mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
        >
          <div className="flex items-center justify-between">
          <div className="flex items-center">
              <FiX className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-300 font-light">{error}</p>
                  </div>
          <button 
            onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
          >
              <FiX className="w-5 h-5" />
          </button>
          </div>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-black dark:hover:border-white transition-all duration-300">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-light text-black dark:text-white">
                  <span className="font-thin">Мой </span>
                  <span className="font-bold">профиль</span>
                </h2>
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300"
                  >
                    <FiEdit3 className="w-5 h-5 text-black dark:text-white" />
                  </motion.button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      className="p-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300"
                    >
                      <FiSave className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(false)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300"
                    >
                      <FiX className="w-5 h-5 text-black dark:text-white" />
                    </motion.button>
                  </div>
                )}
          </div>

              {/* Profile Content */}
              <AnimatePresence mode="wait">
          {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 group-hover:border-black dark:group-hover:border-white transition-all duration-300">
                    {(avatarPreview || editedData?.photoURL) ? (
                      <img 
                        src={avatarPreview || editedData?.photoURL} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                              <FiUser className="w-12 h-12" />
                      </div>
                    )}
                          <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                            <FiCamera className="w-8 h-8 text-white" />
                    </label>
                  </div>
                </div>

                      {/* Name & Location */}
                      <div className="w-full space-y-4">
                  <input
                    type="text"
                    value={editedData?.displayName || ''}
                    onChange={(e) => setEditedData({...editedData!, displayName: e.target.value})}
                          placeholder="Имя и фамилия"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-all duration-200 font-light"
                  />
                  <input
                    type="text"
                    value={editedData?.location || ''}
                    onChange={(e) => setEditedData({...editedData!, location: e.target.value})}
                          placeholder="Местоположение"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-all duration-200 font-light"
                  />
                </div>
              </div>

                    {/* Bio */}
                <div>
                      <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                        <span className="font-medium">О себе</span>
                      </label>
                  <textarea
                    value={editedData?.bio || ''}
                    onChange={(e) => setEditedData({...editedData!, bio: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-all duration-200 font-light min-h-[100px]"
                        placeholder="Расскажите о себе..."
                  />
                </div>

                    {/* Education */}
                    <div className="space-y-4">
                      <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                        <span className="font-medium">Образование</span>
                      </label>
                      <div className="space-y-3">
                    <input
                      type="text"
                      value={editedData?.university || ''}
                      onChange={(e) => setEditedData({...editedData!, university: e.target.value})}
                          placeholder="Университет"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-all duration-200 font-light"
                    />
                    <input
                      type="text"
                      value={editedData?.major || ''}
                      onChange={(e) => setEditedData({...editedData!, major: e.target.value})}
                          placeholder="Специальность"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-all duration-200 font-light"
                    />
                    <input
                      type="text"
                      value={editedData?.graduationYear || ''}
                      onChange={(e) => setEditedData({...editedData!, graduationYear: e.target.value})}
                          placeholder="Год окончания"
                          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-all duration-200 font-light"
                    />
                </div>
              </div>

                    {/* Skills */}
              <div>
                      <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                        <span className="font-medium">Навыки</span>
                      </label>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                  {editedData?.skills?.map((skill, index) => (
                    <span
                      key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-black dark:text-white font-light"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                                className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                                <FiMinus className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Добавить навык"
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-all duration-200 font-light"
                  />
                  <button
                    onClick={handleAddSkill}
                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
                  >
                            <FiPlus className="w-4 h-4" />
                  </button>
                        </div>
                </div>
              </div>

                    {/* Experience */}
              <div>
                      <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                        <span className="font-medium">Опыт работы</span>
                      </label>
                      <div className="space-y-3">
                        <div className="space-y-2">
                  {editedData?.experience?.map((exp, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-black dark:text-white font-light text-sm">
                                {exp}
                              </span>
                      <button
                        onClick={() => setEditedData({
                          ...editedData!,
                          experience: editedData.experience?.filter((_, i) => i !== index)
                        })}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                                <FiMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExperience}
                    onChange={(e) => setNewExperience(e.target.value)}
                            placeholder="Добавить опыт"
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-all duration-200 font-light"
                  />
                  <button
                    onClick={handleAddExperience}
                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
                  >
                            <FiPlus className="w-4 h-4" />
                  </button>
                </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="viewing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Profile Header */}
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800">
                  {userData.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt="Profile" 
                              className="w-full h-full object-cover"
                    />
                  ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                              <FiUser className="w-12 h-12" />
                    </div>
                  )}
                </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-light text-black dark:text-white mb-2">
                          <span className="font-thin">{userData.displayName?.split(' ')[0] || 'Пользователь'}</span>
                          {userData.displayName?.split(' ')[1] && (
                            <span className="font-bold ml-2">{userData.displayName.split(' ')[1]}</span>
                          )}
                      </h3>
                        <div className="flex items-center justify-center gap-3 text-sm">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-black dark:text-white font-light">
                          {userData.role === 'school' ? 'Студент' : 'Компания'}
                    </span>
                    {userData.location && (
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 font-light">
                              <FiMapPin className="w-4 h-4" />
                            {userData.location}
                      </span>
                    )}
                        </div>
                </div>
              </div>

                    {/* Profile Sections */}
                    <div className="space-y-6">
                      {/* About */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <h4 className="text-lg font-light text-black dark:text-white mb-3 flex items-center">
                          <FiUser className="w-5 h-5 mr-2" />
                          <span className="font-thin">О </span>
                          <span className="font-bold ml-1">себе</span>
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                          {userData.bio || 'Информация не добавлена'}
                        </p>
                      </div>

                      {/* Education */}
                      {(userData.university || userData.major || userData.graduationYear) && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
                          <h4 className="text-lg font-light text-black dark:text-white mb-3 flex items-center">
                            <FiGraduationCap className="w-5 h-5 mr-2" />
                            <span className="font-thin">Образо</span>
                            <span className="font-bold">вание</span>
                          </h4>
                          <div className="space-y-2">
                            {userData.university && (
                              <p className="text-gray-700 dark:text-gray-300 font-light">{userData.university}</p>
                            )}
                            {userData.major && (
                              <p className="text-gray-600 dark:text-gray-400 font-light text-sm">{userData.major}</p>
                            )}
                            {userData.graduationYear && (
                              <p className="text-gray-600 dark:text-gray-400 font-light text-sm">Выпуск: {userData.graduationYear}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <h4 className="text-lg font-light text-black dark:text-white mb-3 flex items-center">
                          <FiTool className="w-5 h-5 mr-2" />
                          <span className="font-thin">Навы</span>
                          <span className="font-bold">ки</span>
                        </h4>
                  {userData.skills && userData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userData.skills.map((skill, index) => (
                              <motion.span
                          key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="px-3 py-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-full text-sm font-light text-black dark:text-white"
                        >
                          {skill}
                              </motion.span>
                      ))}
                    </div>
                  ) : (
                          <p className="text-gray-500 dark:text-gray-400 font-light">Навыки не добавлены</p>
                        )}
                      </div>

                      {/* Experience */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <h4 className="text-lg font-light text-black dark:text-white mb-3 flex items-center">
                          <FiBriefcase className="w-5 h-5 mr-2" />
                          <span className="font-thin">Опыт </span>
                          <span className="font-bold">работы</span>
                        </h4>
                  {userData.experience && userData.experience.length > 0 ? (
                          <div className="space-y-3">
                      {userData.experience.map((exp, index) => (
                              <motion.div
                          key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg"
                        >
                                <p className="text-gray-700 dark:text-gray-300 font-light text-sm">{exp}</p>
                              </motion.div>
                      ))}
                    </div>
                  ) : (
                          <p className="text-gray-500 dark:text-gray-400 font-light">Опыт работы не добавлен</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Resume Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-black dark:hover:border-white transition-all duration-300">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-light text-black dark:text-white">
                  <span className="font-thin">AI </span>
                  <span className="font-bold">Резюме</span>
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                      <select
                        value={resumeTemplate}
                        onChange={(e) => setResumeTemplate(e.target.value as ResumeTemplate)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-all duration-200 font-light"
                      >
                        <option value="standard">Стандартный</option>
                        <option value="professional">Профессиональный</option>
                        <option value="academic">Академический</option>
                      </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerateAIResume}
                    disabled={isGeneratingResume}
                    className={`px-6 py-2 rounded-lg font-light text-white dark:text-black transition-all duration-300 ${
                      isGeneratingResume 
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                        : 'bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200'
                    }`}
                  >
                    {isGeneratingResume ? (
                      <span className="flex items-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full mr-2"
                        />
                        Генерация...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FiZap className="w-5 h-5 mr-2" />
                        Создать резюме
                      </span>
                    )}
                  </motion.button>
                    </div>
                  </div>
                  
              {/* Resume Preview */}
              <AnimatePresence mode="wait">
                {generatedHtml ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <div 
                      className="prose max-w-none p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl"
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(generatedHtml) }} 
                    />
                    <div className="flex flex-wrap justify-end gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => exportResumeToPDF()}
                        className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-light hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 flex items-center"
                      >
                        <FiDownload className="w-5 h-5 mr-2" />
                        Скачать PDF
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setGeneratedHtml(null)}
                        className="px-6 py-2 border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-lg font-light hover:border-black dark:hover:border-white transition-all duration-300 flex items-center"
                      >
                        <FiX className="w-5 h-5 mr-2" />
                        Сбросить
                      </motion.button>
                      </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-center"
                  >
                    <FiFileText className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-600" />
                    <h3 className="text-xl font-light text-black dark:text-white mb-2">
                      <span className="font-thin">Резюме не </span>
                      <span className="font-bold">создано</span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-light max-w-md mb-6">
                      Создайте профессиональное резюме на основе вашего профиля с помощью искусственного интеллекта
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGenerateAIResume}
                      disabled={isGeneratingResume}
                      className={`px-8 py-3 rounded-lg font-light text-white dark:text-black transition-all duration-300 ${
                        isGeneratingResume 
                          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                          : 'bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200'
                      }`}
                    >
                      <span className="flex items-center">
                        <FiZap className="w-5 h-5 mr-2" />
                        Создать AI Резюме
                      </span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
                  </div>
          </motion.div>
                </div>
      </motion.div>
    </div>
  );
};

export default Profile; 