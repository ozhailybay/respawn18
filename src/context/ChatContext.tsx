import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs, orderBy, limit, doc, getDoc, Timestamp, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';

interface ChatPreview {
  id: string;
  lastMessage: string;
  updatedAt: any;
  participants: string[];
  unreadCount: Record<string, number>;
  otherUserData?: Array<{
    uid: string;
    displayName: string;
    photoURL: string;
    status?: string;
    role?: string;
  }>;
  jobId?: string;
  jobTitle?: string;
  employerId?: string;
  applicantId?: string;
  chatType?: 'job_application' | 'general' | 'support';
}

interface ChatContextType {
  chats: ChatPreview[];
  loading: boolean;
  error: string | null;
  totalUnreadCount: number;
  refreshChats: () => void;
  createJobApplicationChat: (jobId: string, employerId: string, message: string) => Promise<string>;
  markChatAsRead: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, message: string, type?: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({
  chats: [],
  loading: true,
  error: null,
  totalUnreadCount: 0,
  refreshChats: () => {},
  createJobApplicationChat: async () => '',
  markChatAsRead: async () => {},
  sendMessage: async () => {}
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Enhanced retry mechanism
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const retryWithBackoff = async (fn: () => Promise<any>, maxRetries: number = 3) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        if (attempt === maxRetries) throw error;
        
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
        await sleep(delay);
      }
    }
  };

  const fetchChats = async () => {
    if (!user || !user.uid) {
      console.log('Skipping fetchChats - no authenticated user');
      setChats([]);
      setLoading(false);
      setTotalUnreadCount(0);
      setError(null);
      return;
    }

    console.log('Starting fetchChats for user:', user.uid);
    
    try {
      setLoading(true);
      setError(null);
      
      await retryWithBackoff(async () => {
        const chatsRef = collection(db, 'chats');
      
        // Test collection access first
        const testQuery = query(chatsRef, limit(1));
        await getDocs(testQuery);
        
        // Main query - try with orderBy to see if index is ready
        const q = query(
          chatsRef,
          where('participants', 'array-contains', user.uid),
          orderBy('lastMessageAt', 'desc'),
          limit(50)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          try {
            if (snapshot.empty) {
              setChats([]);
              setTotalUnreadCount(0);
              setLoading(false);
              return;
            }

            const chatPromises = snapshot.docs.map(async (chatDoc) => {
              try {
                const chatData = chatDoc.data();
                
                if (!chatData.participants || !Array.isArray(chatData.participants)) {
                  console.warn('Chat document missing participants array:', chatDoc.id);
                  return null;
                }
                
                const otherParticipants = chatData.participants.filter(
                  (participantId: string) => participantId !== user.uid
                );
                
                const otherUserData = await Promise.all(
                  otherParticipants.map(async (participantId: string) => {
                    try {
                      const userDocRef = doc(db, 'users', participantId);
                      const userDocSnap = await getDoc(userDocRef);
                      
                      if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        return {
                          uid: participantId,
                          displayName: userData.displayName || userData.firstName + ' ' + userData.lastName || 'Пользователь',
                          photoURL: userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.displayName || 'User')}&size=40&background=random`,
                          status: userData.status || 'offline',
                          role: userData.role || 'user'
                        };
                      }
                      return {
                        uid: participantId,
                        displayName: 'Пользователь',
                        photoURL: 'https://via.placeholder.com/40',
                        status: 'offline',
                        role: 'user'
                      };
                    } catch (error) {
                      console.error(`Error fetching user data for ${participantId}:`, error);
                      return {
                        uid: participantId,
                        displayName: 'Пользователь',
                        photoURL: 'https://via.placeholder.com/40',
                        status: 'offline',
                        role: 'user'
                      };
                    }
                  })
                );
                
                const chat: ChatPreview = {
                  id: chatDoc.id,
                  lastMessage: chatData.lastMessage || 'Нет сообщений',
                  updatedAt: chatData.lastMessageAt || chatData.updatedAt || Timestamp.now(),
                  participants: chatData.participants,
                  unreadCount: chatData.unreadCount || {},
                  otherUserData,
                  jobId: chatData.jobId,
                  jobTitle: chatData.jobTitle,
                  employerId: chatData.employerId,
                  applicantId: chatData.applicantId,
                  chatType: chatData.chatType || 'general'
                };
                
                return chat;
              } catch (err) {
                console.error('Error processing chat document:', err, 'Doc ID:', chatDoc.id);
                return null;
              }
            });
            
            const chatsList = (await Promise.all(chatPromises)).filter(Boolean) as ChatPreview[];
            
            // Sort by last message time
                  chatsList.sort((a, b) => {
              const aTime = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt);
              const bTime = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
              return bTime.getTime() - aTime.getTime();
            });
            
            // Calculate total unread count
            const totalUnread = chatsList.reduce((total, chat) => {
              return total + (chat.unreadCount[user.uid] || 0);
            }, 0);
                  
                  setChats(chatsList);
            setTotalUnreadCount(totalUnread);
                  setLoading(false);
            setRetryCount(0);
          } catch (err) {
            console.error('Error processing chats snapshot:', err);
            setError('Ошибка при обработке чатов');
            setLoading(false);
          }
        }, (error) => {
          console.error('Chats snapshot error:', error);
          setError('Ошибка при получении чатов');
          setLoading(false);
        });
        
        return unsubscribe;
      });
      
    } catch (err: any) {
      console.error('Error in fetchChats:', err);
      
      if (err?.code === 'permission-denied') {
        setError('Доступ к чатам доступен только авторизованным пользователям');
      } else if (err?.code === 'unavailable') {
        setError('Сервис чатов временно недоступен');
      } else {
        setError('Не удалось загрузить чаты');
      }
      
      setLoading(false);
      setRetryCount(prev => prev + 1);
    }
  };

  // Create job application chat
  const createJobApplicationChat = async (jobId: string, employerId: string, message: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Get user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Get employer data
      const employerDoc = await getDoc(doc(db, 'users', employerId));
      const employerData = employerDoc.exists() ? employerDoc.data() : {};
      
      // Get job data
      const jobDoc = await getDoc(doc(db, 'posts', jobId));
      const jobData = jobDoc.exists() ? jobDoc.data() : {};
      
      // Create chat
      const chatRef = await addDoc(collection(db, 'chats'), {
        participants: [user.uid, employerId],
        jobId,
        jobTitle: jobData.title || 'Вакансия',
        employerId,
        employerName: employerData.displayName || employerData.companyName || 'Работодатель',
        applicantId: user.uid,
        applicantName: userData.displayName || userData.firstName + ' ' + userData.lastName || 'Соискатель',
        chatType: 'job_application',
        createdAt: serverTimestamp(),
        lastMessage: message,
        lastMessageAt: serverTimestamp(),
        unreadCount: {
          [employerId]: 1,
          [user.uid]: 0
        },
        status: 'active'
      });
      
      // Add first message
      await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
        text: message,
        senderId: user.uid,
        senderName: userData.displayName || userData.firstName + ' ' + userData.lastName || 'Соискатель',
        createdAt: serverTimestamp(),
        type: 'job_application',
        status: 'sent'
      });
      
      // Create application record
      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        userName: userData.displayName || userData.firstName + ' ' + userData.lastName || 'Соискатель',
        jobId,
        jobTitle: jobData.title || 'Вакансия',
        employerId,
        status: 'pending',
        appliedAt: serverTimestamp(),
        chatRoomId: chatRef.id,
        message
      });
      
      return chatRef.id;
    } catch (error) {
      console.error('Error creating job application chat:', error);
      throw new Error('Не удалось создать чат для заявки');
    }
  };

  // Mark chat as read
  const markChatAsRead = async (chatId: string): Promise<void> => {
    if (!user) return;
    
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`unreadCount.${user.uid}`]: 0,
        [`lastReadAt.${user.uid}`]: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  // Send message
  const sendMessage = async (chatId: string, message: string, type: string = 'text'): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Add message
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: message,
        senderId: user.uid,
        senderName: userData.displayName || userData.firstName + ' ' + userData.lastName || 'Пользователь',
        createdAt: serverTimestamp(),
        type,
        status: 'sent'
      });
      
      // Update chat
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const otherParticipants = chatData.participants.filter((p: string) => p !== user.uid);
        
        const newUnreadCount = { ...chatData.unreadCount };
        otherParticipants.forEach((participantId: string) => {
          newUnreadCount[participantId] = (newUnreadCount[participantId] || 0) + 1;
        });
        
        await updateDoc(chatRef, {
          lastMessage: message,
          lastMessageAt: serverTimestamp(),
          unreadCount: newUnreadCount
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Не удалось отправить сообщение');
    }
  };

  const refreshChats = () => {
    fetchChats();
  };

  useEffect(() => {
    fetchChats();
  }, [user]);

  // Auto-retry on error
  useEffect(() => {
    if (error && retryCount < 3) {
      const timeout = setTimeout(() => {
        console.log(`Auto-retrying fetchChats (attempt ${retryCount + 1})`);
        fetchChats();
      }, 5000 * (retryCount + 1));
      
      return () => clearTimeout(timeout);
    }
  }, [error, retryCount]);

  return (
    <ChatContext.Provider 
      value={{ 
        chats, 
        loading, 
        error, 
        totalUnreadCount,
        refreshChats,
        createJobApplicationChat,
        markChatAsRead,
        sendMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};