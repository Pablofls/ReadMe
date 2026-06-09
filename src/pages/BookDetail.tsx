import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Star,
  Trash2,
  Play,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { useBook, useUpdateBook, useDeleteBook } from "../hooks/useBooks";
import { useBookSessions } from "../hooks/useSessions";
import { Spinner } from "../components/ui/Spinner";
import { ProgressRing } from "../components/ui/ProgressRing";
import { currentPage, progressFraction, progressPercent } from "../lib/pages";
import { REFLECTION_QUESTIONS } from "../lib/reflectionQuestions";

const QUESTION_LABEL = Object.fromEntries(
  REFLECTION_QUESTIONS.map((q) => [q.id, q.prompt])
);

export default function BookDetail() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: book, isLoading } = useBook(bookId);
  const { data: sessions } = useBookSessions(bookId);
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();
  const [finishing, setFinishing] = useState(false);
  const [startingRead, setStartingRead] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (params.get("finish") === "1") setFinishing(true);
  }, [params]);

  if (isLoading) return <Spinner />;
  if (!book) {
    return (
      <div className="card mt-8 p-8 text-center">
        <p className="font-bold text-gray-500">Libro no encontrado.</p>
        <Link to="/biblioteca" className="btn-sky mt-4">
          Volver a la biblioteca
        </Link>
      </div>
    );
  }

  const lastEnd = sessions?.[0]?.end_page;
  const pos = currentPage(book, lastEnd);
  const pct = progressPercent(book, pos);

  const startReading = (startPage: number, endPage: number) =>
    updateBook.mutate({
      id: book.id,
      patch: {
        status: "reading",
        started_at: new Date().toISOString(),
        start_page: startPage,
        end_page: endPage,
      },
    });

  const handleDelete = () => {
    deleteBook.mutate(book.id, { onSuccess: () => navigate("/biblioteca") });
  };

  return (
    <div className="flex flex-col gap-5 pt-2">
      <button
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-1 font-bold text-gray-500"
      >
        <ArrowLeft className="h-5 w-5" /> Volver
      </button>

      {/* Cabecera */}
      <header className="flex gap-4">
        <div className="h-36 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 border-line">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky to-grass">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="text-xl font-black leading-tight text-ink">
            {book.title}
          </h1>
          {book.author && (
            <p className="font-medium text-gray-400">{book.author}</p>
          )}
          {book.status !== "want_to_read" || book.end_page > 1 ? (
            <p className="mt-1 text-sm font-medium text-gray-400">
              Páginas {book.start_page}–{book.end_page}
            </p>
          ) : null}
          {book.status === "finished" && book.rating != null && (
            <div className="mt-auto flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5"
                  fill={i < book.rating! ? "#ffc800" : "none"}
                  stroke={i < book.rating! ? "#ffc800" : "#cbcbcb"}
                />
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Progreso / acciones según estado */}
      {book.status === "reading" && (
        <section className="card flex items-center gap-5 p-5">
          <ProgressRing fraction={progressFraction(book, pos)} size={92} stroke={10}>
            <span className="text-xl font-black text-ink">{pct}%</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="font-extrabold text-ink">
              Página {pos} de {book.end_page}
            </p>
            <p className="text-sm font-medium text-gray-400">
              {sessions?.length ?? 0} sesión
              {(sessions?.length ?? 0) === 1 ? "" : "es"} de lectura
            </p>
            <Link to={`/registrar/${book.id}`} className="btn-grass mt-3 w-full">
              <Plus className="h-4 w-4" /> Registrar
            </Link>
          </div>
        </section>
      )}

      {book.status === "want_to_read" && (
        <button onClick={() => setStartingRead(true)} className="btn-sky w-full">
          <Play className="h-5 w-5" /> Empezar a leer
        </button>
      )}

      {book.status === "reading" && (
        <button onClick={() => setFinishing(true)} className="btn-flame w-full">
          <CheckCircle2 className="h-5 w-5" /> Terminar libro
        </button>
      )}

      {/* Reseña (libro terminado) */}
      {book.status === "finished" && book.review && (
        <section className="card p-5">
          <h2 className="mb-1 text-lg font-extrabold text-ink">Tu reseña</h2>
          <p className="whitespace-pre-wrap font-medium text-gray-600">
            {book.review}
          </p>
        </section>
      )}

      {/* Historial de sesiones */}
      <section>
        <h2 className="mb-2 text-lg font-extrabold text-ink">
          Historial de lectura
        </h2>
        {!sessions || sessions.length === 0 ? (
          <p className="card p-5 text-center font-medium text-gray-400">
            Aún no hay registros de este libro.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => {
              const answers = Object.entries(s.reflection ?? {}).filter(
                ([, v]) => v && v.trim()
              );
              return (
                <div key={s.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-ink">
                      {formatDate(s.session_date)}
                    </span>
                    <span className="chip bg-grass/15 text-grass-dark">
                      +{s.pages_read} pág · hasta {s.end_page}
                    </span>
                  </div>
                  {answers.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                      {answers.map(([id, value]) => (
                        <div key={id}>
                          <p className="text-xs font-bold text-gray-400">
                            {QUESTION_LABEL[id] ?? id}
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <button
        onClick={() => setConfirmDelete(true)}
        className="mx-auto mt-2 flex items-center gap-1.5 text-sm font-bold text-red-400"
      >
        <Trash2 className="h-4 w-4" /> Eliminar libro
      </button>

      {startingRead && (
        <StartReadingModal
          saving={updateBook.isPending}
          onClose={() => setStartingRead(false)}
          onSave={(sp, ep) => {
            startReading(sp, ep);
            setStartingRead(false);
          }}
        />
      )}

      {confirmDelete && (
        <DeleteModal
          title={book.title}
          deleting={deleteBook.isPending}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      )}

      {finishing && (
        <FinishModal
          initialRating={book.rating ?? 0}
          initialReview={book.review ?? ""}
          saving={updateBook.isPending}
          onClose={() => setFinishing(false)}
          onSave={(rating, review) => {
            updateBook.mutate(
              {
                id: book.id,
                patch: {
                  status: "finished",
                  rating,
                  review: review.trim() || null,
                  finished_at: new Date().toISOString(),
                },
              },
              { onSuccess: () => setFinishing(false) }
            );
          }}
        />
      )}
    </div>
  );
}

function FinishModal({
  initialRating,
  initialReview,
  saving,
  onClose,
  onSave,
}: {
  initialRating: number;
  initialReview: string;
  saving: boolean;
  onClose: () => void;
  onSave: (rating: number, review: string) => void;
}) {
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <h2 className="mb-1 text-xl font-black text-ink">¿Qué te pareció?</h2>
        <p className="mb-4 text-sm font-medium text-gray-400">
          Califícalo y deja una reseña para tu yo del futuro.
        </p>

        <div className="mb-5 flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setRating(i + 1)}
              aria-label={`${i + 1} estrellas`}
            >
              <Star
                className="h-10 w-10 transition-transform active:scale-90"
                fill={i < rating ? "#ffc800" : "none"}
                stroke={i < rating ? "#ffc800" : "#cbcbcb"}
                strokeWidth={2}
              />
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          placeholder="Lo que más te gustó, qué aprendiste, a quién se lo recomendarías…"
          className="input resize-none"
        />

        <div className="mt-4 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancelar
          </button>
          <button
            onClick={() => onSave(rating || 0, review)}
            disabled={saving || rating === 0}
            className="btn-grass flex-1"
          >
            {saving ? "Guardando…" : "Terminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StartReadingModal({
  saving,
  onClose,
  onSave,
}: {
  saving: boolean;
  onClose: () => void;
  onSave: (startPage: number, endPage: number) => void;
}) {
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!startPage.trim()) return setError("La página de inicio es requerida.");
    if (!endPage.trim()) return setError("La página final es requerida.");
    const sp = parseInt(startPage, 10);
    const ep = parseInt(endPage, 10);
    if (!Number.isInteger(sp) || sp < 1)
      return setError("La página de inicio debe ser 1 o mayor.");
    if (!Number.isInteger(ep) || ep < sp)
      return setError("La página final debe ser mayor o igual a la de inicio.");
    onSave(sp, ep);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <h2 className="mb-1 text-xl font-black text-ink">¿En qué páginas está?</h2>
        <p className="mb-4 text-sm font-medium text-gray-400">
          Indica dónde empieza y termina el contenido real del libro (ignora
          páginas en blanco e índices al principio y al final).
        </p>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-extrabold text-gray-600">
              Página de inicio
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={startPage}
              onChange={(e) => setStartPage(e.target.value)}
              placeholder="1"
              className="input"
              autoFocus
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-extrabold text-gray-600">
              Página final
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={endPage}
              onChange={(e) => setEndPage(e.target.value)}
              placeholder="ej. 304"
              className="input"
            />
          </label>
        </div>

        {error && (
          <p className="mt-2 text-sm font-bold text-red-500">{error}</p>
        )}

        <div className="mt-4 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-sky flex-1"
          >
            {saving ? "Guardando…" : "Empezar a leer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  title,
  deleting,
  onClose,
  onConfirm,
}: {
  title: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <h2 className="mb-1 text-xl font-black text-ink">¿Eliminar libro?</h2>
        <p className="mb-6 font-medium text-gray-500">
          Se borrará <span className="font-bold text-ink">"{title}"</span> junto
          con todo su historial de lectura. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="btn flex-1 bg-red-500 text-white shadow-press hover:bg-red-600"
          >
            {deleting ? "Eliminando…" : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
