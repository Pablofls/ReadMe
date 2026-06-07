import { Link } from "react-router-dom";
import { BookOpen, Star } from "lucide-react";
import type { Book } from "../lib/types";

function Cover({ book }: { book: Book }) {
  if (book.cover_url) {
    return (
      <img
        src={book.cover_url}
        alt={book.title}
        className="h-full w-full rounded-xl object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-sky to-grass p-2 text-center">
      <BookOpen className="mb-1 h-6 w-6 text-white/90" />
      <span className="line-clamp-3 text-[11px] font-extrabold leading-tight text-white">
        {book.title}
      </span>
    </div>
  );
}

/** Tarjeta vertical de portada (para la cuadrícula de biblioteca). */
export function BookCard({
  book,
  progress,
}: {
  book: Book;
  progress?: number;
}) {
  return (
    <Link to={`/libro/${book.id}`} className="group block">
      <div className="aspect-[2/3] w-full overflow-hidden rounded-xl border-2 border-line bg-white shadow-card transition-transform group-active:scale-95">
        <Cover book={book} />
      </div>
      <div className="mt-2">
        <p className="line-clamp-2 text-sm font-extrabold leading-tight text-ink">
          {book.title}
        </p>
        {book.author && (
          <p className="line-clamp-1 text-xs font-medium text-gray-400">
            {book.author}
          </p>
        )}
        {book.status === "reading" && progress != null && (
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-grass"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {book.status === "finished" && book.rating != null && (
          <div className="mt-1 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5"
                fill={i < book.rating! ? "#ffc800" : "none"}
                stroke={i < book.rating! ? "#ffc800" : "#cbcbcb"}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
