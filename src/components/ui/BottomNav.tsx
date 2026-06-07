import { NavLink } from "react-router-dom";
import { Flame, Library, User } from "lucide-react";

const items = [
  { to: "/", label: "Hoy", icon: Flame, end: true },
  { to: "/biblioteca", label: "Biblioteca", icon: Library, end: false },
  { to: "/perfil", label: "Perfil", icon: User, end: false },
];

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-line bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-2xl items-stretch justify-around">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-bold transition-colors ${
                isActive ? "text-grass" : "text-gray-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="h-6 w-6"
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? "currentColor" : "none"}
                  fillOpacity={isActive ? 0.15 : 0}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
