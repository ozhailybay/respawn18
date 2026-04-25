import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Автоматическое создание документа пользователя при регистрации
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    console.log(`🆕 Creating user document for ${user.uid}`);
    
    const userRef = admin.firestore().doc(`users/${user.uid}`);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      role: 'student',
      isBlocked: false,
      profileCompleted: false,
      // Базовые поля профиля
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      phoneNumber: '',
      location: '',
      bio: '',
      position: '',
      education: [],
      skills: [],
      experience: [],
      // Метаданные
      emailVerified: user.emailVerified,
      providerData: user.providerData.map(provider => ({
        providerId: provider.providerId,
        uid: provider.uid,
        displayName: provider.displayName,
        email: provider.email,
        photoURL: provider.photoURL
      }))
    };
    
    await userRef.set(userData);
    console.log(`✅ Successfully created user document for ${user.uid}`);
    
    return { success: true, uid: user.uid };
  } catch (error) {
    console.error(`❌ Error creating user document for ${user.uid}:`, error);
    throw new functions.https.HttpsError('internal', 'Failed to create user document');
  }
});

// Обновление времени последнего входа (используем onCreate вместо onSignIn)
export const onUserSignIn = functions.auth.user().onCreate(async (user) => {
  try {
    console.log(`👤 User sign in: ${user.uid}`);
    
    const userRef = admin.firestore().doc(`users/${user.uid}`);
    
    await userRef.update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Updated last login for ${user.uid}`);
    return { success: true, uid: user.uid };
  } catch (error) {
    console.error(`❌ Error updating last login for ${user.uid}:`, error);
    // Не бросаем ошибку, так как это не критично
    return { success: false, error: (error as Error).message };
  }
});

// Удаление документа пользователя при удалении аккаунта
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  try {
    console.log(`🗑️ Deleting user document for ${user.uid}`);
    
    const userRef = admin.firestore().doc(`users/${user.uid}`);
    await userRef.delete();
    
    console.log(`✅ Successfully deleted user document for ${user.uid}`);
    return { success: true, uid: user.uid };
  } catch (error) {
    console.error(`❌ Error deleting user document for ${user.uid}:`, error);
    throw new functions.https.HttpsError('internal', 'Failed to delete user document');
  }
});

// HTTP функция для миграции существующих пользователей
export const migrateExistingUsers = functions.https.onCall(async (data, context) => {
  // Проверяем, что пользователь авторизован и является админом
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    console.log('🔄 Starting migration of existing users...');
    
    const auth = admin.auth();
    const db = admin.firestore();
    
    // Получаем всех пользователей Firebase Auth
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;
    
    console.log(`📊 Found ${users.length} users in Firebase Auth`);
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        const userRef = db.doc(`users/${user.uid}`);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
          console.log(`⏭️ User document already exists for ${user.uid}`);
          skipped++;
          continue;
        }
        
        // Создаем документ пользователя
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          role: 'student',
          isBlocked: false,
          profileCompleted: false,
          // Базовые поля профиля
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          phoneNumber: '',
          location: '',
          bio: '',
          position: '',
          education: [],
          skills: [],
          experience: [],
          // Метаданные
          emailVerified: user.emailVerified,
          providerData: user.providerData.map(provider => ({
            providerId: provider.providerId,
            uid: provider.uid,
            displayName: provider.displayName,
            email: provider.email,
            photoURL: provider.photoURL
          }))
        };
        
        await userRef.set(userData);
        console.log(`✅ Created user document for ${user.uid}`);
        created++;
        
      } catch (error) {
        console.error(`❌ Error creating document for ${user.uid}:`, error);
        errors++;
      }
    }
    
    console.log(`🎉 Migration completed: ${created} created, ${skipped} skipped, ${errors} errors`);
    
    return {
      success: true,
      total: users.length,
      created,
      skipped,
      errors
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw new functions.https.HttpsError('internal', 'Migration failed');
  }
}); 