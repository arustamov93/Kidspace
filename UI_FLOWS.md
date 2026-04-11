# UI Flows & Navigation Logic (KidSpace 5.0)

Этот документ описывает потоки пользовательского интерфейса (User Journeys) для реализации во FlutterFlow.

Обозначения:
*   **[Page]**: Экран.
*   **<Modal>**: Всплывающее окно / Bottom Sheet.
*   **Action**: Действие по нажатию (Navigation, Backend Call, Update State).
*   **DB**: Взаимодействие с Firestore.

---

## 1. Авторизация (Auth Flow)

**Цель:** Идентификация пользователя по номеру телефона.

1.  **[Splash Screen]**
    *   *Logic:* Check Auth State.
    *   *If Logged In:* -> Navigate to **[NavBarPage (Home)]**.
    *   *If Logged Out:* -> Navigate to **[Onboarding]**.

2.  **[Onboarding]**
    *   PageView (3 слайда: "Находи", "Бронируй", "Экономь").
    *   Button "Начать" -> Navigate to **[AuthLogin]**.

3.  **[AuthLogin]**
    *   Widget: TextField (Phone Number + Mask `+998 ## ### ## ##`).
    *   Button "Продолжить":
        *   *Action:* `Auth.signInWithPhone`.
        *   -> Navigate to **[AuthVerify]**.

4.  **[AuthVerify]**
    *   Widget: PinCode (6 digits).
    *   *On Completed:* `Auth.verifySMS`.
    *   *Success:*
        *   *Backend Query:* Read `users/{authUserUID}`.
        *   *Condition:*
            *   Doc exists? -> Navigate to **[NavBarPage]**.
            *   Doc empty? -> Navigate to **[CreateProfile]**.

5.  **[CreateProfile]**
    *   Form: Name, City (Dropdown), Role (Hidden default: 'parent').
    *   Button "Готово":
        *   *Action:* `Firestore Create Document (users)`.
        *   -> Navigate to **[NavBarPage]**.

---

## 2. Добавление детей (Add Children Flow)

**Цель:** Создать профиль ребенка для персонализации и бронирования.

1.  **Entry Point:** **[ProfilePage]** -> Button "Добавить ребенка".
2.  **<ChildFormModal>** (Bottom Sheet)
    *   **Fields:**
        *   Avatar (Upload Media -> Firebase Storage).
        *   Name (TextField).
        *   Birth Date (Date Picker).
        *   Gender (ChoiceChips: Boy/Girl).
        *   Interests (CheckboxGroup: "Lego", "Drawing", "Dance").
    *   **Button "Сохранить":**
        *   *Validation:* Name != null.
        *   *Action 1:* `Firestore Create Document (children)` with `parent_id = authUser.uid`.
        *   *Action 2:* `Firestore Update Document (currentUser)` -> Add reference to `children` array (optional, for speed).
        *   *Action 3:* Close Modal.
        *   *Action 4:* Show Snackbar "Профиль создан".

---

## 3. Покупка абонемента (Buy Pass Flow)

**Цель:** Оформление подписки Kidspace Pass.

1.  **[PassPage]**
    *   ListView: Query collection `pass_packages`.
    *   Tap on Item -> Navigate to **[PackageDetails]** (Pass Parameter: `packageRef`).

2.  **[PackageDetails]**
    *   Display: Price, Visits Count, Description.
    *   Button "Купить сейчас":
        *   -> Open **<PaymentMethodModal>**.

3.  **<PaymentMethodModal>**
    *   Options: "Wallet", "Click", "Payme".
    *   **Button "Оплатить":**
        *   *Action 1 (Server logic):* Call Cloud Function `purchasePass(planId, userId)`.
        *   *UI State:* Show Loading Indicator (Non-blocking).
        *   *On Success:* Navigate to **[PaymentSuccess]**.
        *   *On Error:* Show Alert Dialog.

4.  **[PaymentSuccess]**
    *   Lottie Animation (Confetti).
    *   Text: "Абонемент активирован!".
    *   Button "К моим абонементам" -> Navigate to **[PassPage]**.

---

## 4. Использование визита (Visit Flow)

**Цель:** Списание визита через QR-код в заведении.

1.  **[NavBarPage]** -> FAB (Floating Action Button) с иконкой QR.
2.  **[ScanQRPage]**
    *   Widget: `BarcodeScanner`.
    *   *On Code Scanned (Value = institutionID):*
        *   Update Page State: `scannedId = Value`.
        *   Show BottomSheet **<ConfirmVisitModal>**.

3.  **<ConfirmVisitModal>**
    *   *Backend Query:* Get `institutions/{scannedId}` to show name.
    *   Text: "Списать 1 визит в {InstitutionName}?".
    *   **Button "Подтвердить":**
        *   *Action:* Call Cloud Function `processVisitScan(institutionId, geo)`.
        *   *Result:*
            *   Success: Show "Checkmark" -> Close Modal -> Refresh **[PassPage]**.
            *   Error (Expired/No Balance): Show Error message.

---

## 5. Бронирование мастер-класса (Booking Flow)

**Цель:** Запись ребенка на занятие.

1.  **[InstitutionDetails]**
    *   Tab "Services".
    *   ListTile "Service Name".
    *   Button "Записаться" -> Open **<BookingCreateModal>**.

2.  **<BookingCreateModal>**
    *   **Step 1: Select Service** (Passed from previous screen).
    *   **Step 2: Select Date & Time**
        *   Calendar Widget.
        *   ChoiceChips (Time Slots from subcollection `slots`).
    *   **Step 3: Select Child**
        *   Dropdown (Source: My Children query).
    *   **Step 4: Payment (If deposit required)**
        *   Conditional Visibility: If `service.deposit > 0`.
    *   **Button "Забронировать":**
        *   *Action:* `Firestore Create Document (bookings)`.
            *   Fields: `status: 'pending'`, `child_id`, `service_ref`.
        *   *Action:* Show Snackbar "Заявка отправлена".
        *   *Action:* Close Modal.

---

## 6. Видео-чаты с врачом (Doctor Telemed Flow)

**Цель:** Онлайн консультация.

1.  **[HealthPage]**
    *   Filter: Toggle "Сейчас онлайн".
    *   ListView: `doctors` collection.
    *   Tap Doctor -> **[DoctorProfile]**.

2.  **[DoctorProfile]**
    *   Info: Experience, Specialty.
    *   Button "Видеоконсультация ({price})".
        *   *Check Logic:* `health_pass.balance > 0` OR `wallet > price`.
        *   -> Navigate to **[VideoCallWaiting]**.

3.  **[VideoCallWaiting]** (Lobby)
    *   Text: "Соединение с врачом...".
    *   *Backend:* Create `consultations` doc.
    *   *Trigger:* When Doctor accepts -> Navigate to **[VideoCallRoom]**.

4.  **[VideoCallRoom]**
    *   Widget: Mux Broadcast / Agora Video Call / Jitsi.
    *   Controls: Mute, Camera Off, End Call.
    *   **Button "End":**
        *   *Action:* Update `consultations` status -> 'completed'.
        *   -> Navigate to **<RateDoctorModal>**.

---

## 7. История посещений (History Flow)

1.  **[ProfilePage]** -> Button "История".
2.  **[HistoryPage]**
    *   Tabs: "Визиты (Pass)", "Брони", "Покупки".
    *   **Tab 1 (Visits):**
        *   ListView: `visits` collection.
        *   Filter: `user_id == authUser`.
        *   Order: `timestamp` Descending.
    *   **Tab 2 (Bookings):**
        *   ListView: `bookings` collection.
        *   Status badges: Green (Confirmed), Red (Cancelled).

---

## 8. Профиль ребёнка (Child Profile Flow)

1.  **[ProfilePage]** -> Horizontal List of Children -> Tap Child.
2.  **<ChildDetailModal>**
    *   Display: Avatar, Name, "Level 5 Explorer" (Gamification).
    *   Stats Chart: "Посещено мест за месяц".
    *   List: "Интересы".
    *   **Button "Редактировать":**
        *   -> Open **<ChildFormModal>** (Pre-filled).
    *   **Button "История активностей":**
        *   -> Navigate to **[ChildHistory]**.

---

## 9. Пакеты и тарифы (Packages Flow)

1.  **[PassPage]** (Main Tab)
    *   **Section 1: Active Pass**
        *   Conditional Visibility: If `user.kidspace_pass != null`.
        *   Card: Balance, Expiry Date, QR-Code Button.
    *   **Section 2: Buy New**
        *   ListView: `pass_packages`.
        *   Cards showing "Visits", "Price", "Badge (Best Value)".

---

## 10. Моя семья (My Family Flow)

1.  **[ProfilePage]**
2.  **Section "Семья"**:
    *   List of Children.
    *   List of Partners (e.g. Spouse) - *Future Feature*.
3.  **Action "Добавить ребенка":**
    *   Triggers **Добавление детей (Flow #2)**.
4.  **Action "Настройки уведомлений":**
    *   SwitchListTile: "Push при списании", "Push при акциях".
    *   *Action:* `Firestore Update Document (users)`.
