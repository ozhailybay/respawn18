# 🔥 Настройка правил Firestore для исправления ошибок доступа

## 🚨 Проблема
Ошибки "Missing or insufficient permissions" возникают из-за слишком строгих правил безопасности Firestore.

## ✅ Решение

### Шаг 1: Примените временные правила для разработки

1. **Откройте Firebase Console:**
   - Перейдите на https://console.firebase.google.com/
   - Выберите проект `respawn-76195`

2. **Перейдите в Firestore:**
   - В левом меню выберите "Firestore Database"
   - Перейдите на вкладку "Rules"

3. **Замените правила на временные:**
   Скопируйте содержимое файла `firestore.rules.development` и вставьте в редактор правил.

4. **Опубликуйте правила:**
   Нажмите "Publish"

### Шаг 2: Проверьте работу приложения

После применения правил:
- Обновите страницу приложения
- Войдите в систему
- Проверьте консоль - ошибки доступа должны исчезнуть

### Шаг 3: Восстановите безопасные правила (для продакшена)

Когда приложение будет работать, замените правила на безопасные из файла `firestore.rules`.

## 📋 Временные правила (firestore.rules.development)

```javascript
rules_version = "2";
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ВРЕМЕННЫЕ ПРАВИЛА ДЛЯ РАЗРАБОТКИ
    // ВНИМАНИЕ: Эти правила разрешают полный доступ - используйте только для разработки!
    
    // Разрешаем все операции для авторизованных пользователей
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Разрешаем публичное чтение для некоторых коллекций
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /jobs/{jobId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /microInternships/{internshipId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🔍 Отладка

### Проверка правил в консоли Firebase
1. В Firebase Console перейдите в Firestore → Rules
2. Используйте "Rules Playground" для тестирования правил
3. Проверьте, что авторизованные пользователи могут читать/писать данные

### Проверка аутентификации
Убедитесь, что пользователь правильно авторизован:
```javascript
// В консоли браузера
firebase.auth().currentUser
```

## ⚠️ Важные замечания

1. **Временные правила небезопасны** - используйте только для разработки
2. **Для продакшена** обязательно восстановите безопасные правила
3. **Проверьте права доступа** к проекту Firebase
4. **Убедитесь, что проект правильно настроен** в `firebase.json`

## 🎯 Ожидаемый результат

После применения временных правил:
- ✅ Нет ошибок "Missing or insufficient permissions"
- ✅ Пользователи могут создавать профили
- ✅ Данные загружаются корректно
- ✅ Приложение работает без ошибок доступа 