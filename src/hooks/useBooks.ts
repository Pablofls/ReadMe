import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { Book, BookStatus } from "../lib/types";

export type NewBook = {
  title: string;
  author?: string | null;
  cover_url?: string | null;
  start_page: number;
  end_page: number;
  status: BookStatus;
};

export function useBooks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["books", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Book[]> => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Book[];
    },
  });
}

export function useBook(bookId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["book", bookId],
    enabled: !!user && !!bookId,
    queryFn: async (): Promise<Book | null> => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId!)
        .maybeSingle();
      if (error) throw error;
      return (data as Book) ?? null;
    },
  });
}

function invalidateBooks(qc: ReturnType<typeof useQueryClient>, userId?: string) {
  qc.invalidateQueries({ queryKey: ["books", userId] });
  qc.invalidateQueries({ queryKey: ["book"] });
}

export function useAddBook() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (book: NewBook): Promise<Book> => {
      if (!user) throw new Error("No autenticado");
      const payload = {
        ...book,
        user_id: user.id,
        started_at: book.status === "reading" ? new Date().toISOString() : null,
      };
      const { data, error } = await supabase
        .from("books")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return data as Book;
    },
    onSuccess: () => invalidateBooks(qc, user?.id),
  });
}

export function useUpdateBook() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Book>;
    }): Promise<Book> => {
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase
        .from("books")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data as Book;
    },
    onSuccess: () => invalidateBooks(qc, user?.id),
  });
}

export function useDeleteBook() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("No autenticado");
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateBooks(qc, user?.id),
  });
}
