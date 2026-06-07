export type BookStatus = "want_to_read" | "reading" | "finished";

export interface Profile {
  id: string;
  display_name: string | null;
  daily_goal_pages: number;
  timezone: string;
  created_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  start_page: number;
  end_page: number;
  status: BookStatus;
  rating: number | null;
  review: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  session_date: string; // YYYY-MM-DD
  end_page: number;
  pages_read: number;
  reflection: Record<string, string>;
  created_at: string;
}
