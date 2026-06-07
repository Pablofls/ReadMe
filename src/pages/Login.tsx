import { useState, type FormEvent } from "react";
import { BookOpen, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cloud px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-grass shadow-press">
            <BookOpen className="h-11 w-11 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-ink">ReadMe</h1>
          <p className="mt-1 font-bold text-gray-500">
            Tu racha de lectura diaria 🔥
          </p>
        </div>

        {sent ? (
          <div className="card flex flex-col items-center gap-3 p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-grass" />
            <h2 className="text-xl font-extrabold">¡Revisa tu correo!</h2>
            <p className="text-sm font-medium text-gray-500">
              Te enviamos un enlace mágico a{" "}
              <span className="font-bold text-ink">{email}</span>. Ábrelo en este
              dispositivo para entrar.
            </p>
            <button
              className="btn-ghost mt-2 w-full"
              onClick={() => setSent(false)}
            >
              Usar otro correo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
            <label className="text-sm font-extrabold text-gray-600">
              Tu correo electrónico
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="input pl-11"
              />
            </div>
            {error && (
              <p className="text-sm font-bold text-red-500">{error}</p>
            )}
            <button
              type="submit"
              className="btn-grass w-full"
              disabled={loading}
            >
              {loading ? "Enviando…" : "Entrar con enlace mágico"}
            </button>
            <p className="text-center text-xs font-medium text-gray-400">
              Sin contraseñas. Te mandamos un enlace para entrar.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
