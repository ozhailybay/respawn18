import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserData } from '../types';

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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface ProfileEditProps {
  userData: UserData | null;
  onSave: (formData: Partial<UserData>) => Promise<void>;
  onCancel: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ userData, onSave, onCancel }) => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<UserData>>(userData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('personal');

  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData(userData);
    }
  }, [userData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: string, index: number, value: any) => {
    setFormData(prev => {
      const array = [...(prev[field as keyof UserData] as any[] || [])];
      array[index] = { ...array[index], ...value };
      return {
        ...prev,
        [field]: array
      };
    });
  };

  const handleAddArrayItem = (field: string, item: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof UserData] as any[] || []), item]
    }));
  };

  const handleRemoveArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof UserData] as any[] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const sections = [
    { id: 'personal', label: 'Личная информация' },
    { id: 'academic', label: 'Образование' },
    { id: 'skills', label: 'Навыки и проекты' },
    { id: 'experience', label: 'Опыт работы' },
    { id: 'achievements', label: 'Достижения' },
    { id: 'preferences', label: 'Карьерные предпочтения' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 md:p-6 sticky top-24">
              <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 md:space-y-2 pb-2 md:pb-0">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`whitespace-nowrap md:whitespace-normal px-4 py-2 rounded-lg transition-colors text-sm md:text-base flex-shrink-0 md:flex-shrink ${
                      activeSection === section.id
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Редактирование профиля
                </h1>
                <div className="flex gap-3">
                  <button
                    onClick={onCancel}
                    className="flex-1 sm:flex-auto px-4 md:px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="flex-1 sm:flex-auto px-4 md:px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Сохранить
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg">
                  {error}
                </div>
              )}

              <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Personal Information Section */}
                {activeSection === 'personal' && (
                  <motion.div variants={itemVariants} className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Личная информация
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Имя
                        </label>
                        <input
                          type="text"
                          value={formData.firstName || ''}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="Ваше имя"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Фамилия
                        </label>
                        <input
                          type="text"
                          value={formData.lastName || ''}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="Ваша фамилия"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="example@mail.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Телефон
                        </label>
                        <input
                          type="tel"
                          value={formData.phoneNumber || ''}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="+7 (XXX) XXX-XX-XX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Город
                        </label>
                        <input
                          type="text"
                          value={formData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="Например: Алматы"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Дата рождения
                        </label>
                        <input
                          type="date"
                          value={formData.birthDate || ''}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* О себе */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        О себе
                      </label>
                      <textarea
                        value={formData.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="Расскажите немного о себе, своих интересах и целях"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Это поможет работодателям лучше понять, кто вы и чем интересуетесь
                      </p>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Социальные сети
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            LinkedIn
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                              linkedin.com/in/
                            </span>
                          <input
                              type="text"
                              value={(formData.socialLinks?.linkedin || '').replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                              onChange={(e) => handleInputChange('socialLinks.linkedin', `https://linkedin.com/in/${e.target.value}`)}
                              className="flex-1 px-4 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              placeholder="username"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            GitHub
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                              github.com/
                            </span>
                          <input
                              type="text"
                              value={(formData.socialLinks?.github || '').replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                              onChange={(e) => handleInputChange('socialLinks.github', `https://github.com/${e.target.value}`)}
                              className="flex-1 px-4 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              placeholder="username"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Портфолио
                          </label>
                          <input
                            type="url"
                            value={formData.socialLinks?.portfolio || ''}
                            onChange={(e) => handleInputChange('socialLinks.portfolio', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            placeholder="https://yourportfolio.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Twitter
                          </label>
                          <input
                            type="url"
                            value={formData.socialLinks?.twitter || ''}
                            onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            placeholder="https://twitter.com/username"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Privacy Settings
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Profile Visibility
                          </label>
                          <select
                            value={formData.privacySettings?.profileVisibility || 'private'}
                            onChange={(e) => handleInputChange('privacySettings.profileVisibility', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="recruiters">Recruiters Only</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.privacySettings?.showEmail || false}
                              onChange={(e) => handleInputChange('privacySettings.showEmail', e.target.checked)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Show email to other users
                            </span>
                          </label>

                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.privacySettings?.showPhone || false}
                              onChange={(e) => handleInputChange('privacySettings.showPhone', e.target.checked)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Show phone number to other users
                            </span>
                          </label>

                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.privacySettings?.showSalary || false}
                              onChange={(e) => handleInputChange('privacySettings.showSalary', e.target.checked)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Show salary expectations
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Academic Information Section */}
                {activeSection === 'academic' && (
                  <motion.div variants={itemVariants} className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Образование
                    </h2>

                    {/* Student Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Студенческий ID
                        </label>
                        <input
                          type="text"
                          value={formData.studentId || ''}
                          onChange={(e) => handleInputChange('studentId', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Учебный год
                        </label>
                        <select
                          value={formData.academicYear || ''}
                          onChange={(e) => handleInputChange('academicYear', parseInt(e.target.value))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Выберите год</option>
                          <option value="1">1-й курс</option>
                          <option value="2">2-й курс</option>
                          <option value="3">3-й курс</option>
                          <option value="4">4-й курс</option>
                          <option value="5">5-й курс</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Специальность
                        </label>
                        <input
                          type="text"
                          value={formData.major || ''}
                          onChange={(e) => handleInputChange('major', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Минор (Необязательно)
                        </label>
                        <input
                          type="text"
                          value={formData.minor || ''}
                          onChange={(e) => handleInputChange('minor', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          GPA
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4.0"
                          value={formData.gpa || ''}
                          onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ожидаемая дата окончания
                        </label>
                        <input
                          type="month"
                          value={formData.expectedGraduation || ''}
                          onChange={(e) => handleInputChange('expectedGraduation', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Education History */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Education History
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('education', {
                            degree: '',
                            field: '',
                            institution: '',
                            location: '',
                            startDate: '',
                            endDate: '',
                            gpa: null,
                            highlights: [],
                            relevantCourses: []
                          })}
                          className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                          Add Education
                        </button>
                      </div>

                      {(formData.education || []).map((edu, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className="p-6 bg-gray-50 dark:bg-slate-700/30 rounded-xl space-y-4"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              Education #{index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveArrayItem('education', index)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Degree
                              </label>
                              <input
                                type="text"
                                value={edu.degree || ''}
                                onChange={(e) => handleArrayInputChange('education', index, { degree: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Field of Study
                              </label>
                              <input
                                type="text"
                                value={edu.field || ''}
                                onChange={(e) => handleArrayInputChange('education', index, { field: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Institution
                              </label>
                              <input
                                type="text"
                                value={edu.institution || ''}
                                onChange={(e) => handleArrayInputChange('education', index, { institution: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Location
                              </label>
                              <input
                                type="text"
                                value={edu.location || ''}
                                onChange={(e) => handleArrayInputChange('education', index, { location: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Date
                              </label>
                              <input
                                type="month"
                                value={edu.startDate || ''}
                                onChange={(e) => handleArrayInputChange('education', index, { startDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End Date (or Expected)
                              </label>
                              <input
                                type="month"
                                value={edu.endDate || ''}
                                onChange={(e) => handleArrayInputChange('education', index, { endDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                GPA (Optional)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="4.0"
                                value={edu.gpa || ''}
                                onChange={(e) => handleArrayInputChange('education', index, { gpa: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Relevant Courses
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {edu.relevantCourses?.map((course, courseIndex) => (
                                <div
                                  key={courseIndex}
                                  className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg"
                                >
                                  <span>{course}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newCourses = edu.relevantCourses?.filter((_, i) => i !== courseIndex);
                                      handleArrayInputChange('education', index, { relevantCourses: newCourses });
                                    }}
                                    className="ml-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <input
                                type="text"
                                placeholder="Add course"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const newCourse = input.value.trim();
                                    if (newCourse) {
                                      const newCourses = [...(edu.relevantCourses || []), newCourse];
                                      handleArrayInputChange('education', index, { relevantCourses: newCourses });
                                      input.value = '';
                                    }
                                  }
                                }}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Highlights & Achievements
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {edu.highlights?.map((highlight, highlightIndex) => (
                                <div
                                  key={highlightIndex}
                                  className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg"
                                >
                                  <span>{highlight}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newHighlights = edu.highlights?.filter((_, i) => i !== highlightIndex);
                                      handleArrayInputChange('education', index, { highlights: newHighlights });
                                    }}
                                    className="ml-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <input
                                type="text"
                                placeholder="Add highlight"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const newHighlight = input.value.trim();
                                    if (newHighlight) {
                                      const newHighlights = [...(edu.highlights || []), newHighlight];
                                      handleArrayInputChange('education', index, { highlights: newHighlights });
                                      input.value = '';
                                    }
                                  }
                                }}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Skills & Projects Section */}
                {activeSection === 'skills' && (
                  <motion.div variants={itemVariants} className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Навыки и проекты
                    </h2>

                    {/* Skills */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Мои навыки
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('skills', {
                            name: '',
                            level: 'intermediate',
                            category: 'technical'
                          })}
                          className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors w-full sm:w-auto flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Добавить навык
                        </button>
                      </div>

                      {/* Quick Add Popular Skills */}
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">
                          Популярные навыки — нажмите, чтобы добавить
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'JavaScript', 'React', 'Python', 'HTML/CSS', 'SQL', 'Java', 'Node.js', 
                            'TypeScript', 'Git', 'Docker', 'UI/UX', 'Figma', 'C++', 'PHP',
                            'Photoshop', 'Excel', 'Word', 'PowerPoint', 'Английский язык'
                          ].map((skill) => {
                            const alreadyAdded = (formData.skills || []).some(s => 
                              s.name?.toLowerCase() === skill.toLowerCase()
                            );
                            
                            return (
                              <button
                                key={skill}
                                type="button"
                                disabled={alreadyAdded}
                                onClick={() => {
                                  if (!alreadyAdded) {
                                    handleAddArrayItem('skills', {
                                      name: skill,
                                      level: 'intermediate',
                                      category: skill === 'Английский язык' ? 'language' : 'technical'
                                    });
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                  alreadyAdded
                                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700/30 dark:text-gray-500 cursor-not-allowed'
                                    : 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                }`}
                              >
                                {alreadyAdded ? (
                                  <span className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {skill}
                                  </span>
                                ) : skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Skills List */}
                      <div className="grid grid-cols-1 gap-4">
                        {(formData.skills || []).length === 0 ? (
                          <div className="p-8 bg-gray-50 dark:bg-slate-700/30 rounded-xl text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400">У вас пока нет добавленных навыков</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Добавьте навыки, чтобы выделиться среди других кандидатов</p>
                          </div>
                        ) : (
                          (formData.skills || []).map((skill, index) => (
                          <motion.div
                            key={index}
                            variants={itemVariants}
                              className="p-4 bg-white dark:bg-slate-800 rounded-xl space-y-3 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-md transition-shadow"
                            >
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Название навыка
                                  </label>
                              <input
                                type="text"
                                value={skill.name || ''}
                                onChange={(e) => handleArrayInputChange('skills', index, { name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    placeholder="Например: JavaScript"
                                  />
                            </div>

                                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                              <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                      Уровень владения
                                </label>
                                <select
                                  value={skill.level || 'beginner'}
                                  onChange={(e) => handleArrayInputChange('skills', index, { level: e.target.value })}
                                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    >
                                      <option value="beginner">Начинающий</option>
                                      <option value="intermediate">Средний</option>
                                      <option value="advanced">Продвинутый</option>
                                </select>
                              </div>

                              <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                      Категория
                                </label>
                                <select
                                  value={skill.category || 'technical'}
                                  onChange={(e) => handleArrayInputChange('skills', index, { category: e.target.value })}
                                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    >
                                      <option value="technical">Технический</option>
                                      <option value="soft">Софт-скилл</option>
                                      <option value="language">Язык</option>
                                      <option value="other">Другое</option>
                                </select>
                                  </div>
                                </div>
                              </div>

                              {/* Visual Skill Level Indicator */}
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {skill.level === 'beginner' && 'Начинающий'}
                                    {skill.level === 'intermediate' && 'Средний'}
                                    {skill.level === 'advanced' && 'Продвинутый'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveArrayItem('skills', index)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm flex items-center"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Удалить
                                  </button>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      skill.level === 'beginner' ? 'w-1/3 bg-blue-500' :
                                      skill.level === 'intermediate' ? 'w-2/3 bg-indigo-500' :
                                      'w-full bg-purple-500'
                                    }`}
                                  ></div>
                              </div>
                            </div>
                          </motion.div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="space-y-4 mt-10">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Мои проекты
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('projects', {
                            name: '',
                            description: '',
                            technologies: [],
                            role: '',
                            startDate: '',
                            endDate: '',
                            url: '',
                            repository: '',
                            highlights: []
                          })}
                          className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors w-full sm:w-auto flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Добавить проект
                        </button>
                      </div>

                      {(formData.projects || []).length === 0 ? (
                        <div className="p-8 bg-gray-50 dark:bg-slate-700/30 rounded-xl text-center">
                          <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400">У вас пока нет добавленных проектов</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Добавьте проекты, чтобы продемонстрировать ваш опыт</p>
                        </div>
                      ) : (
                        (formData.projects || []).map((project, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                            className="p-6 bg-white dark:bg-slate-800 rounded-xl space-y-4 shadow-sm border border-gray-100 dark:border-slate-700/50"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                Проект #{index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveArrayItem('projects', index)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center text-sm"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Удалить
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Название проекта
                              </label>
                              <input
                                type="text"
                                value={project.name || ''}
                                onChange={(e) => handleArrayInputChange('projects', index, { name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                  placeholder="Например: Онлайн-магазин"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Ваша роль
                              </label>
                              <input
                                type="text"
                                value={project.role || ''}
                                onChange={(e) => handleArrayInputChange('projects', index, { role: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                  placeholder="Например: Frontend-разработчик"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Описание
                              </label>
                              <textarea
                                value={project.description || ''}
                                onChange={(e) => handleArrayInputChange('projects', index, { description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                  placeholder="Опишите, что это за проект и какие задачи вы решали"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Дата начала
                              </label>
                              <input
                                type="month"
                                value={project.startDate || ''}
                                onChange={(e) => handleArrayInputChange('projects', index, { startDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Дата окончания
                              </label>
                              <input
                                type="month"
                                value={project.endDate || ''}
                                onChange={(e) => handleArrayInputChange('projects', index, { endDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Ссылка на проект
                              </label>
                              <input
                                type="url"
                                value={project.url || ''}
                                onChange={(e) => handleArrayInputChange('projects', index, { url: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                placeholder="https://..."
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Ссылка на репозиторий
                              </label>
                              <input
                                type="url"
                                value={project.repository || ''}
                                onChange={(e) => handleArrayInputChange('projects', index, { repository: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                placeholder="https://github.com/..."
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Использованные технологии
                            </label>
                              <div className="flex flex-wrap gap-2 mb-2">
                              {project.technologies?.map((tech, techIndex) => (
                                <div
                                  key={techIndex}
                                    className="flex items-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full"
                                >
                                  <span>{tech}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newTech = project.technologies?.filter((_, i) => i !== techIndex);
                                      handleArrayInputChange('projects', index, { technologies: newTech });
                                    }}
                                      className="ml-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              </div>
                              <div className="flex">
                              <input
                                type="text"
                                  placeholder="Добавить технологию"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const newTech = input.value.trim();
                                    if (newTech) {
                                      const newTechs = [...(project.technologies || []), newTech];
                                      handleArrayInputChange('projects', index, { technologies: newTechs });
                                      input.value = '';
                                    }
                                  }
                                }}
                                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                                    const newTech = input.value.trim();
                                    if (newTech) {
                                      const newTechs = [...(project.technologies || []), newTech];
                                      handleArrayInputChange('projects', index, { technologies: newTechs });
                                      input.value = '';
                                    }
                                  }}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                                >
                                  Добавить
                                </button>
                            </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Нажмите Enter или кнопку "Добавить" после ввода технологии
                              </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Ключевые достижения
                            </label>
                              <div className="flex flex-wrap gap-2 mb-2">
                              {project.highlights?.map((highlight, highlightIndex) => (
                                <div
                                  key={highlightIndex}
                                    className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-full"
                                >
                                  <span>{highlight}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newHighlights = project.highlights?.filter((_, i) => i !== highlightIndex);
                                      handleArrayInputChange('projects', index, { highlights: newHighlights });
                                    }}
                                    className="ml-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              </div>
                              <div className="flex">
                              <input
                                type="text"
                                  placeholder="Добавить достижение"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const newHighlight = input.value.trim();
                                    if (newHighlight) {
                                      const newHighlights = [...(project.highlights || []), newHighlight];
                                      handleArrayInputChange('projects', index, { highlights: newHighlights });
                                      input.value = '';
                                    }
                                  }
                                }}
                                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                                    const newHighlight = input.value.trim();
                                    if (newHighlight) {
                                      const newHighlights = [...(project.highlights || []), newHighlight];
                                      handleArrayInputChange('projects', index, { highlights: newHighlights });
                                      input.value = '';
                                    }
                                  }}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                                >
                                  Добавить
                                </button>
                            </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Например: "Увеличил скорость загрузки на 40%", "Реализовал новую функцию"
                              </p>
                          </div>
                        </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Experience Section */}
                {activeSection === 'experience' && (
                  <motion.div variants={itemVariants} className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Опыт работы
                    </h2>

                    {/* Work Experience */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Рабочий опыт
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('experience', {
                            title: '',
                            company: '',
                            location: '',
                            type: 'internship',
                            startDate: '',
                            endDate: '',
                            current: false,
                            description: '',
                            achievements: [],
                            technologies: []
                          })}
                          className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors w-full sm:w-auto flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Добавить опыт работы
                        </button>
                      </div>

                      {(formData.experience || []).length === 0 ? (
                        <div className="p-8 bg-gray-50 dark:bg-slate-700/30 rounded-xl text-center">
                          <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400">У вас пока нет добавленного опыта работы</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Добавьте опыт работы, чтобы показать свои профессиональные достижения</p>
                        </div>
                      ) : (
                        (formData.experience || []).map((exp, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                            className="p-6 bg-white dark:bg-slate-800 rounded-xl space-y-4 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                Опыт работы #{index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveArrayItem('experience', index)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Удалить
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Должность
                              </label>
                              <input
                                type="text"
                                value={exp.title || ''}
                                onChange={(e) => handleArrayInputChange('experience', index, { title: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                  placeholder="Например: Разработчик"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Компания
                              </label>
                              <input
                                type="text"
                                value={exp.company || ''}
                                onChange={(e) => handleArrayInputChange('experience', index, { company: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                  placeholder="Например: ООО Технологии"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Местоположение
                              </label>
                              <input
                                type="text"
                                value={exp.location || ''}
                                onChange={(e) => handleArrayInputChange('experience', index, { location: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                  placeholder="Например: Алматы, Казахстан"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Тип занятости
                              </label>
                              <select
                                value={exp.type || 'internship'}
                                onChange={(e) => handleArrayInputChange('experience', index, { type: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              >
                                  <option value="internship">Стажировка</option>
                                  <option value="part-time">Неполный рабочий день</option>
                                  <option value="full-time">Полный рабочий день</option>
                                  <option value="volunteer">Волонтерство</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Дата начала
                              </label>
                              <input
                                type="month"
                                value={exp.startDate || ''}
                                onChange={(e) => handleArrayInputChange('experience', index, { startDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Дата окончания
                              </label>
                              <div className="space-y-2">
                                <input
                                  type="month"
                                  value={exp.endDate || ''}
                                  onChange={(e) => handleArrayInputChange('experience', index, { endDate: e.target.value })}
                                  disabled={exp.current}
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-50"
                                />
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={exp.current || false}
                                    onChange={(e) => handleArrayInputChange('experience', index, { current: e.target.checked })}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                      Я работаю здесь в настоящее время
                                  </span>
                                </label>
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Описание
                              </label>
                              <textarea
                                value={exp.description || ''}
                                onChange={(e) => handleArrayInputChange('experience', index, { description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                  placeholder="Опишите свои обязанности и задачи"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Используемые технологии
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {exp.technologies?.map((tech, techIndex) => (
                                <div
                                  key={techIndex}
                                  className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg"
                                >
                                  <span>{tech}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newTech = exp.technologies?.filter((_, i) => i !== techIndex);
                                      handleArrayInputChange('experience', index, { technologies: newTech });
                                    }}
                                    className="ml-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <input
                                type="text"
                                  placeholder="Добавить технологию"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const newTech = input.value.trim();
                                    if (newTech) {
                                      const newTechs = [...(exp.technologies || []), newTech];
                                      handleArrayInputChange('experience', index, { technologies: newTechs });
                                      input.value = '';
                                    }
                                  }
                                }}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Ключевые достижения
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {exp.achievements?.map((achievement, achievementIndex) => (
                                <div
                                  key={achievementIndex}
                                  className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg"
                                >
                                  <span>{achievement}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newAchievements = exp.achievements?.filter((_, i) => i !== achievementIndex);
                                      handleArrayInputChange('experience', index, { achievements: newAchievements });
                                    }}
                                    className="ml-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <input
                                type="text"
                                  placeholder="Добавить достижение"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const newAchievement = input.value.trim();
                                    if (newAchievement) {
                                      const newAchievements = [...(exp.achievements || []), newAchievement];
                                      handleArrayInputChange('experience', index, { achievements: newAchievements });
                                      input.value = '';
                                    }
                                  }
                                }}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                        ))
                      )}
                    </div>

                    {/* Volunteer Work */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Волонтерская работа
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('volunteerWork', {
                            organization: '',
                            role: '',
                            startDate: '',
                            endDate: '',
                            description: '',
                            achievements: []
                          })}
                          className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors w-full sm:w-auto flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Добавить волонтерскую работу
                        </button>
                      </div>

                      {(formData.volunteerWork || []).map((volunteer, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className="p-6 bg-gray-50 dark:bg-slate-700/30 rounded-xl space-y-4"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              Volunteer Work #{index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveArrayItem('volunteerWork', index)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Organization
                              </label>
                              <input
                                type="text"
                                value={volunteer.organization || ''}
                                onChange={(e) => handleArrayInputChange('volunteerWork', index, { organization: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Role
                              </label>
                              <input
                                type="text"
                                value={volunteer.role || ''}
                                onChange={(e) => handleArrayInputChange('volunteerWork', index, { role: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Date
                              </label>
                              <input
                                type="month"
                                value={volunteer.startDate || ''}
                                onChange={(e) => handleArrayInputChange('volunteerWork', index, { startDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End Date
                              </label>
                              <input
                                type="month"
                                value={volunteer.endDate || ''}
                                onChange={(e) => handleArrayInputChange('volunteerWork', index, { endDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                              </label>
                              <textarea
                                value={volunteer.description || ''}
                                onChange={(e) => handleArrayInputChange('volunteerWork', index, { description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Key Achievements
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {volunteer.achievements?.map((achievement, achievementIndex) => (
                                <div
                                  key={achievementIndex}
                                  className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg"
                                >
                                  <span>{achievement}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newAchievements = volunteer.achievements?.filter((_, i) => i !== achievementIndex);
                                      handleArrayInputChange('volunteerWork', index, { achievements: newAchievements });
                                    }}
                                    className="ml-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <input
                                type="text"
                                placeholder="Add achievement"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const newAchievement = input.value.trim();
                                    if (newAchievement) {
                                      const newAchievements = [...(volunteer.achievements || []), newAchievement];
                                      handleArrayInputChange('volunteerWork', index, { achievements: newAchievements });
                                      input.value = '';
                                    }
                                  }
                                }}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Achievements Section */}
                {activeSection === 'achievements' && (
                  <motion.div variants={itemVariants} className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Достижения и сертификаты
                    </h2>

                    {/* Certifications */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Сертификаты
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('certifications', {
                            name: '',
                            issuer: '',
                            date: '',
                            expiryDate: '',
                            credentialId: '',
                            url: ''
                          })}
                          className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors w-full sm:w-auto flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Добавить сертификат
                        </button>
                      </div>

                      {(formData.certifications || []).length === 0 ? (
                        <div className="p-8 bg-gray-50 dark:bg-slate-700/30 rounded-xl text-center">
                          <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400">У вас пока нет добавленных сертификатов</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Добавьте сертификаты, чтобы подтвердить свои навыки</p>
                        </div>
                      ) : (
                        (formData.certifications || []).map((cert, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                            className="p-6 bg-white dark:bg-slate-800 rounded-xl space-y-4 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                Сертификат #{index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveArrayItem('certifications', index)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Удалить
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Название сертификата
                              </label>
                              <input
                                type="text"
                                value={cert.name || ''}
                                onChange={(e) => handleArrayInputChange('certifications', index, { name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                  placeholder="Например: React Developer"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Организация, выдавшая сертификат
                              </label>
                              <input
                                type="text"
                                value={cert.issuer || ''}
                                onChange={(e) => handleArrayInputChange('certifications', index, { issuer: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                  placeholder="Например: Coursera"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Дата выдачи
                              </label>
                              <input
                                type="month"
                                value={cert.date || ''}
                                onChange={(e) => handleArrayInputChange('certifications', index, { date: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Дата окончания (если есть)
                              </label>
                              <input
                                type="month"
                                value={cert.expiryDate || ''}
                                onChange={(e) => handleArrayInputChange('certifications', index, { expiryDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  ID сертификата
                              </label>
                              <input
                                type="text"
                                value={cert.credentialId || ''}
                                onChange={(e) => handleArrayInputChange('certifications', index, { credentialId: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                  placeholder="Например: ABC-123-XYZ"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Ссылка на сертификат
                              </label>
                              <input
                                type="url"
                                value={cert.url || ''}
                                onChange={(e) => handleArrayInputChange('certifications', index, { url: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        </motion.div>
                        ))
                      )}
                    </div>

                    {/* Achievements */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Achievements
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('achievements', {
                            title: '',
                            date: '',
                            description: '',
                            issuer: ''
                          })}
                          className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                          Add Achievement
                        </button>
                      </div>

                      {(formData.achievements || []).map((achievement, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className="p-6 bg-gray-50 dark:bg-slate-700/30 rounded-xl space-y-4"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              Achievement #{index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveArrayItem('achievements', index)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Achievement Title
                              </label>
                              <input
                                type="text"
                                value={achievement.title || ''}
                                onChange={(e) => handleArrayInputChange('achievements', index, { title: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Date
                              </label>
                              <input
                                type="month"
                                value={achievement.date || ''}
                                onChange={(e) => handleArrayInputChange('achievements', index, { date: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Issuer/Organization
                              </label>
                              <input
                                type="text"
                                value={achievement.issuer || ''}
                                onChange={(e) => handleArrayInputChange('achievements', index, { issuer: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                              </label>
                              <textarea
                                value={achievement.description || ''}
                                onChange={(e) => handleArrayInputChange('achievements', index, { description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Languages */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Languages
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('languages', {
                            name: '',
                            proficiency: 'beginner',
                            certifications: []
                          })}
                          className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                          Add Language
                        </button>
                      </div>

                      {(formData.languages || []).map((language, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className="p-6 bg-gray-50 dark:bg-slate-700/30 rounded-xl space-y-4"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              Language #{index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveArrayItem('languages', index)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Language
                              </label>
                              <input
                                type="text"
                                value={language.name || ''}
                                onChange={(e) => handleArrayInputChange('languages', index, { name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Proficiency Level
                              </label>
                              <select
                                value={language.proficiency || 'beginner'}
                                onChange={(e) => handleArrayInputChange('languages', index, { proficiency: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="native">Native</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Language Certifications
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {language.certifications?.map((cert, certIndex) => (
                                <div
                                  key={certIndex}
                                  className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg"
                                >
                                  <span>{cert}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newCerts = language.certifications?.filter((_, i) => i !== certIndex);
                                      handleArrayInputChange('languages', index, { certifications: newCerts });
                                    }}
                                    className="ml-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <input
                                type="text"
                                placeholder="Add certification"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const newCert = input.value.trim();
                                    if (newCert) {
                                      const newCerts = [...(language.certifications || []), newCert];
                                      handleArrayInputChange('languages', index, { certifications: newCerts });
                                      input.value = '';
                                    }
                                  }
                                }}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Career Preferences Section */}
                {activeSection === 'preferences' && (
                  <motion.div variants={itemVariants} className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Career Preferences
                    </h2>

                    {/* Career Goals */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Career Goals
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Short-term Goals
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(formData.careerGoals?.shortTerm || []).map((goal, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg"
                            >
                              <span>{goal}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newGoals = formData.careerGoals?.shortTerm?.filter((_, i) => i !== index);
                                  handleInputChange('careerGoals', {
                                    ...formData.careerGoals,
                                    shortTerm: newGoals
                                  });
                                }}
                                className="ml-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <input
                            type="text"
                            placeholder="Add short-term goal"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                const newGoal = input.value.trim();
                                if (newGoal) {
                                  const newGoals = [...(formData.careerGoals?.shortTerm || []), newGoal];
                                  handleInputChange('careerGoals', {
                                    ...formData.careerGoals,
                                    shortTerm: newGoals
                                  });
                                  input.value = '';
                                }
                              }
                            }}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Long-term Goals
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(formData.careerGoals?.longTerm || []).map((goal, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg"
                            >
                              <span>{goal}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newGoals = formData.careerGoals?.longTerm?.filter((_, i) => i !== index);
                                  handleInputChange('careerGoals', {
                                    ...formData.careerGoals,
                                    longTerm: newGoals
                                  });
                                }}
                                className="ml-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <input
                            type="text"
                            placeholder="Add long-term goal"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                const newGoal = input.value.trim();
                                if (newGoal) {
                                  const newGoals = [...(formData.careerGoals?.longTerm || []), newGoal];
                                  handleInputChange('careerGoals', {
                                    ...formData.careerGoals,
                                    longTerm: newGoals
                                  });
                                  input.value = '';
                                }
                              }
                            }}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Preferred Industries
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(formData.careerGoals?.preferredIndustries || []).map((industry, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg"
                            >
                              <span>{industry}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newIndustries = formData.careerGoals?.preferredIndustries?.filter((_, i) => i !== index);
                                  handleInputChange('careerGoals', {
                                    ...formData.careerGoals,
                                    preferredIndustries: newIndustries
                                  });
                                }}
                                className="ml-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <input
                            type="text"
                            placeholder="Add industry"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                const newIndustry = input.value.trim();
                                if (newIndustry) {
                                  const newIndustries = [...(formData.careerGoals?.preferredIndustries || []), newIndustry];
                                  handleInputChange('careerGoals', {
                                    ...formData.careerGoals,
                                    preferredIndustries: newIndustries
                                  });
                                  input.value = '';
                                }
                              }
                            }}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Preferred Locations
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(formData.careerGoals?.preferredLocations || []).map((location, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg"
                            >
                              <span>{location}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newLocations = formData.careerGoals?.preferredLocations?.filter((_, i) => i !== index);
                                  handleInputChange('careerGoals', {
                                    ...formData.careerGoals,
                                    preferredLocations: newLocations
                                  });
                                }}
                                className="ml-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <input
                            type="text"
                            placeholder="Add location"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                const newLocation = input.value.trim();
                                if (newLocation) {
                                  const newLocations = [...(formData.careerGoals?.preferredLocations || []), newLocation];
                                  handleInputChange('careerGoals', {
                                    ...formData.careerGoals,
                                    preferredLocations: newLocations
                                  });
                                  input.value = '';
                                }
                              }
                            }}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Work Preferences */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Work Preferences
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Employment Types
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['internship', 'part-time', 'full-time'].map((type) => (
                            <label key={type} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={(formData.workPreferences?.employmentTypes || []).includes(type as any)}
                                onChange={(e) => {
                                  const types = formData.workPreferences?.employmentTypes || [];
                                  const newTypes = e.target.checked
                                    ? [...types, type]
                                    : types.filter(t => t !== type);
                                  handleInputChange('workPreferences', {
                                    ...formData.workPreferences,
                                    employmentTypes: newTypes
                                  });
                                }}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                                {type.replace('-', ' ')}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Remote Work Preference
                        </label>
                        <select
                          value={formData.workPreferences?.remotePreference || ''}
                          onChange={(e) => handleInputChange('workPreferences', {
                            ...formData.workPreferences,
                            remotePreference: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select preference</option>
                          <option value="onsite">On-site</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="remote">Remote</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Available From
                        </label>
                        <input
                          type="date"
                          value={formData.workPreferences?.availableFrom || ''}
                          onChange={(e) => handleInputChange('workPreferences', {
                            ...formData.workPreferences,
                            availableFrom: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Minimum Salary
                          </label>
                          <input
                            type="number"
                            value={formData.workPreferences?.salaryExpectation?.minimum || ''}
                            onChange={(e) => handleInputChange('workPreferences', {
                              ...formData.workPreferences,
                              salaryExpectation: {
                                ...formData.workPreferences?.salaryExpectation,
                                minimum: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preferred Salary
                          </label>
                          <input
                            type="number"
                            value={formData.workPreferences?.salaryExpectation?.preferred || ''}
                            onChange={(e) => handleInputChange('workPreferences', {
                              ...formData.workPreferences,
                              salaryExpectation: {
                                ...formData.workPreferences?.salaryExpectation,
                                preferred: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Currency
                          </label>
                          <select
                            value={formData.workPreferences?.salaryExpectation?.currency || ''}
                            onChange={(e) => handleInputChange('workPreferences', {
                              ...formData.workPreferences,
                              salaryExpectation: {
                                ...formData.workPreferences?.salaryExpectation,
                                currency: e.target.value
                              }
                            })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Select currency</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="KZT">KZT</option>
                            <option value="RUB">RUB</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit; 