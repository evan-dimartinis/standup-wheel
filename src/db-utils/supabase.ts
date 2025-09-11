// supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type RCMTeam = "RCM" | "Core" | "AI" | "Design" | "Product";

export type Database = {
  public: {
    Tables: {
      standup_entries: {
        Row: {
          person: string; // <- new identifier
          team: RCMTeam;
          standup_date: string; // 'YYYY-MM-DD'
          yesterday: string | null;
          today: string | null;
          blockers: string | null;
          wildcard: string | null; // <- text field
          created_at: string; // ISO datetime
          updated_at: string; // ISO datetime
        };
        Insert: {
          person: string;
          team: RCMTeam;
          standup_date: string;
          yesterday?: string | null;
          today?: string | null;
          blockers?: string | null;
          wildcard?: string | null;
        };
        Update: Partial<{
          person: string;
          team: RCMTeam;
          standup_date: string;
          yesterday: string | null;
          today: string | null;
          blockers: string | null;
          wildcard: string | null;
        }>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

let _supabase: SupabaseClient<Database> | null = null;

export function getSupabaseClient() {
  if (_supabase) return _supabase;
  const url = "https://bbovdcqlgealiqjnitdh.supabase.co";
  const anonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJib3ZkY3FsZ2VhbGlxam5pdGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjEyMjEsImV4cCI6MjA3MzEzNzIyMX0.f9q4oVR57cNcxqScInSLCzits125CeopgEqTotM5dD0";
  _supabase = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _supabase;
}
