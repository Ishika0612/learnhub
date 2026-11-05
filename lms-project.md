# Learning Management System (LMS): Project Document

A full-stack LMS where instructors publish courses and students enroll, learn, take quizzes, submit assignments, and earn certificates.

**Stack:** Next.js, Tailwind CSS, Bootstrap, FastAPI, PostgreSQL, MongoDB, Redis, Nginx, Docker, Material UI

---

## 1. Goals

- Build a realistic, production-style multi-service application.
- Use each technology for a genuine reason (not just to tick boxes).
- Practice auth, roles, background jobs, caching, real-time features, and containerized deployment.

## 2. User Roles

| Role | Capabilities |
|---|---|
| **Student** | Browse catalog, enroll, watch lessons, take quizzes, submit assignments, track progress, download certificates, join discussions |
| **Instructor** | Create/edit courses, add modules and lessons, build quizzes, grade assignments, view course analytics |
| **Admin** | Manage users, approve/unpublish courses, view platform analytics, manage categories |

## 3. Feature List

### MVP
- Registration, login, logout, password reset (JWT access + refresh tokens)
- Role-based access control
- Course CRUD with modules and lessons (text, video link, PDF)
- Catalog with search, category filter, pagination
- Enrollment and lesson-completion tracking
- Course progress percentage
- Multiple-choice quizzes with auto-grading
- Assignment upload and instructor grading
- PDF certificate on course completion

### Phase 2
- Real-time notifications (WebSockets)
- Discussion threads per course
- Course ratings and reviews
- Email notifications (enrollment, grades, certificate)
- Admin dashboard with analytics

### Stretch
- Payments (Razorpay / Stripe) for paid courses
- Video streaming via HLS
- Course recommendations
- Live Q&A sessions
- Instructor analytics (drop-off points, hardest quiz questions)
- Gamification: points, badges, leaderboard

---

## 4. System Architecture

```
                    ┌──────────────────────────┐
   Browser  ──────► │          Nginx           │
                    │  reverse proxy / limits  │
                    └─────┬──────────────┬─────┘
                          │ /            │ /api, /ws
                  ┌───────▼──────┐  ┌────▼───────────┐
                  │   Next.js    │  │    FastAPI     │
                  │ Tailwind +   │  │  REST + WS     │
                  │Bootstrap+MUI │  └──┬────┬────┬───┘
                  └──────────────┘     │    │    │
                              ┌────────▼┐ ┌─▼────┴──┐ ┌▼────────┐
                              │Postgres │ │ MongoDB │ │  Redis  │
                              └─────────┘ └─────────┘ └────┬────┘
                                                           │ queue
                                                     ┌─────▼──────┐
                                                     │   Worker   │
                                                     │ (Celery/RQ)│
                                                     └────────────┘
```

### Why each technology

| Tool | Responsibility |
|---|---|
| **Next.js** | SSR/ISR for SEO-friendly course pages; student app and instructor/admin UI |
| **Tailwind CSS** | Styling for the student-facing app |
| **Bootstrap** | Styling for the admin/instructor dashboard (separate route group to avoid CSS clashes) |
| **FastAPI** | REST API, WebSocket endpoints, auth, validation (Pydantic), background task triggers |
| **PostgreSQL** | Relational, transactional data: users, courses, enrollments, grades, payments |
| **MongoDB** | Flexible documents: lesson content blocks, quiz banks, discussions, activity logs |
| **Redis** | Cache, rate limiting, token blacklist, pub/sub for notifications, job queue broker, leaderboards |
| **Nginx** | Routing, TLS termination, rate limiting, static/media serving, gzip |
| **Docker Compose** | Orchestrates all services for dev and prod |

### Bootstrap + Tailwind coexistence

Both frameworks define overlapping utility and reset styles. To avoid conflicts:
- Use Next.js **route groups**: `(student)` uses Tailwind, `(admin)` uses Bootstrap.
- Import Bootstrap CSS only inside the admin layout.
- Disable Tailwind's `preflight` reset or scope Tailwind with a prefix (`tw-`) if both ever render on the same page.

---

## 5. Folder Structure

```
lms/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── README.md
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/
│   └── app/
│       ├── main.py
│       ├── core/
│       │   ├── config.py          # settings from env
│       │   ├── security.py        # hashing, JWT
│       │   └── deps.py            # auth/role dependencies
│       ├── db/
│       │   ├── postgres.py        # engine, session
│       │   ├── mongo.py           # Motor client
│       │   └── redis.py           # Redis client
│       ├── models/                # SQLAlchemy models
│       ├── schemas/               # Pydantic schemas
│       ├── routers/
│       │   ├── auth.py
│       │   ├── users.py
│       │   ├── courses.py
│       │   ├── lessons.py
│       │   ├── enrollments.py
│       │   ├── quizzes.py
│       │   ├── assignments.py
│       │   ├── discussions.py
│       │   ├── certificates.py
│       │   ├── notifications.py   # WebSocket
│       │   └── admin.py
│       ├── services/              # business logic
│       ├── workers/
│       │   ├── tasks.py           # certificate, email jobs
│       │   └── worker.py
│       └── tests/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── app/
│       │   ├── (student)/
│       │   │   ├── page.tsx               # landing
│       │   │   ├── courses/               # catalog + detail
│       │   │   ├── learn/[courseId]/      # course player
│       │   │   ├── my-courses/
│       │   │   └── certificates/
│       │   ├── (admin)/
│       │   │   ├── layout.tsx             # imports Bootstrap
│       │   │   ├── dashboard/
│       │   │   ├── manage-courses/
│       │   │   └── users/
│       │   └── (auth)/login, register
│       ├── components/
│       ├── lib/                           # API client, auth helpers
│       └── hooks/
└── .github/workflows/ci.yml
```

---

## 6. Database Design

### 6.1 PostgreSQL (relational core)

```sql
users
  id              UUID PK
  email           VARCHAR UNIQUE NOT NULL
  password_hash   VARCHAR NOT NULL
  full_name       VARCHAR NOT NULL
  role            ENUM('student','instructor','admin') NOT NULL
  is_active       BOOLEAN DEFAULT TRUE
  created_at      TIMESTAMPTZ DEFAULT now()

categories
  id              SERIAL PK
  name            VARCHAR UNIQUE NOT NULL
  slug            VARCHAR UNIQUE NOT NULL

courses
  id              UUID PK
  instructor_id   UUID FK -> users.id
  category_id     INT FK -> categories.id
  title           VARCHAR NOT NULL
  slug            VARCHAR UNIQUE NOT NULL
  description     TEXT
  thumbnail_url   VARCHAR
  price           NUMERIC(10,2) DEFAULT 0
  level           ENUM('beginner','intermediate','advanced')
  status          ENUM('draft','pending','published','archived')
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

modules
  id              UUID PK
  course_id       UUID FK -> courses.id ON DELETE CASCADE
  title           VARCHAR NOT NULL
  position        INT NOT NULL

lessons
  id              UUID PK
  module_id       UUID FK -> modules.id ON DELETE CASCADE
  title           VARCHAR NOT NULL
  type            ENUM('video','text','pdf','quiz')
  position        INT NOT NULL
  duration_sec    INT
  content_ref     VARCHAR        -- Mongo document _id for rich content
  is_preview      BOOLEAN DEFAULT FALSE

enrollments
  id              UUID PK
  user_id         UUID FK -> users.id
  course_id       UUID FK -> courses.id
  enrolled_at     TIMESTAMPTZ DEFAULT now()
  completed_at    TIMESTAMPTZ NULL
  UNIQUE (user_id, course_id)

lesson_progress
  id              UUID PK
  enrollment_id   UUID FK -> enrollments.id ON DELETE CASCADE
  lesson_id       UUID FK -> lessons.id
  completed       BOOLEAN DEFAULT FALSE
  completed_at    TIMESTAMPTZ
  UNIQUE (enrollment_id, lesson_id)

quizzes
  id              UUID PK
  lesson_id       UUID FK -> lessons.id
  title           VARCHAR
  pass_percent    INT DEFAULT 60
  time_limit_min  INT NULL
  question_set_id VARCHAR         -- Mongo reference

quiz_attempts
  id              UUID PK
  quiz_id         UUID FK -> quizzes.id
  user_id         UUID FK -> users.id
  score_percent   NUMERIC(5,2)
  passed          BOOLEAN
  answers         JSONB           -- submitted answers snapshot
  submitted_at    TIMESTAMPTZ

assignments
  id              UUID PK
  lesson_id       UUID FK -> lessons.id
  title           VARCHAR
  instructions    TEXT
  max_score       INT DEFAULT 100
  due_at          TIMESTAMPTZ NULL

submissions
  id              UUID PK
  assignment_id   UUID FK -> assignments.id
  user_id         UUID FK -> users.id
  file_url        VARCHAR
  submitted_at    TIMESTAMPTZ
  score           INT NULL
  feedback        TEXT NULL
  graded_by       UUID FK -> users.id NULL
  graded_at       TIMESTAMPTZ NULL

certificates
  id              UUID PK
  enrollment_id   UUID FK -> enrollments.id UNIQUE
  certificate_no  VARCHAR UNIQUE
  file_url        VARCHAR
  issued_at       TIMESTAMPTZ

reviews
  id              UUID PK
  course_id       UUID FK -> courses.id
  user_id         UUID FK -> users.id
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5)
  comment         TEXT
  created_at      TIMESTAMPTZ
  UNIQUE (course_id, user_id)

payments            -- stretch goal
  id              UUID PK
  user_id         UUID FK
  course_id       UUID FK
  amount          NUMERIC(10,2)
  provider        VARCHAR
  provider_ref    VARCHAR
  status          ENUM('pending','paid','failed','refunded')
  created_at      TIMESTAMPTZ
```

**Indexes to add:** `courses(slug)`, `courses(status, category_id)`, `enrollments(user_id)`, `lesson_progress(enrollment_id)`, `quiz_attempts(user_id, quiz_id)`, and a GIN/trigram index on `courses(title)` for search.

### 6.2 MongoDB (flexible documents)

```jsonc
// collection: lesson_contents
{
  "_id": "ObjectId",
  "lesson_id": "uuid-from-postgres",
  "blocks": [
    { "type": "heading", "text": "Intro to Closures" },
    { "type": "paragraph", "text": "..." },
    { "type": "code", "language": "js", "code": "..." },
    { "type": "video", "url": "https://...", "provider": "youtube" },
    { "type": "image", "url": "...", "caption": "..." }
  ],
  "attachments": [{ "name": "slides.pdf", "url": "..." }],
  "updated_at": "ISODate"
}

// collection: question_banks
{
  "_id": "ObjectId",
  "quiz_id": "uuid-from-postgres",
  "questions": [
    {
      "id": "q1",
      "text": "What is a closure?",
      "type": "single_choice",        // single_choice | multi_choice | true_false
      "options": [
        { "id": "a", "text": "..." },
        { "id": "b", "text": "..." }
      ],
      "correct": ["b"],
      "points": 1,
      "explanation": "..."
    }
  ]
}

// collection: discussions
{
  "_id": "ObjectId",
  "course_id": "uuid",
  "lesson_id": "uuid | null",
  "author_id": "uuid",
  "title": "Doubt about hoisting",
  "body": "...",
  "replies": [
    { "id": "...", "author_id": "uuid", "body": "...", "created_at": "ISODate" }
  ],
  "upvotes": 3,
  "created_at": "ISODate"
}

// collection: activity_logs   (add a TTL index, e.g. 90 days)
{
  "_id": "ObjectId",
  "user_id": "uuid",
  "event": "lesson_completed",     // login | enrolled | quiz_submitted | ...
  "meta": { "course_id": "uuid", "lesson_id": "uuid" },
  "ip": "1.2.3.4",
  "ts": "ISODate"
}

// collection: notifications
{
  "_id": "ObjectId",
  "user_id": "uuid",
  "type": "assignment_graded",
  "message": "Your assignment was graded: 85/100",
  "read": false,
  "created_at": "ISODate"
}
```

### 6.3 Redis key design

| Purpose | Key pattern | Type | TTL |
|---|---|---|---|
| Catalog cache | `cache:courses:list:{hash(filters)}` | string (JSON) | 5 min |
| Course detail cache | `cache:course:{slug}` | string (JSON) | 10 min |
| JWT blacklist (logout) | `blacklist:jti:{jti}` | string | token lifetime |
| Refresh tokens | `refresh:{user_id}:{jti}` | string | 7 days |
| Rate limiting | `rl:{ip}:{route}` | counter | 1 min |
| Notifications channel | `notify:{user_id}` | pub/sub | - |
| Online presence | `presence:{course_id}` | set | refreshed |
| Leaderboard | `leaderboard:{course_id}` | sorted set | - |
| Job queue | managed by Celery/RQ | list/stream | - |
| Password reset token | `pwreset:{token}` | string | 15 min |

---

## 7. API Design (FastAPI)

Base path: `/api/v1`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Returns access + refresh token |
| POST | `/auth/refresh` | Rotate tokens |
| POST | `/auth/logout` | Blacklist token |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Complete reset |
| GET | `/users/me` | Current user profile |
| PATCH | `/users/me` | Update profile |

### Courses & Content
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/courses` | public | List with search, filter, pagination |
| GET | `/courses/{slug}` | public | Course detail with outline |
| POST | `/courses` | instructor | Create course |
| PATCH | `/courses/{id}` | owner | Update course |
| POST | `/courses/{id}/submit` | owner | Submit for admin approval |
| POST | `/courses/{id}/modules` | owner | Add module |
| POST | `/modules/{id}/lessons` | owner | Add lesson |
| PUT | `/lessons/{id}/content` | owner | Save content blocks (Mongo) |
| GET | `/lessons/{id}` | enrolled | Lesson content |

### Learning
| Method | Endpoint | Description |
|---|---|---|
| POST | `/courses/{id}/enroll` | Enroll in course |
| GET | `/me/enrollments` | My courses with progress |
| POST | `/lessons/{id}/complete` | Mark lesson complete |
| GET | `/courses/{id}/progress` | Progress details |
| GET | `/quizzes/{id}` | Questions (without answers) |
| POST | `/quizzes/{id}/attempt` | Submit answers, returns score |
| GET | `/assignments/{id}` | Assignment details |
| POST | `/assignments/{id}/submit` | Upload file |
| GET | `/me/certificates` | List certificates |
| GET | `/certificates/{id}/download` | Download PDF |
| GET | `/certificates/verify/{certificate_no}` | Public verification |

### Instructor
| Method | Endpoint | Description |
|---|---|---|
| GET | `/instructor/courses` | My courses with stats |
| GET | `/instructor/courses/{id}/students` | Enrolled students |
| GET | `/instructor/submissions?status=pending` | Grading queue |
| POST | `/submissions/{id}/grade` | Score and feedback |
| GET | `/instructor/courses/{id}/analytics` | Completion, quiz stats |

### Discussions & Reviews
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/courses/{id}/discussions` | List / create thread |
| POST | `/discussions/{id}/replies` | Reply |
| POST | `/courses/{id}/reviews` | Rate a course |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | List/search users |
| PATCH | `/admin/users/{id}` | Activate, deactivate, change role |
| GET | `/admin/courses?status=pending` | Approval queue |
| POST | `/admin/courses/{id}/approve` | Publish |
| POST | `/admin/courses/{id}/reject` | Reject with reason |
| GET | `/admin/stats` | Platform analytics |

### Real-time
| Protocol | Endpoint | Description |
|---|---|---|
| WebSocket | `/ws/notifications` | Per-user notification stream (auth via token) |

---

## 8. Key Flows

### 8.1 Authentication
1. Login verifies password hash (bcrypt/argon2) and issues a 15-minute access token and 7-day refresh token.
2. Refresh tokens are stored in Redis; each refresh rotates the token.
3. Logout adds the access token's `jti` to the Redis blacklist until it expires.
4. A FastAPI dependency (`require_role("instructor")`) enforces role access.

### 8.2 Enrollment and progress
1. Student enrolls: insert into `enrollments` (unique constraint prevents duplicates).
2. Marking a lesson complete upserts `lesson_progress`.
3. Progress % = completed lessons ÷ total lessons; cache in Redis and invalidate on change.
4. When progress reaches 100% and required quizzes are passed, set `completed_at` and enqueue the certificate job.

### 8.3 Quiz auto-grading
1. Client fetches questions, with correct answers stripped on the server.
2. On submit, the server loads the full bank from MongoDB, compares answers, and computes the score.
3. Store the attempt in Postgres, return the score and explanations, and log the event in MongoDB.

### 8.4 Certificate generation (background)
1. The API enqueues `generate_certificate(enrollment_id)`.
2. The worker renders a PDF (ReportLab or WeasyPrint) with a unique certificate number and QR code linking to the verify endpoint.
3. It saves the file, inserts the `certificates` row, creates a notification, and publishes to Redis `notify:{user_id}`.

### 8.5 Real-time notifications
1. The client opens `/ws/notifications` with its token.
2. The API subscribes the socket to the Redis channel `notify:{user_id}`.
3. Any service (API or worker) publishes events; connected clients receive them instantly, and they are persisted in MongoDB for the bell-icon history.

---

## 9. Frontend Plan

### Student app (Tailwind)
| Route | Purpose |
|---|---|
| `/` | Landing, featured courses |
| `/courses` | Catalog with search and filters (SSR) |
| `/courses/[slug]` | Course detail, curriculum, reviews (ISR) |
| `/learn/[courseId]` | Course player: sidebar outline, content area, progress bar |
| `/learn/[courseId]/quiz/[id]` | Quiz UI with timer |
| `/my-courses` | Enrolled courses and progress |
| `/certificates` | Downloadable certificates |
| `/profile` | Account settings |

### Instructor/Admin app (Bootstrap)
| Route | Purpose |
|---|---|
| `/dashboard` | KPIs and charts |
| `/manage-courses` | Course list, editor with module/lesson builder |
| `/manage-courses/[id]/grading` | Submission queue |
| `/users` | Admin user management |
| `/approvals` | Pending course approvals |

### Frontend notes
- Use **TanStack Query** (or SWR) for data fetching and caching.
- Keep the access token in memory and the refresh token in an httpOnly cookie.
- Use Next.js **middleware** for route protection by role.
- Charts: Recharts or Chart.js.
- Rich text editor for lessons: TipTap or Editor.js (maps naturally to the Mongo `blocks` model).

---

## 10. Docker and Infrastructure

### docker-compose.yml (starter)

```yaml
services:
  nginx:
    build: ./nginx
    ports:
      - "80:80"
    depends_on: [frontend, api]

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=/api/v1
    depends_on: [api]

  api:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    env_file: .env
    volumes:
      - ./backend:/code
      - media:/media
    depends_on:
      postgres:
        condition: service_healthy
      mongo:
        condition: service_started
      redis:
        condition: service_started

  worker:
    build: ./backend
    command: celery -A app.workers.worker worker --loglevel=info
    env_file: .env
    volumes:
      - media:/media
    depends_on: [redis, postgres, mongo]

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: lms
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: lms
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lms"]
      interval: 5s
      retries: 10

  mongo:
    image: mongo:7
    volumes:
      - mongodata:/data/db

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  mongodata:
  redisdata:
  media:
```

### nginx.conf (starter)

```nginx
upstream frontend { server frontend:3000; }
upstream api      { server api:8000; }
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;

server {
    listen 80;
    client_max_body_size 50M;

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        limit_req zone=api_limit burst=40 nodelay;
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /ws/ {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /media/ {
        alias /media/;
        expires 7d;
    }
}
```

### .env.example

```
POSTGRES_PASSWORD=change_me
DATABASE_URL=postgresql+asyncpg://lms:change_me@postgres:5432/lms
MONGO_URL=mongodb://mongo:27017/lms
REDIS_URL=redis://redis:6379/0
JWT_SECRET=change_me_long_random_string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_MINUTES=15
REFRESH_TOKEN_DAYS=7
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
MEDIA_ROOT=/media
```

---

## 11. Recommended Libraries

**Backend:** FastAPI, Uvicorn, SQLAlchemy 2.x (async), Alembic, asyncpg, Motor or Beanie, redis-py, Celery or RQ, python-jose or PyJWT, passlib (argon2/bcrypt), Pydantic v2, ReportLab or WeasyPrint, pytest, httpx

**Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Bootstrap 5, TanStack Query, React Hook Form + Zod, Recharts, TipTap

---

## 12. Security Checklist

- Hash passwords with argon2 or bcrypt; never store plaintext.
- Short-lived access tokens, rotated refresh tokens, blacklist on logout.
- Enforce authorization on every endpoint (role and ownership checks).
- Validate all input with Pydantic; validate file type and size on uploads.
- Never send quiz answers to the client before submission.
- Rate-limit login, register, and password-reset routes (Nginx and Redis).
- Configure CORS strictly; use httpOnly, secure, SameSite cookies.
- Keep secrets in environment variables, never in git.
- Use parameterized queries (the ORM handles this); sanitize rendered lesson HTML.
- Add HTTPS (Let's Encrypt/Certbot) in production.

---

## 13. Testing Strategy

| Level | Tool | Focus |
|---|---|---|
| Unit | pytest | Services: progress calculation, grading logic |
| API | pytest + httpx + test containers | Auth, enrollment, role restrictions |
| Frontend | Jest/Vitest + React Testing Library | Components, forms |
| E2E | Playwright | Register, enroll, complete lesson, take quiz, certificate |
| Load | Locust or k6 | Catalog and lesson endpoints with and without Redis cache |

CI (GitHub Actions): lint, run tests with Postgres/Mongo/Redis service containers, build Docker images.

---

## 14. Build Roadmap

| Phase | Weeks | Deliverables |
|---|---|---|
| **1. Foundation** | 1 | Repo, Docker Compose, Nginx routing, FastAPI skeleton, DB connections, Alembic setup, health endpoint |
| **2. Auth and users** | 1 | Register/login/refresh/logout, roles, Next.js auth pages, protected routes |
| **3. Courses** | 1-2 | Course/module/lesson CRUD, instructor builder UI, catalog and detail pages, Redis caching |
| **4. Learning** | 1-2 | Enrollment, course player, lesson content from MongoDB, progress tracking |
| **5. Assessment** | 1-2 | Quizzes with auto-grading, assignment upload and grading queue |
| **6. Async and real-time** | 1 | Worker, certificate PDFs, emails, WebSocket notifications |
| **7. Admin and analytics** | 1 | Bootstrap admin dashboard, approvals, charts |
| **8. Polish and deploy** | 1-2 | Reviews, discussions, payments (optional), CI/CD, production compose, HTTPS |

Total: roughly 8-12 weeks part-time.

---

## 15. Milestone Checklist

- [ ] `docker compose up` brings up all 7 services
- [ ] Nginx routes `/` to Next.js and `/api` to FastAPI
- [ ] Users can register, log in, and see role-appropriate pages
- [ ] Instructor can build and submit a course; admin can approve it
- [ ] Student can enroll, complete lessons, and see progress
- [ ] Quizzes auto-grade and attempts are stored
- [ ] Assignments can be submitted and graded
- [ ] Certificate PDF is generated by the worker on completion
- [ ] Notifications arrive in real time over WebSocket
- [ ] Catalog and course detail are cached in Redis (verify with timing)
- [ ] CI pipeline is green
- [ ] Production compose file with HTTPS is working

---

## 16. Portfolio Tips

- Include an architecture diagram and this document's schema in your README.
- Record a short demo video (student flow, instructor flow, real-time notification).
- Document one or two design decisions, such as why Mongo for content and why Postgres for grades.
- Add before/after load-test numbers showing the Redis caching improvement.
- Seed the database with realistic sample data so the demo looks alive.
