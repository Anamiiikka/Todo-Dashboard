# RoundTechSquare – Todo Dashboard (Frontend Assignment)

This is a **Todo Dashboard** built for the RoundTechSquare frontend internship assignment using:

- **Next.js (App Router)**
- **TanStack Query (@tanstack/react-query)**
- Public API: `https://jsonplaceholder.typicode.com/todos`

The app demonstrates:

- Paginated fetching of todos with **TanStack Query**
- **Client-side pagination controls** (Previous / Next, current page)
- **Toggle completed state** (local / optimistic style)
- **Add new todo** locally into the current page (no backend persistence)
- Clean, responsive layout with a clear component and state structure

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Implementation Details

### Tech & Structure

- `app/layout.tsx`
  - Root layout for the App Router.
  - Wraps children with global styles and `AppProviders`.

- `app/providers.tsx`
  - **Client component** that creates a `QueryClient` and wraps the app with:
    - `QueryClientProvider`
    - `ReactQueryDevtools`

- `app/page.tsx`
  - **Main Todo Dashboard** UI.
  - Uses `useQuery` from TanStack Query to fetch todos.
  - Implements pagination, filtering, toggle, and add-todo logic.

- `app/globals.css`
  - Global styling for layout, cards, list items, buttons, etc.
  - Responsive, with a dashboard-style design.

---

## Data Fetching & TanStack Query

- Query key format: **`["todos", page]`**
- Fetch function:
  - Calls `https://jsonplaceholder.typicode.com/todos?_page=<page>&_limit=10`
  - Throws on non-2xx responses for proper error handling.
- Loading & error states:
  - **Loading**: animated shimmer bar and message.
  - **Error**: human-readable message plus the error text.
- `staleTime` set so page data is cached briefly while navigating.

---

## Pagination Logic

- **Page size**: `PAGE_SIZE = 10`
- **Total todos**: `TOTAL_ITEMS = 200` (jsonplaceholder fixed size)
- **Total pages**: computed from `TOTAL_ITEMS / PAGE_SIZE`
- Every page uses its own query:
  - `useQuery({ queryKey: ["todos", page], queryFn: () => fetchTodos(page) })`
- Pagination controls:
  - “Prev” / “Next” buttons
  - Current page indicator: `Page X / Y`
  - Buttons are disabled on the first / last page during loading.

---

## Local State: Toggle & Add Todo

All mutation-like behaviour is **local only** to keep the assignment simple but realistic.

- `localTodosByPage: Record<number, Todo[]>`
  - Keeps per-page overrides of todos.
  - If we have a local copy for the current page, we render that instead of the remote list.

- **Toggle completed**
  - Clicking the custom checkbox updates the `completed` flag in `localTodosByPage` for the current page.
  - This behaves like an **optimistic update** (instant UI feedback, no network call).

- **Add new todo**
  - Form at the top of the dashboard.
  - Creates a synthetic todo with `Date.now()` as id.
  - Prepends it to the current page’s array in `localTodosByPage`.
  - Note: the new item is **not sent** to the API; it is stored only in memory.

Filtering options:

- `All` — show all todos for the current page.
- `Open` — only todos where `completed === false`.
- `Completed` — only todos where `completed === true`.

---

## Deployment Notes

You can deploy this app to any Next.js-compatible host. Two common options:

1. **Vercel**
   - Push this repo to GitHub.
   - Import the repository on Vercel.
   - Use default build settings (`npm run build`, `next start`).

2. **Netlify (Next adapter)**
   - Use Netlify’s Next.js support with a similar setup.

Once deployed, submit:

- **GitHub repo link**
- **Live deployment URL**

---

## How to Explain This in an Interview

Key points you can mention:

- **Query design**: why `["todos", page]` is a good key for paginated data.
- **Caching behavior**: how TanStack Query caches each page separately.
- **Local state vs. server state**: todos from the API are server state; toggles and new items live in local React state to keep the task simple.
- **Pagination correctness**: changing page updates the query key, which triggers the correct API call.
- **UI / UX choices**: clear separation of layout, toolbar, add form, list, and pagination for maintainability and readability.

