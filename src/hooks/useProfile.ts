import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { Profile } from "../lib/types";

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;

      // Por si el trigger no corrió (p. ej. cuenta antigua): crea el perfil.
      if (!data) {
        const tz =
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          "America/Mexico_City";
        const { data: created, error: insErr } = await supabase
          .from("profiles")
          .insert({ id: user!.id, timezone: tz })
          .select("*")
          .single();
        if (insErr) throw insErr;
        return created as Profile;
      }
      return data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Pick<Profile, "display_name" | "daily_goal_pages" | "timezone">>) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user!.id)
        .select("*")
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}
