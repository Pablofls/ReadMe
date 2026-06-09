import { useState } from "react";
import { Plus, Library as LibraryIcon } from "lucide-react";
import { useBooks } from "../hooks/useBooks";
import { useAllSessions } from "../hooks/useSessions";
import { BookCard } from "../components/BookCard";
import { AddBookForm } from "../components/AddBookForm";
import { Spinner } from "../components/ui/Spinner";
import { progressPercent, lastPageByBook } from "../lib/pages";
import type { BookStatus } from "../lib/types";

const TABS: { value: BookStatus; label: string }[] = [
  { value: "reading", label: "Leyendo" },
  { value: "want_to_read", label: "Quiero leer" },
  { value: "finished", label: "Terminados" },
];

export default function Library() {
  const { data: books, isLoading, isError } = useBooks();
  const { data: sessions } = useAllSessions();
  const [tab, setTab] = useState<BookStatus>("reading");
  const [adding, setAdding] = useState(false);

  const pagesByBook = lastPageByBook(sessions ?? []);

  const filtered = (books ?? []).filter((b) => b.status === tab);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-black text-ink">Biblioteca</h1>
        <button onClick={() => setAdding(true)} className="btn-grass !px-4 !py-2.5">
          <Plus className="h-5 w-5" /> Libro
        </button>
      </header>

      {/* Pestañas */}
      <div className="flex gap-2 rounded-2xl bg-line/60 p-1">
        {TABS.map((t) => {
          const count = (books ?? []).filter((b) => b.status === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 rounded-xl px-2 py-2 text-sm font-extrabold transition-colors ${
                tab === t.value
                  ? "bg-white text-ink shadow-card"
                  : "text-gray-500"
              }`}
            >
              {t.label}
              {count > 0 && (
                <span className="ml-1 text-xs text-gray-400">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <p className="card p-5 text-center font-bold text-red-500">
          Error al cargar la biblioteca. Revisa tu conexión e intenta de nuevo.
        </p>
      ) : filtered.length === 0 ? (
        <EmptyShelf onAdd={() => setAdding(true)} />
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              progress={progressPercent(
                book,
                pagesByBook.get(book.id) ?? book.start_page - 1
              )}
            />
          ))}
        </div>
      )}

      {adding && <AddBookForm onClose={() => setAdding(false)} />}
    </div>
  );
}

function EmptyShelf({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="card mt-4 flex flex-col items-center gap-3 p-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cloud">
        <LibraryIcon className="h-8 w-8 text-gray-300" />
      </div>
      <p className="font-bold text-gray-500">Este estante está vacío.</p>
      <button onClick={onAdd} className="btn-sky">
        <Plus className="h-4 w-4" /> Agregar libro
      </button>
    </div>
  );
}
