import { useEffect, useMemo, useState } from "react";
import {
  listEntriesForDate,
  localISODate,
  upsertStandupEntry,
} from "../db-utils/utils";
/* import { TEAMS, type RCMTeam, teamOrderIndex } from './types'; */
// import { supabase, type Database } from './supabase';

// MUI
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { grey } from "@mui/material/colors";
import { Database, RCMTeam } from "../db-utils/supabase";
import StandupAssignments from "./StandupAssignments";

function emptyToNull(s: string) {
  return s.trim() === "" ? null : s;
}

export const TEAMS: readonly RCMTeam[] = [
  "RCM",
  "Core",
  "AI",
  "Design",
  "Product",
] as const;

export function teamOrderIndex(team?: string | null) {
  const idx = TEAMS.indexOf((team as RCMTeam) ?? ("RCM" as RCMTeam));
  return idx === -1 ? 999 : idx;
}

export type Row = Database["public"]["Tables"]["standup_entries"]["Row"];
export type Insert = Database["public"]["Tables"]["standup_entries"]["Insert"];

const theme = createTheme({
  palette: { mode: "light" },
  typography: { fontSize: 14 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, border: `1px solid ${grey[200]}` },
      },
    },
    MuiContainer: {
      styleOverrides: { root: { paddingTop: 16, paddingBottom: 24 } },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StandupsPage />
    </ThemeProvider>
  );
}

function StandupsPage() {
  type FormState = {
    person: string;
    team: RCMTeam | "";
    yesterday: string;
    today: string;
    blockers: string;
    wildcard: string;
  };

  const defaultForm: FormState = {
    person: "",
    team: "",
    yesterday: "",
    today: "",
    blockers: "",
    wildcard: "",
  };

  const [showPrompt, setShowPrompt] = useState(true);
  const [form, setForm] = useState<FormState>({ ...defaultForm });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Row[]>([]);
  const today = useMemo(() => localISODate(), []);

  // Load cached name/team for convenience
  useEffect(() => {
    const cachedPerson = localStorage.getItem("standups.person");
    const cachedTeam = localStorage.getItem("standups.team") as RCMTeam | null;
    setForm((f) => ({
      ...f,
      person: cachedPerson ?? f.person,
      team:
        cachedTeam && (TEAMS as readonly string[]).includes(cachedTeam)
          ? cachedTeam
          : f.team,
    }));
  }, []);

  useEffect(() => {
    if (!showPrompt) void refresh();
  }, [showPrompt]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const rows = await listEntriesForDate(today);
      // Sort by team (custom order), then person
      rows.sort((a, b) => {
        const t = teamOrderIndex(a.team) - teamOrderIndex(b.team);
        if (t !== 0) return t;
        return a.person.localeCompare(b.person, undefined, {
          sensitivity: "base",
        });
      });
      setEntries(rows);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  }

  async function handlePost() {
    setSubmitting(true);
    setError(null);
    try {
      if (!form.person.trim()) throw new Error("Please enter your name");
      if (!form.team) throw new Error("Please select a team");
      localStorage.setItem("standups.person", form.person.trim());
      localStorage.setItem("standups.team", form.team as string);

      await upsertStandupEntry({
        person: form.person,
        team: form.team as RCMTeam,
        standupDate: today,
        yesterday: emptyToNull(form.yesterday),
        today: emptyToNull(form.today),
        blockers: emptyToNull(form.blockers),
        wildcard: emptyToNull(form.wildcard),
      });
      setShowPrompt(false);
      setForm({ ...defaultForm, person: form.person, team: form.team });
    } catch (e: any) {
      setError(e?.message ?? "Failed to post");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSkip() {
    setShowPrompt(false);
  }

  // Group entries by team for headers
  const entriesByTeam: Record<string, Row[]> = useMemo(() => {
    const map: Record<string, Row[]> = {};
    for (const r of entries) {
      const key = (TEAMS as readonly string[]).includes(r.team as string)
        ? (r.team as string)
        : "Unassigned";
      (map[key] ||= []).push(r);
    }
    return map;
  }, [entries]);

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1200 }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          bgcolor: "background.paper",
          py: 1,
          mb: 2,
          borderBottom: `1px solid ${grey[200]}`,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Standups for {today}
        </Typography>
      </Box>

      {showPrompt && (
        <Dialog open onClose={() => {}} maxWidth="md" fullWidth>
          <DialogTitle>Share your standup</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Your name"
                value={form.person}
                onChange={(e) =>
                  setForm((f) => ({ ...f, person: e.target.value }))
                }
                required
                fullWidth
              />

              <TextField
                label="Team"
                select
                value={form.team}
                onChange={(e) =>
                  setForm((f) => ({ ...f, team: e.target.value as RCMTeam }))
                }
                required
                fullWidth
              >
                {TEAMS.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Yesterday"
                value={form.yesterday}
                onChange={(e) =>
                  setForm((f) => ({ ...f, yesterday: e.target.value }))
                }
                placeholder="What did you get done?"
                multiline
                minRows={2}
                fullWidth
              />

              <TextField
                label="Today"
                value={form.today}
                onChange={(e) =>
                  setForm((f) => ({ ...f, today: e.target.value }))
                }
                placeholder="What will you do today?"
                multiline
                minRows={2}
                fullWidth
              />

              <TextField
                label="Blockers"
                value={form.blockers}
                onChange={(e) =>
                  setForm((f) => ({ ...f, blockers: e.target.value }))
                }
                placeholder="Anything in your way?"
                multiline
                minRows={2}
                fullWidth
              />

              <TextField
                label="Wildcard (tag/emoji/note)"
                value={form.wildcard}
                onChange={(e) =>
                  setForm((f) => ({ ...f, wildcard: e.target.value }))
                }
                fullWidth
              />

              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSkip} variant="text">
              Skip
            </Button>
            <Button
              onClick={handlePost}
              variant="contained"
              disabled={submitting}
            >
              {submitting ? "Posting…" : "Post update"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {loading ? (
        <Typography>Loading…</Typography>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {TEAMS.filter((t) => (entriesByTeam[t]?.length ?? 0) > 0).map(
            (team) => (
              <Box key={team}>
                <TeamSection
                  team={team as RCMTeam}
                  rows={entriesByTeam[team] ?? []}
                />
                <Divider sx={{ my: 1.5 }} />
              </Box>
            )
          )}
          {entriesByTeam["Unassigned"] && (
            <Box>
              <TeamSection
                team={"Unassigned" as any}
                rows={entriesByTeam["Unassigned"]}
              />
            </Box>
          )}
          {entries.length === 0 && (
            <Typography color="text.secondary">
              No updates yet for today.
            </Typography>
          )}
          <StandupAssignments />
        </Stack>
      )}
    </Container>
  );
}

function TeamSection({
  team,
  rows,
}: {
  team: RCMTeam | "Unassigned";
  rows: Row[];
}) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {team}
      </Typography>
      <Grid container spacing={1.5}>
        {rows.map((e) => (
          <Grid
            key={`${e.person}-${e.standup_date}-${e.team}`}
            spacing={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          >
            <StandupCard row={e} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function StandupCard({ row }: { row: Row }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ p: 1.25 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 0.5 }}
        >
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {row.person}
          </Typography>
          {row.wildcard && <Chip size="small" label={row.wildcard} />}
        </Stack>
        <Section title="Yesterday" text={row.yesterday} />
        <Section title="Today" text={row.today} />
        <Section title="Blockers" text={row.blockers} />
      </CardContent>
    </Card>
  );
}

function Section({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <Box sx={{ mt: 0.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.25 }}
      >
        {title}
      </Typography>
      <Typography variant="body2" sx={clampLines(3)}>
        {text}
      </Typography>
    </Box>
  );
}

function clampLines(lines: number) {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };
}
