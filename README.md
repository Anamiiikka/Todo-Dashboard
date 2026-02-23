## RoundTechSquare – Todo Dashboard (Frontend Assignment)

This is a **Todo Dashboard** built for the RoundTechSquare frontend internship assignment using:

- **Next.js (App Router)**
- **TypeScript**
- **TanStack Query (@tanstack/react-query)**
- Public API: `https://jsonplaceholder.typicode.com/todos`

The app demonstrates:

- **Paginated fetching** of todos with TanStack Query
- **Client-side pagination controls** (Previous / Next, current page)
- **Filter chips** (All / Open / Completed)
- **Local completion toggles** with optimistic-style updates
- **Add new todo** locally on the current page (no backend persistence)
- **Offline-aware error handling** with retry
- **Skeleton loading state** and inline form validation
- A clean, responsive, dark dashboard-style UI

---

## Features

- **Todo dashboard UI**
  - Card-based layout with toolbar, filter pills, list, and pagination.
  - Responsive styling in `globals.css`.

- **Pagination**
  - Page size: **10** items (`PAGE_SIZE = 10`).
  - Total items: **200** (`TOTAL_ITEMS = 200`) to match jsonplaceholder.
  - Derived page count: `TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / PAGE_SIZE)`.
  - Previous/Next buttons with disabled states on first/last page.

- **Filtering**
  - `All` – shows all todos on the current page.
  - `Open` – shows only `completed === false`.
  - `Completed` – shows only `completed === true`.

- **Local state overrides**
  - `localTodosByPage: Record<number, Todo[]>` holds per-page overrides.
  - If local data exists for a page, it is rendered instead of the remote list.
  - Toggling completion and adding todos never hit the API; they are kept in memory.

- **Error handling & offline awareness**
  - API errors surface in a dedicated error state block with:
    - User-friendly message.
    - Exact error text (where available).
    - **Retry** button that calls React Query’s `refetch`.
  - Listens to `online` / `offline` events:
    - When offline, shows “You appear to be offline…” guidance.

- **Loading UX**
  - Shimmering loading bar.
  - **Skeleton list** of placeholder rows while fetching.

- **Form validation**
  - Inline validation message when the user submits an empty title.
  - Error text styled via `.input-error` in `globals.css`.

---

## Project Structure (Core Files)

- `app/layout.tsx`
  - Root layout for the App Router.
  - Imports global styles and wraps children with `AppProviders`.

- `app/providers.tsx`
  - **Client component** that creates a configured `QueryClient`:
    - `staleTime: 30_000`
    - `retry: 1`
    - `refetchOnWindowFocus: false`
  - Wraps the app with:
    - `QueryClientProvider`
    - `ReactQueryDevtools`

- `app/page.tsx`
  - **Main Todo Dashboard**.
  - Uses `useQuery` for per-page data fetching.
  - Manages filter, pagination, todo toggle, and add-todo logic.
  - Implements offline-aware error state and retry button.

- `app/globals.css`
  - Global styling, including:
    - App shell, cards, toolbar, chips, list rows, pagination.
    - Loading bar and skeleton rows.
    - Form styles, input focus, inline error, and retry button.

---

## Setup & Running Locally

### 1. Prerequisites

- **Node.js** 18+ (recommended)  
- **npm** (comes with Node) or another package manager like **yarn** / **pnpm**

### 2. Clone the project

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### 5. Build for production (optional)

```bash
npm run build
npm start
```

---

## Data Fetching & TanStack Query

- Query key format: **`["todos", page]`**
- Fetch function:
  - Calls: `https://jsonplaceholder.typicode.com/todos?_page=<page>&_limit=10`
  - Throws on non-2xx responses so React Query can enter the error state.
- React Query configuration (in `providers.tsx`):
  - `staleTime: 30_000` – reduces unnecessary refetches when switching pages quickly.
  - `retry: 1` – retries once for transient errors, then shows the error UI.
  - `refetchOnWindowFocus: false` – avoids surprise refetches when tab gains focus.
- Loading & error states:
  - **Loading**: shimmer bar + skeleton rows.
  - **Error**: offline-aware message, network error details, and a **Retry** button.

---

## Local State: Toggle & Add Todo

All mutation-like behaviour is **local only** to keep the assignment simple and focus on UI/UX and data fetching.

- `localTodosByPage: Record<number, Todo[]>`
  - Stores local overrides per page.
  - If there is a local array for the current page, it is rendered instead of the remote array.

- **Toggle completed**
  - Clicking the circular checkbox updates `completed` in the local page array.
  - Behaves like an optimistic update: instant UI feedback, no API call.

- **Add new todo**
  - Top-of-card form adds a synthetic todo object:
    - `id` uses `Date.now()` (unique per session).
    - `userId` is set to `0` to distinguish synthetic items.
  - New todo is prepended to the current page’s list.
  - Never sent to the server; it lives only in local state.


- **GitHub repository URL**
- **Live deployment URL**

---



