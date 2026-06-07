/**
 * Lógica de rachas estilo Duolingo (funciones puras).
 *
 * Un día "cuenta" si la suma de páginas leídas ese día alcanza la meta diaria.
 * - Racha actual = días consecutivos completados que terminan hoy o ayer.
 * - Racha más larga = la secuencia consecutiva más larga del histórico.
 *
 * Todo trabaja sobre fechas en formato YYYY-MM-DD para ser fácil de testear.
 */

export interface DatedPages {
  session_date: string; // YYYY-MM-DD
  pages_read: number;
}

/** Fecha de "hoy" (YYYY-MM-DD) en una zona horaria dada. */
export function todayInTimezone(timezone: string, now: Date = new Date()): string {
  try {
    // en-CA produce el formato YYYY-MM-DD.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    return new Intl.DateTimeFormat("en-CA").format(now);
  }
}

/** Suma de páginas por fecha. */
export function sumPagesByDate(sessions: DatedPages[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of sessions) {
    map.set(s.session_date, (map.get(s.session_date) ?? 0) + s.pages_read);
  }
  return map;
}

/** Conjunto de fechas que alcanzaron la meta diaria. */
export function completedDays(
  sessions: DatedPages[],
  dailyGoal: number
): Set<string> {
  const byDate = sumPagesByDate(sessions);
  const done = new Set<string>();
  for (const [date, total] of byDate) {
    if (total >= dailyGoal) done.add(date);
  }
  return done;
}

/** Suma `days` días a una fecha YYYY-MM-DD (seguro ante DST usando UTC mediodía). */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Racha actual: días consecutivos completados terminando hoy.
 * Si hoy aún no se completa pero ayer sí, la racha sigue viva (cuenta desde ayer).
 */
export function currentStreak(
  sessions: DatedPages[],
  dailyGoal: number,
  today: string
): number {
  const done = completedDays(sessions, dailyGoal);
  if (done.size === 0) return 0;

  // El ancla es hoy si está completo; si no, ayer (la racha aún no se "rompe"
  // hasta que pase un día completo sin cumplir).
  let cursor: string;
  if (done.has(today)) {
    cursor = today;
  } else {
    const yesterday = addDays(today, -1);
    if (done.has(yesterday)) cursor = yesterday;
    else return 0;
  }

  let streak = 0;
  while (done.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Racha más larga del histórico. */
export function longestStreak(
  sessions: DatedPages[],
  dailyGoal: number
): number {
  const done = completedDays(sessions, dailyGoal);
  if (done.size === 0) return 0;

  const sorted = [...done].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1], 1) === sorted[i]) {
      run++;
    } else {
      run = 1;
    }
    if (run > best) best = run;
  }
  return best;
}

/** Páginas leídas en una fecha concreta. */
export function pagesOnDate(sessions: DatedPages[], date: string): number {
  return sumPagesByDate(sessions).get(date) ?? 0;
}
