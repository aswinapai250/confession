export interface Confession {
  id: string; // uuid
  content: string;
  category: string;
  uid: string | null;
  created_at: string;
  love_count: number;
  fire_count: number;
  cry_count: number;
  dead_count: number;
  clown_count: number;
  reply_count: number;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  confession_id: string;
  content: string;
  uid?: string;
  created_at: string;
}

export type SortOption = "trending" | "latest" | "most-reacted";

export const CATEGORIES = ["Crush", "College", "Funny", "Regret", "Dark", "Random", "Work", "30+", "Teachers"];
export const MOODS = ["😊", "😢", "😐", "💀", "❤️"];
export const REACTIONS = ["❤️", "💀", "😭", "🔥", "🤡"];
