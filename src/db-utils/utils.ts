import {
  RCMTeam,
  getSupabaseClient as supabase,
  type Database,
} from "./supabase";

type Row = Database["public"]["Tables"]["standup_entries"]["Row"];
type Insert = Database["public"]["Tables"]["standup_entries"]["Insert"];

export function localISODate(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function upsertStandupEntry(input: {
  person: string;
  team: RCMTeam;
  standupDate: string; // YYYY-MM-DD
  yesterday?: string | null;
  today?: string | null;
  blockers?: string | null;
  wildcard?: string | null;
}): Promise<Row> {
  const s = supabase();
  const payload: Insert = {
    person: input.person.trim(),
    team: input.team,
    standup_date: input.standupDate,
    yesterday: input.yesterday ?? null,
    today: input.today ?? null,
    blockers: input.blockers ?? null,
    wildcard: input.wildcard ?? null,
  };

  const { data, error } = await s
    .from("standup_entries")
    .upsert(payload, { onConflict: "person,standup_date" })
    .select()
    .single();

  if (error) throw error;
  return data as Row;
}

export async function listEntriesForDate(standupDate: string): Promise<Row[]> {
  const s = supabase();
  const { data, error } = await s
    .from("standup_entries")
    .select("*")
    .eq("standup_date", standupDate)
    .order("person", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Row[];
}
