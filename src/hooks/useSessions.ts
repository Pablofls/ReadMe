import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { ReadingSession } from "../lib/types";

/** Todas las sesiones del usuario (para rachas y estadísticas). */
export function useAllSessions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sessions", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ReadingSession[]> => {
      const { data, error } = await supabase
        .from("reading_sessions")
        .select("*")
        .order("session_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReadingSession[];
    },
  });
}

/** Sesiones de un libro concreto (historial en el detalle). */
export function useBookSessions(bookId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sessions", "book", bookId],
    enabled: !!user && !!bookId,
    queryFn: async (): Promise<ReadingSession[]> => {
      const { data, error } = await supabase
        .from("reading_sessions")
        .select("*")
        .eq("book_id", bookId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReadingSession[];
    },
  });
}

export type NewSession = {
  book_id: string;
  session_date: string;
  end_page: number;
  pages_read: number;
  reflection: Record<string, string>;
};

export function useAddSession() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (session: NewSession): Promise<ReadingSession> => {
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase
        .from("reading_sessions")
        .insert({ ...session, user_id: user!.id })
        .select("*")
        .single();
      if (error) throw error;
      return data as ReadingSession;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
