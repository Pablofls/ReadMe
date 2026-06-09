import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useAddBook } from "../hooks/useBooks";
import type { BookStatus } from "../lib/types";

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "reading", label: "Leyendo" },
  { value: "want_to_read", label: "Quiero leer" },
  { value: "finished", label: "Terminado" },
];

export function AddBookForm({ onClose }: { onClose: () => void }) {
  const addBook = useAddBook();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("");
  const [status, setStatus] = useState<BookStatus>("want_to_read");
  const [error, setError] = useState<string | null>(null);

  const needsPages = status === "reading" || status === "finished";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Ponle un título al libro.");

    let sp = 1;
    let ep = 1;

    if (needsPages) {
      sp = parseInt(startPage, 10);
      ep = parseInt(endPage, 10);
      if (!Number.isInteger(sp) || sp < 1)
        return setError("La página de inicio debe ser 1 o mayor.");
      if (!Number.isInteger(ep) || ep < sp)
        return setError("La página final debe ser mayor o igual a la de inicio.");
    }

    try {
      await addBook.mutateAsync({
        title: title.trim(),
        author: author.trim() || null,
        cover_url: coverUrl.trim() || null,
        start_page: sp,
        end_page: ep,
        status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-ink">Agregar libro</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-cloud"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Título *">
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="El nombre del libro"
              autoFocus
            />
          </Field>

          <Field label="Autor">
            <input
              className="input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Quién lo escribió"
            />
          </Field>

          <Field label="URL de portada (opcional)">
            <input
              className="input"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://…/portada.jpg"
            />
          </Field>

          <Field label="Estado">
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`rounded-2xl border-2 px-2 py-2.5 text-xs font-extrabold transition-colors ${
                    status === opt.value
                      ? "border-grass bg-grass/10 text-grass-dark"
                      : "border-line bg-white text-gray-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Páginas: solo cuando está leyendo o terminado */}
          {needsPages && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Página de inicio">
                  <input
                    className="input"
                    type="number"
                    inputMode="numeric"
                    value={startPage}
                    onChange={(e) => setStartPage(e.target.value)}
                    placeholder="1"
                  />
                </Field>
                <Field label="Página final">
                  <input
                    className="input"
                    type="number"
                    inputMode="numeric"
                    value={endPage}
                    onChange={(e) => setEndPage(e.target.value)}
                    placeholder="ej. 304"
                  />
                </Field>
              </div>
              <p className="-mt-1 text-xs font-medium text-gray-400">
                Usa las páginas donde realmente empieza y termina el contenido.
              </p>
            </>
          )}

          {error && <p className="text-sm font-bold text-red-500">{error}</p>}

          <button
            type="submit"
            className="btn-grass mt-1 w-full"
            disabled={addBook.isPending}
          >
            {addBook.isPending ? "Guardando…" : "Guardar libro"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-extrabold text-gray-600">
        {label}
      </span>
      {children}
    </label>
  );
}
