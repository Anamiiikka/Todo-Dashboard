"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

const PAGE_SIZE = 10;
const TOTAL_ITEMS = 200;
const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / PAGE_SIZE);

async function fetchTodos(page: number): Promise<Todo[]> {
  const params = new URLSearchParams({
    _page: String(page),
    _limit: String(PAGE_SIZE)
  });

  const res = await fetch(
    `https://jsonplaceholder.typicode.com/todos?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch todos");
  }

  return res.json();
}

export default function TodoDashboardPage() {
  const [page, setPage] = useState(1);
  const [localTodosByPage, setLocalTodosByPage] = useState<
    Record<number, Todo[]>
  >({});
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");
  const [newTitle, setNewTitle] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["todos", page],
    queryFn: () => fetchTodos(page),
    staleTime: 30_000
  });

  const pageTodos = useMemo(() => {
    const remote = data ?? [];
    const localOverride = localTodosByPage[page];
    const merged = localOverride ?? remote;

    if (filter === "completed") {
      return merged.filter((t) => t.completed);
    }
    if (filter === "open") {
      return merged.filter((t) => !t.completed);
    }
    return merged;
  }, [data, localTodosByPage, page, filter]);

  const effectiveTotalForPage = useMemo(() => {
    const local = localTodosByPage[page];
    return local?.length ?? data?.length ?? 0;
  }, [localTodosByPage, page, data]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      setIsOffline(!navigator.onLine);
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  function handleToggle(id: number) {
    setLocalTodosByPage((prev) => {
      const current = prev[page] ?? data ?? [];
      const updated = current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      return { ...prev, [page]: updated };
    });
  }

  function handleAddTodo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      setInputError("Title cannot be empty");
      return;
    }

    setInputError(null);

    setIsAdding(true);

    setLocalTodosByPage((prev) => {
      const base = prev[page] ?? data ?? [];
      const synthetic: Todo = {
        userId: 0,
        id: Date.now(),
        title,
        completed: false
      };
      return { ...prev, [page]: [synthetic, ...base] };
    });

    setNewTitle("");
    setTimeout(() => setIsAdding(false), 220);
  }

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > TOTAL_PAGES) return;
    setPage(nextPage);
  }

  return (
    <div className="app-shell">
      <main className="card" aria-label="Todo dashboard">
        <header className="card-header">
          <div className="card-title-row">
            <h1 className="title">Todo Dashboard</h1>
            <span className="badge">RoundTechSquare Assignment</span>
          </div>
          <p className="subtitle">
            Paginated todos from jsonplaceholder with local completion toggles
            and inline creation. Built with Next.js App Router &amp; TanStack
            Query.
          </p>
        </header>

        <section className="card-main">
          <div className="toolbar">
            <div className="toolbar-left">
              <span className="status-dot" aria-hidden="true" />
              <span>
                Page <strong>{page}</strong> of <strong>{TOTAL_PAGES}</strong>
              </span>
            </div>
            <div className="filter-pill-group" role="tablist">
              <button
                type="button"
                className={`filter-pill ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-pill ${filter === "open" ? "active" : ""}`}
                onClick={() => setFilter("open")}
              >
                Open
              </button>
              <button
                type="button"
                className={`filter-pill ${
                  filter === "completed" ? "active" : ""
                }`}
                onClick={() => setFilter("completed")}
              >
                Completed
              </button>
            </div>
          </div>

          <form className="add-form" onSubmit={handleAddTodo}>
            <div style={{ flex: 1 }}>
              <input
                className="add-input"
                placeholder="Add a todo for this page…"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (inputError && e.target.value.trim()) {
                    setInputError(null);
                  }
                }}
                aria-label="New todo title"
              />
              <p className="add-hint">
                New todos are kept only in the browser and are not sent to the
                API.
              </p>
              {inputError && <p className="input-error">{inputError}</p>}
            </div>
            <button
              type="submit"
              className="add-button"
              disabled={!newTitle.trim() || isAdding}
            >
              <span>+ Add Todo</span>
            </button>
          </form>

          <section className="list-card" aria-live="polite">
            <header className="list-header">
              <span>
                Showing <strong>{pageTodos.length}</strong> of{" "}
                <strong>{effectiveTotalForPage}</strong> records
              </span>
              <span>{isFetching ? "Syncing…" : "Up to date"}</span>
            </header>

            {isLoading ? (
              <div className="loading-state">
                Loading todos…
                <div className="loading-bar">
                  <div className="loading-bar-inner" />
                </div>
                <ul className="loading-skeleton-list">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <li key={index} className="loading-skeleton-row">
                      <div className="loading-skeleton-checkbox" />
                      <div className="loading-skeleton-text">
                        <div className="loading-skeleton-line primary" />
                        <div className="loading-skeleton-line secondary" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : isError ? (
              <div className="error-state">
                <p>
                  {isOffline
                    ? "You appear to be offline. Check your internet connection and try again."
                    : "Could not load todos."}
                </p>
                <p style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                  {(error as Error)?.message ?? "Unknown error"}
                </p>
                <button
                  type="button"
                  className="retry-button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  Retry
                </button>
              </div>
            ) : pageTodos.length === 0 ? (
              <div className="empty-state">
                No todos match this filter on this page.
              </div>
            ) : (
              <ul className="list">
                {pageTodos.map((todo) => {
                  const isCompleted = todo.completed;
                  return (
                    <li key={todo.id} className="todo-row">
                      <button
                        type="button"
                        aria-pressed={isCompleted}
                        onClick={() => handleToggle(todo.id)}
                        className={`todo-checkbox ${
                          isCompleted ? "completed" : ""
                        }`}
                      >
                        <span className="todo-checkbox-inner" />
                      </button>
                      <div className="todo-main">
                        <span
                          className={`todo-title ${
                            isCompleted ? "completed" : ""
                          }`}
                        >
                          {todo.title}
                        </span>
                        <span className="todo-meta">
                          Source id #{todo.id} · user {todo.userId}
                        </span>
                      </div>
                      <span
                        className={`todo-chip ${
                          isCompleted ? "completed" : "open"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Open"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <footer className="pagination-row">
            <div className="pagination-controls">
              <button
                type="button"
                className="page-button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1 || isLoading}
              >
                ← Prev
              </button>
              <span className="page-indicator">
                Page <strong>{page}</strong> / {TOTAL_PAGES}
              </span>
              <button
                type="button"
                className="page-button"
                onClick={() => goToPage(page + 1)}
                disabled={page === TOTAL_PAGES || isLoading}
              >
                Next →
              </button>
            </div>
            <div>Page size: {PAGE_SIZE}</div>
          </footer>
          <p className="footnote">
            Data from `jsonplaceholder.typicode.com/todos` using TanStack Query
            with per-page query keys.
          </p>
        </section>
      </main>
    </div>
  );
}

