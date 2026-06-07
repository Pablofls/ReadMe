import { Routes, Route, Navigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured } from "./lib/supabase";
import { useAuth } from "./hooks/useAuth";
import { Spinner } from "./components/ui/Spinner";
import { BottomNav } from "./components/ui/BottomNav";
import Login from "./pages/Login";
import Today from "./pages/Today";
import Library from "./pages/Library";
import LogReading from "./pages/LogReading";
import BookDetail from "./pages/BookDetail";
import Profile from "./pages/Profile";

function NotConfigured() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertTriangle className="h-12 w-12 text-flame" />
      <h1 className="text-2xl font-black">Falta configurar Supabase</h1>
      <p className="max-w-md font-medium text-gray-500">
        Copia <code className="rounded bg-line px-1">.env.example</code> a{" "}
        <code className="rounded bg-line px-1">.env.local</code> y agrega tus
        valores <code className="rounded bg-line px-1">VITE_SUPABASE_URL</code> y{" "}
        <code className="rounded bg-line px-1">VITE_SUPABASE_ANON_KEY</code>.
        Revisa el README para los pasos completos.
      </p>
    </div>
  );
}

/** Layout con barra inferior para las pantallas autenticadas. */
function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <main className="flex-1 px-4 pb-24 pt-4">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/registrar" element={<LogReading />} />
          <Route path="/registrar/:bookId" element={<LogReading />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/libro/:bookId" element={<BookDetail />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const { session, loading } = useAuth();

  if (!isSupabaseConfigured) return <NotConfigured />;
  if (loading) return <Spinner label="Cargando…" />;
  if (!session) return <Login />;
  return <AppShell />;
}
