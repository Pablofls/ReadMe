import { describe, it, expect } from "vitest";
import {
  addDays,
  sumPagesByDate,
  completedDays,
  currentStreak,
  longestStreak,
  pagesOnDate,
  todayInTimezone,
} from "./streaks";

const s = (date: string, pages: number) => ({ session_date: date, pages_read: pages });

describe("addDays", () => {
  it("avanza y retrocede días, incluso cruzando meses", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-06-07", -1)).toBe("2026-06-06");
  });
  it("es estable ante cambios de horario de verano", () => {
    // Alrededor de un cambio DST típico en EEUU (marzo).
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
  });
});

describe("sumPagesByDate / pagesOnDate", () => {
  it("suma varias sesiones del mismo día", () => {
    const sessions = [s("2026-06-07", 10), s("2026-06-07", 5), s("2026-06-06", 3)];
    expect(sumPagesByDate(sessions).get("2026-06-07")).toBe(15);
    expect(pagesOnDate(sessions, "2026-06-07")).toBe(15);
    expect(pagesOnDate(sessions, "2026-01-01")).toBe(0);
  });
});

describe("completedDays", () => {
  it("solo cuenta días que alcanzan la meta", () => {
    const sessions = [s("2026-06-07", 10), s("2026-06-06", 4)];
    const done = completedDays(sessions, 10);
    expect(done.has("2026-06-07")).toBe(true);
    expect(done.has("2026-06-06")).toBe(false);
  });
  it("suma páginas del mismo día para alcanzar la meta", () => {
    const sessions = [s("2026-06-07", 6), s("2026-06-07", 6)];
    expect(completedDays(sessions, 10).has("2026-06-07")).toBe(true);
  });
});

describe("currentStreak", () => {
  const goal = 10;
  it("cuenta días consecutivos terminando hoy", () => {
    const sessions = [s("2026-06-07", 10), s("2026-06-06", 10), s("2026-06-05", 12)];
    expect(currentStreak(sessions, goal, "2026-06-07")).toBe(3);
  });
  it("sigue viva si hoy no se ha cumplido pero ayer sí", () => {
    const sessions = [s("2026-06-06", 10), s("2026-06-05", 10)];
    expect(currentStreak(sessions, goal, "2026-06-07")).toBe(2);
  });
  it("se rompe con un hueco", () => {
    const sessions = [s("2026-06-07", 10), s("2026-06-05", 10)];
    expect(currentStreak(sessions, goal, "2026-06-07")).toBe(1);
  });
  it("es 0 si ni hoy ni ayer se cumplieron", () => {
    const sessions = [s("2026-06-04", 10)];
    expect(currentStreak(sessions, goal, "2026-06-07")).toBe(0);
  });
  it("ignora días que no alcanzan la meta", () => {
    const sessions = [s("2026-06-07", 3), s("2026-06-06", 10)];
    expect(currentStreak(sessions, goal, "2026-06-07")).toBe(1); // solo ayer
  });
});

describe("longestStreak", () => {
  it("encuentra la secuencia consecutiva más larga", () => {
    const sessions = [
      s("2026-06-01", 10),
      s("2026-06-02", 10),
      s("2026-06-03", 10),
      // hueco
      s("2026-06-05", 10),
      s("2026-06-06", 10),
    ];
    expect(longestStreak(sessions, 10)).toBe(3);
  });
  it("es 0 sin días completados", () => {
    expect(longestStreak([s("2026-06-01", 2)], 10)).toBe(0);
  });
});

describe("todayInTimezone", () => {
  it("devuelve formato YYYY-MM-DD", () => {
    const out = todayInTimezone("America/Mexico_City");
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("respeta la zona horaria para el corte de día", () => {
    // Medianoche UTC del 7 de junio: en México (UTC-6) todavía es el 6.
    const at = new Date("2026-06-07T03:00:00Z");
    expect(todayInTimezone("America/Mexico_City", at)).toBe("2026-06-06");
    expect(todayInTimezone("UTC", at)).toBe("2026-06-07");
  });
});
