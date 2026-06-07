import { Link } from "react-router-dom";
import { Flame, BookOpen, Plus, Trophy, Check } from "lucide-react";
import { useStreak } from "../hooks/useStreak";
import { useProfile } from "../hooks/useProfile";
import { useBooks } from "../hooks/useBooks";
import { useAllSessions } from "../hooks/useSessions";
import { ProgressRing } from "../components/ui/ProgressRing";
import { Spinner } from "../components/ui/Spinner";
import { progressPercent } from "../lib/pages";
import type { Book } from "../lib/types";

export default function Today() {
  const streak = useStreak();
  const { data: profile } = useProfile();
  const { data: books, isLoading: lb } = useBooks();
  const { data: sessions } = useAllSessions();

  if (streak.loading || lb) return <Spinner label="Cargando tu día…" />;

  const reading = (books ?? []).filter((b) => b.status === "reading");

  // Última página marcada por libro.
  const lastPageByBook = new Map<string, number>();
  for (const s of sessions ?? []) {
    if (!lastPageByBook.has(s.book_id)) lastPageByBook.set(s.book_id, s.end_page);
  }

  const name = profile?.display_name?.split(" ")[0];
  const goalFraction = Math.min(1, streak.pagesToday / streak.dailyGoal);

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-black text-ink">
            {name ? `¡Hola, ${name}!` : "¡Hola!"}
          </h1>
          <p className="font-bold text-gray-400">Tu lectura de hoy</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-flame/10 px-3 py-1.5">
          <Flame
            className="h-6 w-6 text-flame"
            fill={streak.current > 0 ? "#ff9600" : "none"}
          />
          <span className="text-xl font-black text-flame">{streak.current}</span>
        </div>
      </header>

      {/* Anillo de meta diaria */}
      <section className="card flex flex-col items-center gap-3 p-6">
        <ProgressRing fraction={goalFraction} size={150} stroke={14}>
          <span className="text-4xl font-black text-ink">
            {streak.pagesToday}
          </span>
          <span className="text-sm font-bold text-gray-400">
            / {streak.dailyGoal} pág.
          </span>
        </ProgressRing>
        {streak.goalMet ? (
          <div className="chip bg-grass/15 text-grass-dark">
            <Check className="h-4 w-4" /> ¡Meta de hoy cumplida!
          </div>
        ) : (
          <p className="text-center font-bold text-gray-500">
            Te faltan{" "}
            <span className="text-ink">
              {streak.dailyGoal - streak.pagesToday}
            </span>{" "}
            páginas para tu meta
          </p>
        )}
      </section>

      {/* Botón principal */}
      <Link to="/registrar" className="btn-grass w-full text-base">
        <Plus className="h-5 w-5" /> Registrar lectura
      </Link>

      {/* Libros en curso */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 text-lg font-extrabold text-ink">
          <BookOpen className="h-5 w-5 text-sky" /> Leyendo ahora
        </h2>
        {reading.length === 0 ? (
          <EmptyReading />
        ) : (
          <div className="flex flex-col gap-3">
            {reading.map((book) => (
              <ReadingRow
                key={book.id}
                book={book}
                progress={progressPercent(
                  book,
                  lastPageByBook.get(book.id) ?? book.start_page - 1
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* Racha más larga */}
      <section className="card flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/20">
            <Trophy className="h-6 w-6 text-gold" />
          </div>
          <div>
            <p className="font-extrabold text-ink">Racha más larga</p>
            <p className="text-sm font-medium text-gray-400">
              Tu mejor marca hasta ahora
            </p>
          </div>
        </div>
        <span className="text-2xl font-black text-ink">
          {streak.longest}
          <span className="ml-1 text-sm font-bold text-gray-400">días</span>
        </span>
      </section>
    </div>
  );
}

function ReadingRow({ book, progress }: { book: Book; progress: number }) {
  return (
    <Link
      to={`/registrar/${book.id}`}
      className="card flex items-center gap-3 p-3 transition-transform active:scale-[0.98]"
    >
      <div className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-lg">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky to-grass">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 font-extrabold text-ink">{book.title}</p>
        {book.author && (
          <p className="line-clamp-1 text-xs font-medium text-gray-400">
            {book.author}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-grass"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-500">{progress}%</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyReading() {
  return (
    <div className="card flex flex-col items-center gap-3 p-6 text-center">
      <p className="font-bold text-gray-500">
        No tienes ningún libro en curso todavía.
      </p>
      <Link to="/biblioteca" className="btn-sky">
        <Plus className="h-4 w-4" /> Agregar un libro
      </Link>
    </div>
  );
}
