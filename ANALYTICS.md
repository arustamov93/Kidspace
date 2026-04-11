# Analytics Strategy & BigQuery Architecture (KidSpace 5.0)

Этот документ описывает систему аналитики, построенную на связке **Firebase Analytics** (сбор сырых событий) и **Google BigQuery** (хранилище и SQL-анализ).

---

## 1. Архитектура данных

```mermaid
graph LR
    A[Mobile App / Web] -->|Log Events| B(Firebase Analytics)
    B -->|Automatic Export| C(Google BigQuery)
    D[Firestore DB] -->|Scheduled Export| C
    C -->|SQL Queries| E[Looker Studio / Tableau]
    C -->|Reverse ETL| F[Firebase Messaging (Push Campaigns)]
```

*   **Firebase Analytics:** Сбор событий в реальном времени (`scan_qr`, `purchase`, `view_screen`).
*   **BigQuery:** Хранение истории событий + Снэпшоты базы данных (для расчета RFM по историческим транзакциям).
*   **Looker Studio:** Визуализация дашбордов для инвесторов и продукта.

---

## 2. Основные KPI (Business Metrics)

Эти метрики отслеживают здоровье бизнеса в целом.

| Метрика | Описание | Формула (SQL Logic) |
| :--- | :--- | :--- |
| **MRR (Monthly Recurring Revenue)** | Регулярная выручка от подписок Kidspace Pass и Health+. | `SUM(subscription_price)` активных подписок на конец месяца. |
| **GMV (Gross Merchandise Value)** | Общий оборот маркетплейса. | `SUM(order_total)` из коллекции `orders`. |
| **CAC (Customer Acquisition Cost)** | Стоимость привлечения платящего пользователя. | `Marketing Spend / New Paying Users`. |
| **LTV (Lifetime Value)** | Средняя прибыль с пользователя за все время жизни. | `ARPU (Average Revenue Per User) * Lifetime`. |
| **MAU / DAU** | Активные пользователи (месяц/день). | `COUNT(DISTINCT user_id)` where `event_timestamp` in range. |
| **Stickiness** | "Липкость" продукта. | `DAU / MAU` (насколько часто возвращаются). |

---

## 3. Метрики продуктовой аналитики (По модулям)

### A. Kidspace Pass (Абонементы)
*   **Utilization Rate:** % использованных визитов от купленных.
    *   *Цель:* Если < 30% — риск оттока (пользователь не видит ценности). Если > 90% — отличный Product-Market Fit.
*   **Renewal Rate:** % пользователей, продливших подписку после истечения.
*   **Scan Success Rate:** Отношение успешных сканирований к ошибкам (техническим или лимитным).

### B. Health+ (Телемедицина)
*   **Triage-to-Consultation:** Конверсия из Симптом-чекера (AI) в запись к живому врачу.
*   **Waiting Time:** Среднее время от оплаты до ответа врача (для чата) или начала звонка.
*   **Re-booking Rate:** Как часто возвращаются к *тому же* врачу.

### C. KidsMarket
*   **Cart Abandonment Rate:** % корзин, не перешедших в оплату.
*   **AOV (Average Order Value):** Средний чек.
*   **Return Rate:** % возвратов товаров.

### D. Directory (Каталог)
*   **Zero Search Results:** % поисковых запросов, вернувших 0 результатов (сигнал для расширения базы партнеров).
*   **Lead Conversion:** (Клики по "Позвонить" + "Забронировать") / Просмотры карточки заведения.

---

## 4. RFM Анализ (Segmentation)

Сегментация пользователей на основе истории покупок (`payments` collection) в BigQuery.

*   **Recency (R):** Сколько дней прошло с последней покупки/визита.
*   **Frequency (F):** Количество транзакций за период (год).
*   **Monetary (M):** Общая сумма потраченных денег.

### Сегменты пользователей:

1.  **Champions (R=5, F=5, M=5):**
    *   *Поведение:* Покупают часто, много и недавно.
    *   *Action:* Дать VIP статус, ранний доступ к акциям.
2.  **Loyal Customers (R=3-4, F=4-5, M=4-5):**
    *   *Поведение:* Регулярные клиенты.
    *   *Action:* Upsell более дорогих пакетов (Pack 20 вместо Pack 10).
3.  **At Risk (R=1-2, F=3-5, M=3-5):**
    *   *Поведение:* Платили раньше много, но давно не заходили.
    *   *Action:* Win-back email кампания, пуш с промокодом "Мы скучаем".
4.  **Hibernating (R=1-2, F=1-2, M=1-2):**
    *   *Поведение:* Купили один раз давно и пропали.
    *   *Action:* Реактивация или исключение из маркетинга (чтобы не спамить).

---

## 5. Churn Метрики (Отток)

*   **Subscription Churn:** Пользователи, отменившие автопродление или не купившие новый пакет через 7 дней после `expiry_date`.
*   **Revenue Churn:** Потерянная выручка от ушедших пользователей.
*   **Hard Churn:** Удаление аккаунта.
*   **Soft Churn:** Отсутствие активности (`app_open`) более 30 дней.

**SQL Logic для Churn Prediction:**
Анализ паттернов перед уходом:
*   Снижение частоты использования QR-сканера.
*   Негативный отзыв (`rating` <= 3).
*   Обращение в Support с тегом "Complaint".

---

## 6. Лайфтайм детей (Child Profile Analytics)

Уникальная метрика для KidSpace. Мы анализируем не только пользователя (родителя), но и жизненный цикл ребенка.

*   **Age Progression:** Переход из категории `Kindergarten` (3-6 лет) в `School` (7+).
    *   *Action:* Автоматическая рекомендация сменить категорию интересов в 6.5 лет.
*   **CLV (Child Lifetime Value):** Сколько денег тратится на конкретного ребенка.
*   **Interest Evolution:** Как меняются теги интересов (например, "Lego" -> "Robotics" -> "Programming").
*   **Health Incident Rate:** Частота обращений к врачам (сезонность заболеваний).

---

## 7. Usage Активность (Engagement)

События, которые необходимо логировать в коде (FlutterFlow/React):

| Event Name | Params | Описание |
| :--- | :--- | :--- |
| `app_open` | `source` (push/organic) | Открытие приложения. |
| `view_institution` | `id`, `category`, `name` | Просмотр карточки. |
| `add_to_cart` | `product_id`, `price`, `currency` | Добавление в корзину. |
| `begin_checkout` | `value`, `items_count` | Начало оформления. |
| `purchase` | `transaction_id`, `value`, `tax`, `shipping` | Успешная оплата (ecommerce). |
| `scan_qr_attempt` | `location_lat`, `location_long` | Попытка сканирования. |
| `scan_qr_success` | `institution_id`, `visit_number` | Успешное списание. |
| `consultation_start` | `doctor_id`, `type` (video/chat) | Начало консультации. |
| `search` | `term`, `results_count` | Поиск. |

---

## 8. Пример SQL запроса (BigQuery) для RFM

```sql
WITH rfm_base AS (
  SELECT
    user_id,
    DATE_DIFF(CURRENT_DATE(), MAX(DATE(created_at)), DAY) as recency_days,
    COUNT(DISTINCT id) as frequency_count,
    SUM(amount) as monetary_value
  FROM
    `kidspace_project.firestore_export.payments`
  WHERE
    status = 'success'
    AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 365 DAY)
  GROUP BY
    user_id
)

SELECT
  user_id,
  recency_days,
  frequency_count,
  monetary_value,
  NTILE(5) OVER (ORDER BY recency_days DESC) as R_Score,
  NTILE(5) OVER (ORDER BY frequency_count ASC) as F_Score,
  NTILE(5) OVER (ORDER BY monetary_value ASC) as M_Score
FROM
  rfm_base
```
