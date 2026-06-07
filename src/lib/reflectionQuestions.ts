/**
 * Preguntas de comprensión lectora (reflexión manual).
 * Tras cada registro mostramos un subconjunto para fomentar la comprensión.
 */
export interface ReflectionQuestion {
  id: string;
  prompt: string;
  placeholder: string;
}

export const REFLECTION_QUESTIONS: ReflectionQuestion[] = [
  {
    id: "key_idea",
    prompt: "¿Qué fue lo más importante de lo que leíste?",
    placeholder: "La idea o momento clave...",
  },
  {
    id: "summary",
    prompt: "Resume en una frase lo que pasó o aprendiste.",
    placeholder: "En una frase...",
  },
  {
    id: "doubt",
    prompt: "¿Quedó alguna duda o algo que no entendiste?",
    placeholder: "Algo que relees o no quedó claro... (opcional)",
  },
  {
    id: "prediction",
    prompt: "¿Qué crees que pasará después?",
    placeholder: "Tu predicción... (opcional)",
  },
  {
    id: "connection",
    prompt: "¿Con qué lo conectas (tu vida, otro libro, una idea)?",
    placeholder: "Una conexión personal... (opcional)",
  },
];

/**
 * Elige `count` preguntas de forma estable para una fecha dada,
 * para que el mismo día siempre muestre las mismas (sin saltos raros).
 */
export function questionsForDate(
  date: string,
  count = 3
): ReflectionQuestion[] {
  const seed = [...date].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const start = seed % REFLECTION_QUESTIONS.length;
  const picked: ReflectionQuestion[] = [];
  for (let i = 0; i < Math.min(count, REFLECTION_QUESTIONS.length); i++) {
    picked.push(REFLECTION_QUESTIONS[(start + i) % REFLECTION_QUESTIONS.length]);
  }
  return picked;
}
