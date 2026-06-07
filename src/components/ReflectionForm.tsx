import type { ReflectionQuestion } from "../lib/reflectionQuestions";

export function ReflectionForm({
  questions,
  values,
  onChange,
}: {
  questions: ReflectionQuestion[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {questions.map((q) => (
        <div key={q.id}>
          <label className="mb-1.5 block text-sm font-extrabold text-ink">
            {q.prompt}
          </label>
          <textarea
            value={values[q.id] ?? ""}
            onChange={(e) => onChange(q.id, e.target.value)}
            placeholder={q.placeholder}
            rows={2}
            className="input resize-none"
          />
        </div>
      ))}
    </div>
  );
}
