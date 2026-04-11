# Cloud Functions & Backend Logic - Kidspace 5.0

Этот документ описывает серверную логику (Firebase Cloud Functions), необходимую для обеспечения безопасности, целостности данных и автоматизации бизнес-процессов.

---

## 1. Покупка Kidspace Pass (`purchasePass`)

**Trigger:** HTTP Request (вызывается клиентом после нажатия "Купить") или Internal Call после успешной оплаты.

**Описание:** Создает подписку, списывает средства с кошелька, активирует доступ.

**Pseudocode:**
```javascript
exports.purchasePass = onCall(async (data, context) => {
  const { planId, userId } = data;
  const db = admin.firestore();

  return db.runTransaction(async (t) => {
    // 1. Получаем данные пользователя и плана
    const userRef = db.collection('users').doc(userId);
    const userDoc = await t.get(userRef);
    const planConfig = PASS_PACKAGES[planId]; // Из конфига или БД

    // 2. Проверка баланса
    if (userDoc.data().wallet_balance < planConfig.price) {
      throw new HttpsError('failed-precondition', 'Insufficient funds');
    }

    // 3. Расчет дат
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + 30); // +30 дней

    // 4. Создание документа подписки
    const newPassRef = db.collection('kidspace_passes').doc();
    t.set(newPassRef, {
      user_id: userId,
      plan_id: planId,
      status: 'active',
      start_date: startDate,
      expiry_date: expiryDate,
      total_visits: planConfig.visits,
      balance: planConfig.visits,
      permissions: planConfig.permissions,
      linked_children_ids: [] // Пустой список изначально
    });

    // 5. Списание средств и обновление ссылки у юзера
    t.update(userRef, {
      wallet_balance: admin.firestore.FieldValue.increment(-planConfig.price),
      current_kidspace_pass_id: newPassRef.id
    });

    // 6. Лог транзакции
    t.set(db.collection('payments').doc(), {
      user_id: userId,
      amount: -planConfig.price,
      type: 'subscription_purchase',
      status: 'success',
      created_at: startDate
    });

    return { success: true, passId: newPassRef.id };
  });
});
```

---

## 2. Списание визита (`processVisitScan`)

**Trigger:** HTTP Request (клиент сканирует QR).

**Описание:** Проверяет валидность абонемента, правила 30 минут и списывает 1 визит.

**Pseudocode:**
```javascript
exports.processVisitScan = onCall(async (data, context) => {
  const { institutionId, geoLat, geoLng } = data;
  const userId = context.auth.uid;

  return db.runTransaction(async (t) => {
    // 1. Получаем активный пасс пользователя
    const userDoc = await t.get(db.collection('users').doc(userId));
    const passId = userDoc.data().current_kidspace_pass_id;
    if (!passId) throw new Error('No active pass');

    const passRef = db.collection('kidspace_passes').doc(passId);
    const passDoc = await t.get(passRef);

    // 2. Валидация пасса
    if (passDoc.data().status !== 'active') throw new Error('Pass not active');
    if (passDoc.data().balance <= 0) throw new Error('No visits left');
    if (passDoc.data().expiry_date.toDate() < new Date()) throw new Error('Pass expired');

    // 3. Проверка "Правила 30 минут" (Fraud Prevention)
    const lastVisitQuery = await db.collection('visits')
      .where('user_id', '==', userId)
      .where('institution_id', '==', institutionId)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!lastVisitQuery.empty) {
      const lastTime = lastVisitQuery.docs[0].data().timestamp.toDate();
      const diffMinutes = (new Date() - lastTime) / 60000;
      if (diffMinutes < 30) throw new Error('Wait 30 min before next scan');
    }

    // 4. Списание
    t.update(passRef, {
      balance: admin.firestore.FieldValue.increment(-1)
    });

    // 5. Запись визита
    t.set(db.collection('visits').doc(), {
      pass_id: passId,
      user_id: userId,
      institution_id: institutionId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      amount_deducted: 1
    });

    return { success: true, remaining: passDoc.data().balance - 1 };
  });
});
```

---

## 3. Автообновление подписок (`autoRenewJob`)

**Trigger:** Scheduled Pub/Sub (каждую ночь в 03:00).

**Описание:** Проверяет истекающие подписки. Если включено автопродление -> продлевает, иначе -> меняет статус на `expired`.

**Pseudocode:**
```javascript
exports.autoRenewJob = onSchedule('every 24 hours', async (event) => {
  const now = new Date();
  
  // 1. Ищем активные пассы, которые истекли
  const expiredPasses = await db.collection('kidspace_passes')
    .where('status', '==', 'active')
    .where('expiry_date', '<', now)
    .get();

  expiredPasses.forEach(async (doc) => {
    const passData = doc.data();
    
    // 2. Если автопродление включено
    if (passData.auto_renew) {
      const userRef = db.collection('users').doc(passData.user_id);
      const userDoc = await userRef.get();
      const planPrice = PASS_PACKAGES[passData.plan_id].price;

      // Попытка списания
      if (userDoc.data().wallet_balance >= planPrice) {
         // ... Логика создания НОВОГО пасса (см. purchasePass) ...
         // Старый пасс помечаем как 'renewed'
         await doc.ref.update({ status: 'renewed' });
      } else {
         // Нет денег - отмена и уведомление
         await doc.ref.update({ status: 'expired' });
         await sendNotification(passData.user_id, 'Ошибка продления', 'Недостаточно средств');
      }
    } else {
      // 3. Просто истек
      await doc.ref.update({ status: 'expired' });
      await sendNotification(passData.user_id, 'Подписка истекла', 'Купите новый пакет');
    }
  });
});
```

---

## 4. Рассылка уведомлений (`sendNotifications`)

**Trigger:** `onCreate` в коллекции `notifications`.

**Описание:** Слушает создание документа уведомления в БД и отправляет реальный FCM Push.

**Pseudocode:**
```javascript
exports.sendPushOnNotificationCreate = onDocumentCreated('notifications/{notifId}', async (event) => {
  const notifData = event.data.data();
  const userId = notifData.user_id;

  // 1. Получаем токены устройства юзера
  const userDoc = await db.collection('users').doc(userId).get();
  const tokens = userDoc.data().fcm_tokens;

  if (!tokens || tokens.length === 0) return;

  // 2. Формируем пейлоад
  const message = {
    notification: {
      title: notifData.title,
      body: notifData.message,
    },
    data: {
      click_action: notifData.action_link || '/'
    },
    tokens: tokens
  };

  // 3. Отправляем через FCM Admin SDK
  await admin.messaging().sendMulticast(message);
});
```

---

## 5. Мониторинг посещений детей (`monitorChildActivity`)

**Trigger:** `onCreate` в коллекции `visits`.

**Описание:** Агрегирует статистику для профиля ребенка, обновляет счетчики для геймификации.

**Pseudocode:**
```javascript
exports.monitorChildActivity = onDocumentCreated('visits/{visitId}', async (event) => {
  const visit = event.data.data();
  if (!visit.child_id) return; // Визит может быть без привязки к конкретному ребенку

  const childRef = db.collection('children').doc(visit.child_id);
  
  // Атомарное обновление статистики
  await childRef.update({
    'stats.total_visits': admin.firestore.FieldValue.increment(1),
    'stats.last_visit_date': visit.timestamp,
    'stats.activity_level': calculateActivityScore(visit) // Функция пересчета (0-100%)
  });

  // Проверка ачивок (Gamification)
  const childDoc = await childRef.get();
  if (childDoc.data().stats.total_visits === 10) {
     await grantBadge(visit.user_id, visit.child_id, 'Explorer');
  }
});
```

---

## 6. Автоматическое назначение врача (`assignDoctor`)

**Trigger:** Покупка `Health Pass` или создание заявки.

**Описание:** Если пользователь купил тариф с личным врачом, система назначает его автоматически (Round Robin или по загрузке).

**Pseudocode:**
```javascript
exports.assignDoctor = onDocumentCreated('healthcare_subscriptions/{subId}', async (event) => {
  const sub = event.data.data();
  
  // Если врач еще не назначен
  if (!sub.doctor_id) {
    // Найти врача с наименьшей нагрузкой
    const doctorsSnapshot = await db.collection('doctors')
      .where('specialty', '==', 'Pediatrician')
      .orderBy('patient_count', 'asc')
      .limit(1)
      .get();
      
    if (!doctorsSnapshot.empty) {
      const doctor = doctorsSnapshot.docs[0];
      
      // Назначаем
      await event.data.ref.update({ doctor_id: doctor.id });
      
      // Обновляем счетчик у врача
      await doctor.ref.update({ 
         patient_count: admin.firestore.FieldValue.increment(1) 
      });
    }
  }
});
```

---

## 7. Closing chat after inactivity (`cleanupChats`)

**Trigger:** Scheduled (каждый час).

**Описание:** Закрывает сессии чата, где не было активности 24 часа, чтобы врач не висел "занятым".

**Pseudocode:**
```javascript
exports.cleanupChats = onSchedule('every 1 hour', async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24ч назад

  const staleChats = await db.collection('chat_sessions')
    .where('last_message_time', '<', cutoff)
    .where('status', '==', 'open') // Предполагается поле статуса
    .get();

  const batch = db.batch();
  staleChats.forEach(doc => {
    batch.update(doc.ref, { status: 'closed' });
  });
  
  await batch.commit();
});
```

---

## 8. Проверка лимитов (`checkLimitsMiddleware`)

**Trigger:** Вызывается из других функций (например, `createConsultation`).

**Описание:** Вспомогательная логика для проверки квот Health Pass.

**Pseudocode:**
```javascript
async function checkHealthLimits(userId) {
  const subDoc = await db.collection('healthcare_subscriptions').doc(userId).get();
  
  if (!subDoc.exists || !subDoc.data().is_active) {
    throw new Error('No active Health Subscription');
  }

  const data = subDoc.data();
  if (data.consultations_used >= data.consultations_limit) {
    throw new Error('Consultation limit reached');
  }
  
  return true;
}
```

---

## 9. Billing Webhooks (`handlePaymentWebhook`)

**Trigger:** HTTP Request (Webhook от Payme/Click).

**Описание:** Обработка callback'а от платежной системы.

**Pseudocode:**
```javascript
exports.paymeWebhook = onRequest(async (req, res) => {
  const { transaction_id, amount, account, state } = req.body;
  
  // 1. Проверка подписи (Security)
  if (!verifyPaymeSignature(req)) return res.status(401).send();

  // 2. Идемпотентность (проверка, не обрабатывали ли уже)
  const existingTx = await db.collection('payments').where('external_id', '==', transaction_id).get();
  if (!existingTx.empty) return res.json({ result: 'OK' });

  // 3. Выполнение платежа (PerformTransaction)
  if (state === 2) { // Payme code for Success
      await db.runTransaction(async (t) => {
          const userRef = db.collection('users').doc(account.user_id);
          t.update(userRef, {
             wallet_balance: admin.firestore.FieldValue.increment(amount)
          });
          t.set(db.collection('payments').doc(), {
             external_id: transaction_id,
             amount: amount,
             status: 'success',
             provider: 'payme',
             created_at: new Date()
          });
      });
  }

  res.json({ result: 'OK' });
});
```

---

## 10. Логи активности (`logActivity`)

**Trigger:** Callable.

**Описание:** Централизованная запись важных действий для аудита.

**Pseudocode:**
```javascript
exports.logActivity = onCall((data, context) => {
  // Только для авторизованных
  if (!context.auth) return;

  db.collection('admin_logs').add({
    user_id: context.auth.uid,
    action: data.action, // e.g., 'clicked_banner', 'viewed_profile'
    meta: data.meta || {},
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ip: context.rawRequest.ip
  });
});
```
