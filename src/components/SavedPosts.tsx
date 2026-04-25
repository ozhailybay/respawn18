import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import FilterPanel, { Filters } from './FilterPanel';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Post } from '../types';
import { motion } from 'framer-motion';

const SavedPosts: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    city: '',
    category: '',
    format: '',
    search: '',
    experience: '',
    salary: ''
  });

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const savedPostsQuery = query(
          collection(db, 'savedPosts'),
          where('userId', '==', user.uid)
        );
        
        const savedPostsSnapshot = await getDocs(savedPostsQuery);
        const savedPostIds = savedPostsSnapshot.docs.map(doc => doc.data().postId);
        
        if (savedPostIds.length === 0) {
          setSavedPosts([]);
          setLoading(false);
          return;
        }
        
        const postsPromises = savedPostIds.map(async (postId) => {
          const postDoc = await getDoc(doc(db, 'posts', postId));
          if (postDoc.exists()) {
            return { id: postDoc.id, ...postDoc.data() } as Post;
          }
          return null;
        });
        
        const posts = (await Promise.all(postsPromises)).filter(Boolean) as Post[];
        
        const sortedPosts = posts.sort((a, b) => {
          const savedPostA = savedPostsSnapshot.docs.find(doc => doc.data().postId === a.id);
          const savedPostB = savedPostsSnapshot.docs.find(doc => doc.data().postId === b.id);
          
          if (!savedPostA || !savedPostB) return 0;
          
          return savedPostB.data().savedAt.toMillis() - savedPostA.data().savedAt.toMillis();
        });
        
        setSavedPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching saved posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedPosts();
  }, [user]);

  useEffect(() => {
    if (!filters.search) {
      setFilteredPosts(savedPosts);
      return;
    }
    
    const searchTerm = filters.search.toLowerCase();
    const filtered = savedPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) || 
      post.description.toLowerCase().includes(searchTerm)
    );
    
    setFilteredPosts(filtered);
  }, [savedPosts, filters.search]);

  useEffect(() => {
    let filtered = [...savedPosts];
    
    if (filters.city) {
      filtered = filtered.filter(post => post.city === filters.city);
    }
    
    if (filters.category) {
      filtered = filtered.filter(post => post.category === filters.category);
    }
    
    if (filters.format) {
      filtered = filtered.filter(post => post.format === filters.format);
    }
    
    setFilteredPosts(filtered);
  }, [savedPosts, filters.city, filters.category, filters.format]);

  const handleRemoveSaved = async (postId: string) => {
    if (!user) return;
    
    try {
      const savedPostRef = doc(db, 'savedPosts', `${user.uid}_${postId}`);
      await deleteDoc(savedPostRef);
      
      setSavedPosts(savedPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error removing saved post:', error);
    }
  };

  const handleApply = async (post: Post) => {
    if (!user) return;
    
    try {
      // Fetch user data including resume
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return;
      
      const userData = userDoc.data();
      
      // Create initial message with resume data
      const resumeMessage = `
🎓 Application from ${userData.displayName}

${userData.resumeData?.education ? `📚 Education:
${userData.resumeData.education}` : ''}

${userData.resumeData?.skills ? `💪 Skills:
${userData.resumeData.skills}` : ''}

${userData.resumeData?.experience ? `💼 Experience:
${userData.resumeData.experience}` : ''}

${userData.resumeData?.achievements ? `🏆 Achievements:
${userData.resumeData.achievements}` : ''}

${userData.resumeData?.languages?.length ? `🌐 Languages:
${userData.resumeData.languages.join(', ')}` : ''}

${userData.resumeData?.portfolio ? `🔗 Portfolio:
${userData.resumeData.portfolio}` : ''}
      `;

      // Create chat with initial message and status
      const chatRef = await addDoc(collection(db, 'chats'), {
        participants: [user.uid, post.authorId],
        createdAt: new Date(),
        lastMessage: resumeMessage,
        postTitle: post.title,
        status: 'pending',
        unreadCount: {
          [String(post.authorId)]: 1
        },
        // Add notification for business owner
        notifications: {
          [String(post.authorId)]: {
            type: 'new_application',
            read: false,
            timestamp: new Date()
          }
        }
      });

      // Add the initial message to the chat
      await addDoc(collection(db, `chats/${chatRef.id}/messages`), {
        text: resumeMessage,
        senderId: user.uid,
        timestamp: new Date(),
        type: 'application'
      });

      // Create a notification for the business owner
      await addDoc(collection(db, 'notifications'), {
        userId: post.authorId,
        type: 'new_application',
        chatId: chatRef.id,
        postId: post.id,
        postTitle: post.title,
        applicantName: userData.displayName,
        read: false,
        timestamp: new Date()
      });

      // Show success message
      alert('Your application has been sent successfully!');
      
      // Navigate to the chat
      window.location.href = `/chat/${chatRef.id}`;
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('There was an error sending your application. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-orange-400 mb-4">Сохраненные вакансии</h2>
          <p className="text-gray-300 mb-6">Для просмотра сохраненных вакансий необходимо войти в систему.</p>
          <Link to="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition duration-300 font-medium">
            Войти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-4 py-12 transition-colors duration-300">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-40 right-[10%] w-64 h-64 bg-black/3 dark:bg-white/3 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-[5%] w-64 h-64 bg-black/3 dark:bg-white/3 rounded-full blur-3xl"
        />
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-3xl font-bold text-center text-black dark:text-white mb-8">{t('navigation.saved')}</h2>
        
        <FilterPanel 
          filters={filters} 
          setFilters={setFilters} 
          resultCount={filteredPosts.length} 
        />
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">{t('posts.noPosts')}</p>
            <Link to="/posts" className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition duration-300">
              {t('posts.browsePosts')}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-[#1a1a1a] rounded-2xl shadow-xl p-6 border border-gray-800">
                <div className="flex justify-between items-start">
                  <h4 className="text-xl font-bold text-orange-400 mb-3">{post.title}</h4>
                  <button
                    onClick={() => handleRemoveSaved(post.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title={t('posts.removeSaved')}
                  >
                    ❌
                  </button>
                </div>
                <p className="text-gray-300 mb-4">{post.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.city && (
                    <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                      📍 {post.city}
                    </span>
                  )}
                  {post.category && (
                    <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                      🧠 {post.category}
                    </span>
                  )}
                  {post.format && (
                    <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                      🌐 {post.format}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  {user && user.uid !== post.authorId && (
                    <button 
                      onClick={() => handleApply(post)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
                    >
                      {t('posts.apply')}
                    </button>
                  )}
                  <Link 
                    to={`/post/${post.id}`} 
                    className="text-blue-400 hover:text-blue-300 transition duration-300"
                  >
                    {t('posts.viewDetails')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPosts; 