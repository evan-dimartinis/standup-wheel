import { startOfDay } from "date-fns";
import {
  RCMTeam,
  getSupabaseClient as supabase,
  type Database,
} from "./supabase";

/** Types for standup entries */
export type StandupRow = Database["public"]["Tables"]["standup_entries"]["Row"];
export type StandupInsert =
  Database["public"]["Tables"]["standup_entries"]["Insert"];

/** Types for post-standups (free-text notes after standup) */
export type PostRow = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

/** Configurable labels/prompts used in the Standups UI */
export const WILDCARD_LABEL =
  "What is something that brought you joy this week?";
export const WILDCARD_PLACEHOLDER = "";

/** Returns YYYY-MM-DD in local time */
export function localISODate(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Create or update a standup entry for a given person/date */
export async function upsertStandupEntry(input: {
  person: string;
  team: RCMTeam;
  standupDate: string; // YYYY-MM-DD
  yesterday: string | null;
  today: string | null;
  blockers: string | null;
  wildcard: string | null;
}): Promise<StandupRow> {
  const s = supabase();

  const payload: Partial<StandupInsert> = {
    person: input.person,
    team: input.team,
    standup_date: input.standupDate,
    yesterday: input.yesterday,
    today: input.today,
    blockers: input.blockers,
    wildcard: input.wildcard,
  };

  const { data, error } = await s
    .from("standup_entries")
    .upsert(payload, { onConflict: "person,standup_date" })
    .select()
    .single();

  if (error) throw error;
  return data as StandupRow;
}

/** Fetch all standup entries for a specific date */
export async function listEntriesForDate(
  standupDate: string
): Promise<StandupRow[]> {
  const s = supabase();
  const { data, error } = await s
    .from("standup_entries")
    .select("*")
    .eq("standup_date", standupDate)
    .order("person", { ascending: true });

  if (error) throw error;
  return (data ?? []) as StandupRow[];
}

/** Create or update a "post-standup" note for a date */
export async function upsertStandupPost(input: {
  standupDate: string; // YYYY-MM-DD
  description: string;
}): Promise<PostRow> {
  const s = supabase();

  const payload: Partial<PostInsert> = {
    standup_date: input.standupDate,
    description: input.description,
  };

  const { data, error } = await s
    .from("posts")
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as PostRow;
}

export async function listPostStandups(date?: string) {
  const s = supabase();

  const { data, error } = await s
    .from("posts")
    .select("*")
    .eq("standup_date", date || startOfDay(new Date()).toString());

  if (error) throw error;
  return data as PostRow[];
}
