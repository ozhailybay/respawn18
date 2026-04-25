# 🚀 Быстрое исправление "User profile not found"

## Проблема
```
User document does not exist in Firestore
GET /api/users/undefined 400 (Bad Request)
```

## ✅ Решение (5 минут)

### 1. Исправлены импорты AuthContext
- Удален дублирующийся файл `src/contexts/AuthContext.tsx`
- Все компоненты теперь используют `src/context/AuthContext.tsx`
- Исправлены импорты в 5 файлах

### 2. Обновлен AuthContext
Файл уже обновлен с автоматическим созданием документов пользователей.

### 3. Исправлены правила Firestore
**ВАЖНО:** Примените временные правила для разработки:

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `respawn-76195`
3. Перейдите в Firestore Database → Rules
4. Скопируйте содержимое `firestore.rules.development`
5. Вставьте и нажмите "Publish"

### 4. Разверните Cloud Functions
```bash
cd functions
npm run build
firebase deploy --only functions
```

### 5. Проверьте логи в консоли
После входа пользователя должны появиться:
- `🔍 Fetching user data for [uid]`
- `✅ User document found for [uid]` или `⚠️ User document does not exist for [uid], creating...`

### 6. Для существующих пользователей
Если у вас есть старые аккаунты без документов:

1. Войдите как администратор
2. Перейдите на `/admin/migration`
3. Нажмите "Запустить миграцию"

## 🎯 Результат
- ✅ Нет ошибок "User profile not found"
- ✅ Профили создаются автоматически
- ✅ Красивые страницы ошибок
- ✅ Правильная защита маршрутов

## 🔧 Если проблема остается

1. **Проверьте Firebase Rules:**
```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

2. **Проверьте консоль браузера** на ошибки сети

3. **Проверьте логи Firebase Functions** в консоли Firebase

## 📞 Поддержка
Если проблема не решается, проверьте:
- Правильность конфигурации Firebase
- Права доступа к Firestore
- Сетевые ошибки в DevTools → Network 