# Firestore Security Rules (Kidspace 5.0)

Этот файл содержит конфигурацию `firestore.rules`.

## Helpers (Функции-помощники)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- BASE HELPERS ---

    // Пользователь авторизован
    function isAuthenticated() {
      return request.auth != null;
    }

    // Пользователь обращается к своим данным
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // --- ROLE BASED ACCESS CONTROL (RBAC) ---
    // Внимание: Чтение документа пользователя стоит денег. 
    // Для оптимизации в продакшене лучше использовать Custom Claims в Auth Token.
    // Здесь используем чтение из БД для MVP.

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }

    function isDoctor() {
      return isAuthenticated() && getUserData().role == 'doctor';
    }

    function isInstitutionOwner(instId) {
      // Проверка, является ли юзер владельцем конкретного заведения
      return isAuthenticated() && 
             get(/databases/$(database)/documents/institutions/$(instId)).data.owner_id == request.auth.uid;
    }

    // --- ATTRIBUTE BASED ACCESS CONTROL (ABAC) ---

    // Проверка неизменяемых полей (например, нельзя менять баланс)
    function notUpdating(fields) {
      return !(fields.any(field => field in request.resource.data) && 
               request.resource.data[field] != resource.data[field]);
    }

    // ---------------------------------------------------------
    // КОЛЛЕКЦИИ
    // ---------------------------------------------------------

    // 1. USERS
    // Чтение: Владелец или Админ. Публичный профиль (имя/аватар) ограниченно доступен (для чатов), 
    // но здесь для строгости закрываем.
    // Запись: Владелец (кроме баланса и роли), Админ (все).
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId); // При регистрации
      allow update: if (isOwner(userId) && notUpdating(['wallet_balance', 'role', 'kidspace_pass_id'])) 
                    || isAdmin();
      // Удаление запрещено юзерам (Soft delete через статус)
    }

    // 2. CHILDREN
    // Доступ только родителю.
    match /children/{childId} {
      allow read: if isAuthenticated() && (resource.data.parent_id == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() && request.resource.data.parent_id == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.parent_id == request.auth.uid;
    }

    // 3. KIDSPACE PASSES (Абонементы)
    // Строгий контроль. Юзер только читает. Создает и обновляет ТОЛЬКО Сервер (Cloud Functions).
    match /kidspace_passes/{passId} {
      allow read: if isAuthenticated() && (resource.data.user_id == request.auth.uid || isAdmin());
      allow write: if false; // Только сервер (Admin SDK обходит правила)
    }

    // 4. VISITS (Списания)
    // Юзер только читает историю. Пишет сервер при сканировании QR.
    match /visits/{visitId} {
      allow read: if isAuthenticated() && (resource.data.user_id == request.auth.uid || isAdmin());
      allow write: if false; // Только сервер
    }

    // 5. INSTITUTIONS (Заведения)
    // Чтение: Публично.
    // Запись: Админ или Владелец заведения (своего).
    match /institutions/{institutionId} {
      allow read: if true;
      allow create: if isAdmin();
      allow update: if isAdmin() || (isAuthenticated() && resource.data.owner_id == request.auth.uid);
    }

    // 6. REVIEWS (Отзывы)
    // Чтение: Публично.
    // Создание: Любой авторизованный.
    // Обновление: Только свои (и пока не опубликованы, опционально).
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.user_id == request.auth.uid;
      allow update: if isOwner(resource.data.user_id) || isAdmin();
      allow delete: if isAdmin();
    }

    // 7. BOOKINGS (Брони)
    // Читает: Создатель или Владелец заведения.
    // Пишет: Создатель (create). Статус меняет Владелец заведения.
    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && (
        resource.data.user_id == request.auth.uid || 
        isInstitutionOwner(resource.data.institution_id) ||
        isAdmin()
      );
      allow create: if isAuthenticated() && request.resource.data.user_id == request.auth.uid;
      allow update: if isAuthenticated() && (
        isInstitutionOwner(resource.data.institution_id) || // Партнер подтверждает/отменяет
        resource.data.user_id == request.auth.uid // Юзер отменяет
      );
    }

    // 8. MARKETPLACE & ORDERS
    match /marketplace_products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /orders/{orderId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow create: if isOwner(request.resource.data.user_id);
      allow update: if isAdmin(); // Статусы меняет админ/склад
    }

    // 9. HEALTHCARE SUBSCRIPTIONS (Health Pass)
    match /healthcare_subscriptions/{subId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow write: if false; // Только сервер
    }

    // 10. DOCTORS
    // Чтение: Публично (каталог).
    // Запись: Админ. Врач может менять статус 'is_online'.
    match /doctors/{doctorId} {
      allow read: if true;
      allow update: if isAdmin() || (isAuthenticated() && request.auth.uid == doctorId && notUpdating(['rating', 'specialty']));
      allow create, delete: if isAdmin();
    }

    // 11. CONSULTATIONS (MEDICAL DATA - HIGH PRIVACY)
    // Доступ только Пациенту, Врачу или Админу.
    match /consultations/{consultationId} {
      allow read: if isAuthenticated() && (
        resource.data.user_id == request.auth.uid || 
        resource.data.doctor_id == request.auth.uid || 
        isAdmin()
      );
      allow create: if isAuthenticated() && request.resource.data.user_id == request.auth.uid;
      allow update: if isAuthenticated() && (
        resource.data.doctor_id == request.auth.uid || // Врач пишет заключение
        resource.data.user_id == request.auth.uid // Пациент отменяет
      );
    }

    // 12. CHATS (SECURITY & PRIVACY)
    // Доступ только если UID есть в массиве участников.
    match /chat_sessions/{chatId} {
      allow read: if isAuthenticated() && (request.auth.uid in resource.data.participants);
      allow create: if isAuthenticated() && (request.auth.uid in request.resource.data.participants);
      allow update: if isAuthenticated() && (request.auth.uid in resource.data.participants);

      // Subcollection Messages
      match /messages/{messageId} {
        allow read: if isAuthenticated() && (request.auth.uid in get(/databases/$(database)/documents/chat_sessions/$(chatId)).data.participants);
        allow create: if isAuthenticated() && 
                      (request.auth.uid in get(/databases/$(database)/documents/chat_sessions/$(chatId)).data.participants) &&
                      request.resource.data.sender_id == request.auth.uid;
      }
    }

    // 13. NOTIFICATIONS
    match /notifications/{notifId} {
      allow read: if isOwner(resource.data.user_id);
      allow write: if false; // Только сервер
    }

    // 14. PAYMENTS & LOGS
    match /payments/{paymentId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow write: if false; // Строго сервер
    }

    match /admin_logs/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Сервер
    }
  }
}
```
