const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Конфигурация Firebase (замените на вашу)
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "respawn-76195.firebaseapp.com",
  projectId: "respawn-76195",
  storageBucket: "respawn-76195.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

async function checkFirebaseConnection() {
  try {
    console.log('🔍 Проверка подключения к Firebase...');
    
    // Инициализация Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase инициализирован');
    
    // Проверка аутентификации
    console.log('🔐 Проверка аутентификации...');
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Анонимная аутентификация успешна');
    console.log('👤 UID:', userCredential.user.uid);
    
    // Проверка Firestore
    console.log('📄 Проверка Firestore...');
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    console.log('✅ Firestore доступен для чтения');
    
    // Проверка создания документа
    console.log('✍️ Проверка записи в Firestore...');
    const { setDoc } = require('firebase/firestore');
    await setDoc(testDoc, { 
      test: true, 
      timestamp: new Date().toISOString() 
    });
    console.log('✅ Firestore доступен для записи');
    
    // Очистка тестового документа
    const { deleteDoc } = require('firebase/firestore');
    await deleteDoc(testDoc);
    console.log('✅ Тестовый документ удален');
    
    console.log('\n🎉 Все проверки пройдены успешно!');
    console.log('Firebase настроен корректно.');
    
  } catch (error) {
    console.error('❌ Ошибка при проверке Firebase:', error);
    console.log('\n🔧 Возможные решения:');
    console.log('1. Проверьте конфигурацию Firebase в firebase.ts');
    console.log('2. Убедитесь, что правила Firestore разрешают доступ');
    console.log('3. Проверьте права доступа к проекту');
    console.log('4. Убедитесь, что проект активен в Firebase Console');
  }
}

checkFirebaseConnection(); 