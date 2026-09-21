# BFS Graph Visualizer

Інтерактивна веб-програма для візуалізації алгоритму пошуку в ширину (BFS) на графах.

Лабораторна робота №1 з курсу "Методи і системи штучного інтелекту"

## Огляд

Ця програма дозволяє:
- Створювати та редагувати графи інтерактивно
- Візуалізувати покрокове виконання алгоритму BFS
- Досліджувати вплив порядку обходу вершин на результати пошуку
- Порівнювати результати дзеркальних обходів (A→B vs B→A)
- Працювати з різними типами графів (неорієнтовані, орієнтовані, дерева, змішані)
- Експортувати графи та результати в різних форматах

## Технології

**Backend:**
- Python 3.11+
- FastAPI (REST API)
- Socket.IO (WebSocket для анімації)
- Pydantic (валідація даних)
- lxml (парсинг GraphML)

**Frontend:**
- React 18 + TypeScript
- Vite (збірка)
- Tailwind CSS (стилізація)
- Cytoscape.js (візуалізація графів)
- Socket.IO Client (WebSocket)

**Інфраструктура:**
- Docker + Docker Compose

## Вимоги

- Docker Desktop (версія 20.10+)
- Docker Compose (версія 2.0+)

## Швидкий старт

### 1. Клонування репозиторію

```bash
git clone <repository-url>
cd bfs-graph-visualizer
```

### 2. Запуск через Docker Compose

```bash
docker-compose up --build
```

Ця команда:
- Збудує Docker образи для backend та frontend
- Запустить обидва сервіси
- Автоматично завантажить початковий граф (35 вершин, 5 гілок)

### 3. Відкрийте браузер

Перейдіть за адресою: **http://localhost:5173**

Backend API доступний за адресою: **http://localhost:8000**

API документація (Swagger): **http://localhost:8000/docs**

## Використання

### Початок роботи

1. **Вибір графа:** У лівій панелі виберіть активний граф або завантажте приклад
2. **Вибір вершин:** Оберіть стартову та цільову вершини з випадаючих списків
3. **Налаштування:** Виберіть тип графа, порядок обходу та швидкість анімації
4. **Запуск:** Натисніть кнопку "Start BFS"

### Інтерактивне редагування графа

#### Створення вершини
- **Правий клік** на порожньому місці canvas

#### Створення ребра
- Натисніть **Ctrl** (або **Cmd** на Mac)
- **Клікніть** на першу вершину
- **Клікніть** на другу вершину
- Відпустіть **Ctrl**

#### Видалення елементів
- **Правий клік** на вершині → підтвердження видалення
- **Правий клік** на ребрі → підтвердження видалення

#### Зміна напрямку ребра
- **Подвійний клік** на ребрі → перемикає між ребром та дугою

#### Переміщення вершин
- **Drag & drop** вершини мишкою

### Керування анімацією

- **Play/Pause** - запуск/пауза анімації
- **Stop** - зупинка та скидання
- **Step Forward/Backward** - покрокове переміщення
- **Seek bar** - перехід до конкретного кроку
- **Speed slider** - регулювання швидкості (0.25x - 4x)

### Порівняння дзеркальних обходів

1. Виберіть вершини A і B
2. Запустіть BFS (A → B)
3. Дочекайтесь завершення
4. **Натисніть "Swap Start and Goal"**
5. Запустіть BFS знову (B → A)
6. Таблиця порівняння відобразить різницю в метриках

### Експорт результатів

Натисніть кнопку **"Export"** в верхньому правому куті:

- **GraphML (XML)** - повний граф з координатами (стандарт GraphML)
- **JSON** - граф + результати BFS
- **Markdown Report** - текстовий звіт з метриками та порівнянням

## Структура проєкту

```
bfs-graph-visualizer/
├── backend/
│   ├── models/           # Моделі даних (Node, Edge, Graph)
│   ├── algorithms/       # Алгоритм BFS
│   ├── api/             # REST endpoints та WebSocket
│   ├── services/        # Бізнес-логіка
│   ├── utils/           # GraphML парсер, генератор графів
│   ├── main.py          # Точка входу FastAPI
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/  # React компоненти
│   │   ├── contexts/    # React Context (Graph, BFS)
│   │   ├── services/    # API та WebSocket клієнти
│   │   ├── types/       # TypeScript типи
│   │   ├── utils/       # Cytoscape конфігурація
│   │   ├── App.tsx      # Головний компонент
│   │   └── main.tsx     # Точка входу
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── data/                # Shared volume (графи, експорт)
├── docker-compose.yml
└── README.md
```

## Типи графів

### 1. Неорієнтований граф (Undirected)
- Ребра без напрямку
- A-B дозволяє рух в обидва боки

### 2. Орієнтований граф (Directed)
- Дуги зі стрілками
- A→B дозволяє рух тільки від A до B

### 3. Дерево (Tree)
- Ацикличний зв'язний граф
- N вершин, N-1 ребер
- Валідація на відсутність циклів

### 4. Змішаний (Mixed)
- Комбінація ребер і дуг
- Подвійний клік на ребрі перемикає його тип

## Порядок обходу сусідів

BFS може обходити сусідні вершини в різному порядку:

- **ID Ascending** - за зростанням ідентифікатора
- **ID Descending** - за спаданням ідентифікатора
- **X Ascending** - за X-координатою (зліва направо)
- **X Descending** - за X-координатою (справа наліво)
- **Y Ascending** - за Y-координатою (зверху вниз)
- **Y Descending** - за Y-координатою (знизу вгору)

Зміна порядку обходу впливає на кількість кроків алгоритму, але не на довжину знайденого шляху (BFS завжди знаходить найкоротший шлях).

## Метрики

Програма відстежує та відображає:

- **Current Step** - поточний крок алгоритму
- **Visited Nodes** - кількість відвіданих вершин
- **Queue Size** - розмір черги на поточному кроці
- **Path Length** - довжина знайденого шляху
- **Algorithm Steps** - загальна кількість ітерацій
- **Execution Time** - час виконання в мілісекундах

## Колірна схема візуалізації

- **Сірий** - звичайна вершина
- **Зелений** - стартова вершина
- **Червоний** - цільова вершина
- **Синій** - відвідана вершина
- **Жовтий** - вершина в черзі
- **Фіолетовий** - поточна вершина (при анімації)
- **Товста зелена обводка** - вершина в знайденому шляху

## API Endpoints

### REST API

```
GET    /api/graphs              # Отримати всі графи
POST   /api/graphs              # Створити новий граф
GET    /api/graphs/{id}         # Отримати граф за ID
PUT    /api/graphs/{id}         # Оновити граф
DELETE /api/graphs/{id}         # Видалити граф

POST   /api/graphs/{id}/nodes   # Додати вершину
DELETE /api/graphs/{id}/nodes/{node_id}

POST   /api/graphs/{id}/edges   # Додати ребро
DELETE /api/graphs/{id}/edges/{edge_id}

POST   /api/graphs/{id}/validate    # Валідація графа
POST   /api/graphs/{id}/bfs         # Запустити BFS

POST   /api/graphs/import            # Завантажити GraphML
GET    /api/graphs/{id}/export/xml
GET    /api/graphs/{id}/export/json
POST   /api/graphs/{id}/export/report

POST   /api/graphs/load-example/{name}  # Завантажити приклад
```

### WebSocket Events

**Client → Server:**
```
bfs:start    - запуск BFS
bfs:pause    - пауза
bfs:resume   - відновлення
bfs:stop     - зупинка
bfs:step     - крок вперед/назад
bfs:seek     - перехід до кроку
```

**Server → Client:**
```
bfs:step_update  - оновлення кроку
bfs:complete     - завершення
bfs:error        - помилка
```

## Troubleshooting

### Порт вже зайнятий

Якщо порт 5173 або 8000 зайнятий, змініть в `docker-compose.yml`:

```yaml
ports:
  - "5174:5173"  # frontend
  - "8001:8000"  # backend
```

Та оновіть `VITE_API_URL` у frontend сервісі.

### Backend не стартує

Перевірте логи:
```bash
docker-compose logs backend
```

Переконайтесь що всі залежності встановлені:
```bash
docker-compose build --no-cache backend
```

### Frontend не підключається до backend

1. Перевірте що backend запущений: http://localhost:8000/health
2. Перевірте CORS налаштування в `backend/main.py`
3. Очистіть кеш браузера

### Граф не відображається

1. Перевірте що активний граф вибраний в лівій панелі
2. Перевірте консоль браузера на помилки
3. Спробуйте завантажити приклад графа

## Зупинка та очищення

### Зупинка сервісів
```bash
docker-compose down
```

### Видалення volumes
```bash
docker-compose down -v
```

### Видалення images
```bash
docker-compose down --rmi all
```

## Розробка

### Локальний запуск без Docker

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:socket_app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Тестування

Backend тести (pytest):
```bash
cd backend
pytest
```

Frontend тести (Vitest):
```bash
cd frontend
npm test
```

## Додаткова інформація

### Формат GraphML

Програма використовує стандарт GraphML для експорту/імпорту:
- http://graphml.graphdrawing.org/

### Обмеження

- Максимум 1000 вершин в графі
- Максимум 5000 ребер в графі
- WebSocket timeout: 5 хвилин

### Браузери

Підтримуються сучасні браузери:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Автор

Лабораторна робота №1  
Львівський національний університет імені Івана Франка  
Факультет електроніки та комп'ютерних технологій

## Ліцензія

MIT License

---

**Дата створення:** 2026-09-12  
**Версія:** 1.0.0
