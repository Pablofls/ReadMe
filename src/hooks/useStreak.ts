import { useMemo } from "react";
import { useProfile } from "./useProfile";
import { useAllSessions } from "./useSessions";
import {
  currentStreak,
  longestStreak,
  pagesOnDate,
  todayInTimezone,
} from "../lib/streaks";

export interface StreakInfo {
  loading: boolean;
  today: string;
  dailyGoal: number;
  pagesToday: number;
  goalMet: boolean;
  current: number;
  longest: number;
  totalPages: number;
}

export function useStreak(): StreakInfo {
  const { data: profile, isLoading: lp } = useProfile();
  const { data: sessions, isLoading: ls } = useAllSessions();

  return useMemo(() => {
    const dailyGoal = profile?.daily_goal_pages ?? 10;
    const tz = profile?.timezone ?? "America/Mexico_City";
    const today = todayInTimezone(tz);
    const all = sessions ?? [];
    const pagesToday = pagesOnDate(all, today);
    const totalPages = all.reduce((acc, s) => acc + s.pages_read, 0);

    return {
      loading: lp || ls,
      today,
      dailyGoal,
      pagesToday,
      goalMet: pagesToday >= dailyGoal,
      current: currentStreak(all, dailyGoal, today),
      longest: longestStreak(all, dailyGoal),
      totalPages,
    };
  }, [profile, sessions, lp, ls]);
}
