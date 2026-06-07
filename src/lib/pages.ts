import type { Book } from "./types";

/**
 * Matemática de páginas.
 *
 * Importante: los libros no empiezan en la página 1 ni terminan en su última
 * página física. Por eso cada libro guarda `start_page` (donde empieza el
 * contenido real) y `end_page` (donde termina). Todo el progreso se calcula
 * sobre ese rango real.
 */

/** Total de páginas reales de contenido del libro. */
export function totalPages(book: Pick<Book, "start_page" | "end_page">): number {
  return book.end_page - book.start_page + 1;
}

/**
 * Posición actual: la última página en la que se quedó.
 * Si no hay sesiones todavía, está "antes de empezar" = start_page - 1.
 */
export function currentPage(
  book: Pick<Book, "start_page">,
  lastSessionEndPage: number | null | undefined
): number {
  if (lastSessionEndPage == null) return book.start_page - 1;
  return lastSessionEndPage;
}

/**
 * Páginas leídas en una sesión al marcar "me quedé en la página X".
 * = X menos la posición anterior. Nunca negativo.
 */
export function pagesReadInSession(
  newEndPage: number,
  previousPage: number
): number {
  return Math.max(0, newEndPage - previousPage);
}

/** Páginas leídas acumuladas dentro del rango real del libro. */
export function pagesProgressed(
  book: Pick<Book, "start_page">,
  endPage: number
): number {
  return Math.max(0, endPage - (book.start_page - 1));
}

/** Progreso 0..1 dentro del rango real del libro. */
export function progressFraction(
  book: Pick<Book, "start_page" | "end_page">,
  endPage: number
): number {
  const total = totalPages(book);
  if (total <= 0) return 0;
  const done = pagesProgressed(book, endPage);
  return Math.min(1, Math.max(0, done / total));
}

/** Progreso en porcentaje entero (0..100). */
export function progressPercent(
  book: Pick<Book, "start_page" | "end_page">,
  endPage: number
): number {
  return Math.round(progressFraction(book, endPage) * 100);
}

/** ¿La página marcada alcanza o supera el final del libro? */
export function isAtEnd(
  book: Pick<Book, "end_page">,
  endPage: number
): boolean {
  return endPage >= book.end_page;
}

/**
 * Valida una página marcada contra el rango del libro y la posición previa.
 * Devuelve un mensaje de error en español o null si es válida.
 */
export function validateEndPage(
  book: Pick<Book, "start_page" | "end_page">,
  newEndPage: number,
  previousPage: number
): string | null {
  if (!Number.isFinite(newEndPage) || !Number.isInteger(newEndPage)) {
    return "Escribe un número de página válido.";
  }
  if (newEndPage < book.start_page) {
    return `El libro empieza en la página ${book.start_page}.`;
  }
  if (newEndPage > book.end_page) {
    return `El libro termina en la página ${book.end_page}.`;
  }
  if (newEndPage <= previousPage) {
    return `Ya ibas en la página ${previousPage}. Marca una página posterior.`;
  }
  return null;
}
