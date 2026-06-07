import { describe, it, expect } from "vitest";
import {
  totalPages,
  currentPage,
  pagesReadInSession,
  pagesProgressed,
  progressFraction,
  progressPercent,
  isAtEnd,
  validateEndPage,
} from "./pages";

// Libro de ejemplo: el contenido va de la página 5 a la 304 (300 páginas reales).
const book = { start_page: 5, end_page: 304 };

describe("totalPages", () => {
  it("cuenta el rango real, no desde la página 1", () => {
    expect(totalPages(book)).toBe(300);
    expect(totalPages({ start_page: 1, end_page: 1 })).toBe(1);
  });
});

describe("currentPage", () => {
  it("antes de empezar está en start_page - 1", () => {
    expect(currentPage(book, null)).toBe(4);
    expect(currentPage(book, undefined)).toBe(4);
  });
  it("usa la última página marcada cuando existe", () => {
    expect(currentPage(book, 50)).toBe(50);
  });
});

describe("pagesReadInSession", () => {
  it("primera sesión desde el inicio real cuenta correcto", () => {
    // Empieza en pág 5 (previous = 4), se queda en la 20 -> 16 páginas.
    expect(pagesReadInSession(20, 4)).toBe(16);
  });
  it("sesión siguiente resta la posición previa", () => {
    expect(pagesReadInSession(50, 20)).toBe(30);
  });
  it("nunca es negativo", () => {
    expect(pagesReadInSession(10, 20)).toBe(0);
  });
});

describe("pagesProgressed", () => {
  it("acumulado dentro del rango real", () => {
    expect(pagesProgressed(book, 4)).toBe(0);
    expect(pagesProgressed(book, 5)).toBe(1);
    expect(pagesProgressed(book, 304)).toBe(300);
  });
});

describe("progressFraction / progressPercent", () => {
  it("0% al inicio, 100% al final", () => {
    expect(progressFraction(book, 4)).toBe(0);
    expect(progressPercent(book, 4)).toBe(0);
    expect(progressPercent(book, 304)).toBe(100);
  });
  it("a mitad del rango real da ~50%", () => {
    expect(progressPercent(book, 154)).toBe(50); // 150/300
  });
  it("se satura a 100% aunque pasen del final", () => {
    expect(progressFraction(book, 999)).toBe(1);
  });
});

describe("isAtEnd", () => {
  it("detecta el final del libro", () => {
    expect(isAtEnd(book, 303)).toBe(false);
    expect(isAtEnd(book, 304)).toBe(true);
    expect(isAtEnd(book, 305)).toBe(true);
  });
});

describe("validateEndPage", () => {
  it("acepta una página válida posterior", () => {
    expect(validateEndPage(book, 20, 4)).toBeNull();
  });
  it("rechaza páginas antes del inicio", () => {
    expect(validateEndPage(book, 3, 4)).toMatch(/empieza/);
  });
  it("rechaza páginas después del final", () => {
    expect(validateEndPage(book, 400, 4)).toMatch(/termina/);
  });
  it("rechaza no avanzar", () => {
    expect(validateEndPage(book, 20, 20)).toMatch(/posterior/);
  });
  it("rechaza valores no enteros", () => {
    expect(validateEndPage(book, 20.5, 4)).toMatch(/válido/);
  });
});
