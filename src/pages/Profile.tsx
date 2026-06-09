import { useEffect, useRef, useState } from "react";
import { Flame, BookCheck, Layers, LogOut, Target, Trophy } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";
import { useBooks } from "../hooks/useBooks";
import { useStreak } from "../hooks/useStreak";
import { Spinner } from "../components/ui/Spinner";

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 50];

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: books } = useBooks();
  const updateProfile = useUpdateProfile();
  const streak = useStreak();

  const [name, setName] = useState("");
  const [goal, setGoal] = useState(10);
  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name ?? "");
      setGoal(profile.daily_goal_pages);
    }
  }, [profile]);

  if (isLoading) return <Spinner />;

  const finishedCount = (books ?? []).filter((b) => b.status === "finished").length;
  const totalBooks = (books ?? []).length;

  const save = () => {
    updateProfile.mutate(
      { display_name: name.trim() || null, daily_goal_pages: goal },
      {
        onSuccess: () => {
          setSavedFlash(true);
          clearTimeout(flashTimer.current);
          flashTimer.current = setTimeout(() => setSavedFlash(false), 1500);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-5 pt-2">
      <h1 className="text-2xl font-black text-ink">Perfil</h1>

      {/* Estadísticas */}
      <section className="grid grid-cols-2 gap-3">
        <Stat icon={Flame} color="text-flame" value={streak.current} label="Racha actual" />
        <Stat icon={Trophy} color="text-gold" value={streak.longest} label="Mejor racha" />
        <Stat icon={Layers} color="text-sky" value={streak.totalPages} label="Páginas leídas" />
        <Stat icon={BookCheck} color="text-grass" value={finishedCount} label="Libros terminados" />
      </section>

      {/* Ajustes */}
      <section className="card flex flex-col gap-4 p-5">
        <div>
          <label className="mb-1.5 block text-sm font-extrabold text-gray-600">
            Tu nombre
          </label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="¿Cómo te llamamos?"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-gray-600">
            <Target className="h-4 w-4" /> Meta diaria de páginas
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`rounded-2xl border-2 py-2.5 text-sm font-extrabold transition-colors ${
                  goal === g
                    ? "border-grass bg-grass/10 text-grass-dark"
                    : "border-line bg-white text-gray-500"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          disabled={updateProfile.isPending}
          className="btn-grass w-full"
        >
          {updateProfile.isPending
            ? "Guardando…"
            : savedFlash
              ? "¡Guardado! ✓"
              : "Guardar cambios"}
        </button>
      </section>

      <section className="card p-5">
        <p className="text-sm font-medium text-gray-400">Sesión iniciada como</p>
        <p className="font-bold text-ink">{user?.email}</p>
        <p className="mt-1 text-xs font-medium text-gray-400">
          Tienes {totalBooks} libro{totalBooks === 1 ? "" : "s"} en tu biblioteca.
        </p>
      </section>

      <button
        onClick={signOut}
        className="mx-auto flex items-center gap-1.5 font-bold text-red-400"
      >
        <LogOut className="h-5 w-5" /> Cerrar sesión
      </button>
    </div>
  );
}

function Stat({
  icon: Icon,
  color,
  value,
  label,
}: {
  icon: typeof Flame;
  color: string;
  value: number;
  label: string;
}) {
  return (
    <div className="card flex flex-col gap-1 p-4">
      <Icon className={`h-6 w-6 ${color}`} />
      <span className="text-2xl font-black text-ink">{value}</span>
      <span className="text-xs font-bold text-gray-400">{label}</span>
    </div>
  );
}
