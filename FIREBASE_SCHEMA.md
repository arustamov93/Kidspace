# Firestore Data Model for Kidspace 5.0

## 1. users
**Описание:** Основная коллекция пользователей (Родители, Партнеры, Врачи, Админы).
*   **ID:** `uid` (из Firebase Authentication)

**Поля:**
*   `name` (string): Полное имя.
*   `email` (string): Email.
*   `phone` (string): Номер телефона.
*   `role` (string): 'parent' | 'institution' | 'doctor' | 'admin'.
*   `avatar_url` (string): Ссылка на фото.
*   `region` (map):
    *   `city` (string)
    *   `district` (string)
    *   `geo` (GeoPoint)
*   `wallet_balance` (number): Текущий баланс в тийинах/сумах.
*   `current_kidspace_pass_id` (reference): Ссылка на активный документ в `kidspace_passes`.
*   `fcm_tokens` (array): Токены для Push-уведомлений.
*   `created_at` (timestamp)
*   `last_login` (timestamp)

**Индексация:** `phone`, `email`.

---

## 2. children
**Описание:** Профили детей.
*   **ID:** Auto-generated
*   **Ref:** `parent_id` -> `users`

**Поля:**
*   `parent_id` (string): UID родителя.
*   `name` (string): Имя ребенка.
*   `dob` (timestamp): Дата рождения.
*   `gender` (string): 'boy' | 'girl'.
*   `photo_url` (string).
*   `interests` (array): Теги интересов (например, ["Robotics", "Swimming"]).
*   `stats` (map):
    *   `activity_level` (number)
    *   `attendance_rate` (number)

**Индексация:** `parent_id` (обязательно для запросов "Мои дети").

---

## 3. kidspace_passes
**Описание:** Активные и архивные подписки Kidspace Pass.
*   **ID:** Auto-generated
*   **Ref:** `user_id` -> `users`

**Поля:**
*   `user_id` (string): UID владельца.
*   `plan_id` (string): ID тарифа (например, 'pack_12').
*   `plan_name` (string).
*   `status` (string): 'active' | 'expired' | 'cancelled'.
*   `start_date` (timestamp).
*   `expiry_date` (timestamp).
*   `total_visits` (number): Изначальное кол-во визитов.
*   `balance` (number): Остаток визитов.
*   `permissions` (map):
    *   `playgrounds` (boolean)
    *   `masterclasses` (boolean)
*   `linked_children_ids` (array): ID детей, привязанных к пассу.

**Индексация:** Композитный индекс `user_id` + `status`.

---

## 4. visits
**Описание:** История посещений по Kidspace Pass (Списания).
*   **ID:** Auto-generated
*   **Ref:** `pass_id` -> `kidspace_passes`, `institution_id` -> `institutions`

**Поля:**
*   `pass_id` (string).
*   `user_id` (string).
*   `child_id` (string).
*   `institution_id` (string).
*   `institution_name` (string): Денормализация для быстрого чтения.
*   `timestamp` (timestamp): Время сканирования QR.
*   `amount_deducted` (number): Обычно 1 визит.

**Индексация:** `user_id` + `timestamp` (desc), `institution_id` + `timestamp`.

---

## 5. healthcare_subscriptions
**Описание:** Подписки на медицинский модуль Health+.
*   **ID:** `user_id` (Один активный документ на пользователя или Auto-gen для истории).

**Поля:**
*   `user_id` (string).
*   `plan_type` (string): 'Basic' | 'Family'.
*   `is_active` (boolean).
*   `consultations_limit` (number).
*   `consultations_used` (number).
*   `expiry_date` (timestamp).

---

## 6. doctors
**Описание:** Профили врачей для телемедицины.
*   **ID:** `uid` (Связан с users, но расширенные данные).

**Поля:**
*   `name` (string).
*   `specialty` (string): 'Pediatrician', 'Neurologist' и т.д.
*   `experience_years` (number).
*   `rating` (number).
*   `review_count` (number).
*   `is_online` (boolean): Статус для мгновенных звонков.
*   `price_chat` (number).
*   `price_video` (number).
*   `photo_url` (string).

**Индексация:** `specialty`, `is_online` + `rating` (для сортировки лучших онлайн врачей).

---

## 7. consultations
**Описание:** Записи о прошедших или планируемых консультациях.
*   **ID:** Auto-generated
*   **Ref:** `doctor_id`, `user_id`

**Поля:**
*   `doctor_id` (string).
*   `user_id` (string).
*   `child_id` (string, optional).
*   `type` (string): 'chat' | 'video'.
*   `status` (string): 'scheduled' | 'completed' | 'cancelled'.
*   `scheduled_at` (timestamp).
*   `completed_at` (timestamp).
*   `medical_report` (string): Рекомендации врача (encrypted optional).

**Индексация:** `user_id` + `scheduled_at`.

---

## 8. chat_sessions
**Описание:** Метаданные чатов (список диалогов).
*   **ID:** Auto-generated или `user_id_partner_id`.

**Поля:**
*   `participants` (array): [uid1, uid2].
*   `type` (string): 'support' | 'doctor' | 'institution'.
*   `last_message_text` (string).
*   `last_message_time` (timestamp).
*   `unread_counts` (map): { uid1: 0, uid2: 1 }.

**Подколлекции:** `messages`.

**Индексация:** `participants` (array-contains).

---

## 9. messages (Sub-collection of chat_sessions)
**Описание:** История переписки.
*   **ID:** Auto-generated

**Поля:**
*   `sender_id` (string).
*   `text` (string).
*   `attachments` (array): Ссылки на фото/файлы.
*   `timestamp` (timestamp).
*   `is_read` (boolean).

**Индексация:** `timestamp` (asc).

---

## 10. institutions
**Описание:** Каталог садиков, школ, курсов.
*   **ID:** Auto-generated

**Поля:**
*   `name` (string).
*   `type` (string): 'Kindergarten' | 'School' | 'Course'.
*   `description` (string).
*   `address` (string).
*   `location` (GeoPoint).
*   `geohash` (string): Для гео-запросов.
*   `price_min` (number).
*   `rating` (number).
*   `is_verified` (boolean).
*   `owner_id` (string): UID партнера.
*   `services` (array of objects): Список услуг для бронирования.
*   `images` (array).

**Индексация:**
*   `geohash`
*   `type` + `price_min`
*   `type` + `rating`

---

## 11. reviews
**Описание:** Отзывы пользователей.
*   **ID:** Auto-generated
*   **Ref:** `institution_id`, `user_id`

**Поля:**
*   `institution_id` (string).
*   `user_id` (string).
*   `user_name` (string): Денормализация.
*   `user_avatar` (string): Денормализация.
*   `rating` (number).
*   `text` (string).
*   `photos` (array).
*   `status` (string): 'published' | 'moderation' | 'rejected'.
*   `created_at` (timestamp).
*   `reply_text` (string, optional).

**Индексация:** `institution_id` + `created_at` (desc).

---

## 12. bookings
**Описание:** Заявки и брони (например, пробный урок).
*   **ID:** Auto-generated

**Поля:**
*   `institution_id` (string).
*   `user_id` (string).
*   `child_id` (string).
*   `service_id` (string).
*   `date_time` (timestamp).
*   `status` (string): 'pending' | 'confirmed' | 'cancelled' | 'completed'.
*   `deposit_amount` (number).
*   `is_deposit_paid` (boolean).

**Индексация:** `user_id` + `date_time`, `institution_id` + `date_time`.

---

## 13. marketplace_products
**Описание:** Товары в магазине.
*   **ID:** Auto-generated

**Поля:**
*   `name` (string).
*   `category` (string): 'Toys', 'Books', etc.
*   `price` (number).
*   `description` (string).
*   `images` (array).
*   `stock_quantity` (number).
*   `options` (array): Варианты (цвет, размер).
*   `rating` (number).

**Индексация:** `category`, `price`.

---

## 14. orders
**Описание:** Заказы товаров.
*   **ID:** Auto-generated

**Поля:**
*   `user_id` (string).
*   `items` (array of maps): { product_id, quantity, price_at_purchase, options }.
*   `total_amount` (number).
*   `status` (string): 'processing' | 'shipping' | 'delivered'.
*   `delivery_address` (map).
*   `created_at` (timestamp).

**Индексация:** `user_id` + `created_at` (desc).

---

## 15. notifications
**Описание:** Системные уведомления.
*   **ID:** Auto-generated

**Поля:**
*   `user_id` (string).
*   `title` (string).
*   `message` (string).
*   `type` (string): 'info' | 'alert' | 'success'.
*   `is_read` (boolean).
*   `created_at` (timestamp).
*   `action_link` (string, optional): Deep link.

**Индексация:** `user_id` + `created_at` (desc).

---

## 16. payments
**Описание:** Лог транзакций (пополнения, оплаты).
*   **ID:** Auto-generated (или ID от платежной системы).

**Поля:**
*   `user_id` (string).
*   `amount` (number).
*   `currency` (string): 'UZS'.
*   `type` (string): 'wallet_topup' | 'subscription' | 'booking' | 'marketplace'.
*   `provider` (string): 'click' | 'payme' | 'internal_wallet'.
*   `status` (string): 'success' | 'failed' | 'pending'.
*   `metadata` (map): { order_id, pass_id, etc. }.
*   `created_at` (timestamp).

**Индексация:** `user_id` + `created_at`.

---

## 17. admin_logs
**Описание:** Журнал действий администраторов и модераторов.
*   **ID:** Auto-generated

**Поля:**
*   `admin_id` (string).
*   `action` (string): 'approve_review', 'verify_institution', 'ban_user'.
*   `target_id` (string).
*   `details` (string/map).
*   `timestamp` (timestamp).

**Индексация:** `timestamp` (desc), `admin_id`.
