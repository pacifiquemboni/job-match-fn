# JobMatch — Frontend

React single-page application for the **JobMatch** platform. Workers can find and apply for jobs; clients can post jobs, manage applications, and chat in real time.

> **Live app:** [https://job-match-fn.vercel.app](https://job-match-fn.vercel.app)  
> **Deployed on:** Vercel

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 (amber color theme) |
| Routing | React Router v6 |
| HTTP | Axios |
| Real-time | Socket.IO Client 4 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Toasts | React Hot Toast |

---

## Project Structure

```
job-matching-frontend/
├── public/
├── src/
│   ├── App.tsx                  # Root router, conditional Navbar
│   ├── main.tsx
│   ├── index.css
│   ├── components/
│   │   ├── applications/        # Application status cards
│   │   ├── auth/                # Auth guard
│   │   ├── common/              # Navbar, LoadingSpinner, NotificationDropdown
│   │   ├── dashboard/           # Dashboard sub-components
│   │   ├── jobs/                # JobList, JobCard, JobFilters
│   │   └── messages/            # ChatRoom
│   ├── context/
│   │   ├── AuthContext.tsx      # User session (JWT stored in localStorage)
│   │   ├── NotificationContext.tsx
│   │   └── SocketContext.tsx    # Socket.IO connection lifecycle
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   └── useSocket.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx        # Main app shell (CLIENT + WORKER)
│   │   ├── Jobs.tsx             # Public job browse with filters
│   │   ├── JobDetails.tsx
│   │   ├── Messages.tsx
│   │   ├── MyApplications.tsx
│   │   ├── Profile.tsx
│   │   └── Home.tsx
│   ├── services/
│   │   ├── api.ts               # Axios instance (reads VITE_API_URL)
│   │   ├── auth.ts
│   │   ├── jobs.ts
│   │   ├── applications.ts
│   │   ├── messages.ts
│   │   └── notifications.ts
│   ├── types/
│   └── utils/
├── index.html
├── tailwind.config.js
├── vite.config.ts
├── vercel.json                  # SPA rewrite rule
└── tsconfig.json
```

---

## Pages & Roles

| Page | Route | Access |
|---|---|---|
| Home | `/` | Public |
| Browse Jobs | `/jobs` | Public |
| Job Details | `/jobs/:id` | Public |
| Login | `/login` | Guest only |
| Register | `/register` | Guest only |
| Dashboard | `/dashboard` | Authenticated |
| Messages | `/messages` | Authenticated |
| My Applications | `/applications` | WORKER |
| Profile | `/profile` | Authenticated |

### Dashboard — CLIENT
- Overview with job stats
- **Jobs & Applications** tab — paginated table of posted jobs (10/page), view applicants, update status
- Post new job modal
- Inline messages modal
- Profile & settings panel

### Dashboard — WORKER
- Overview with application stats
- **My Applications** — paginated card grid (6/page), status timeline, message button
- Find Jobs — navigates to `/jobs`
- Inline messages modal

---

## Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

For local development:

```env
VITE_API_URL=http://localhost:3010/api
VITE_SOCKET_URL=http://localhost:3010
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- Backend API running (see [job-matching-bn](../job-matching-bn/README.md))

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up .env (see above)

# 3. Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Deployment (Vercel)

1. Connect your GitHub repo to a new Vercel project.
2. Set **Framework Preset** to `Vite`.
3. Add environment variables in the Vercel dashboard:
   - `VITE_API_URL`
   - `VITE_SOCKET_URL`
4. The included `vercel.json` handles SPA client-side routing (all routes rewrite to `index.html`):
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
5. Vercel auto-deploys on every push to `main`.

---

## Key Design Decisions

- **Amber color theme** — Tailwind `primary` palette mapped to amber throughout the app.
- **No navbar on auth pages** — Login and Register render without the Navbar component for a clean centered layout.
- **Dashboard is self-contained** — All modals (messages, profile, applications) are rendered inline within `Dashboard.tsx` to avoid layout shifts.
- **Socket scoped per application room** — Each chat conversation joins a socket room keyed by `applicationId`.
- **Debounced filters** — Job search filters use a 500ms debounce to avoid excessive API requests.
