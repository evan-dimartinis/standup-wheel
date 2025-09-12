import { useEffect, useMemo, useState } from "react";
import {
  listEntriesForDate,
  listPostStandups,
  localISODate,
  PostRow,
  upsertStandupEntry,
  upsertStandupPost,
  WILDCARD_LABEL,
  WILDCARD_PLACEHOLDER,
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
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import EditIcon from "@mui/icons-material/Edit";
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
import Grow from "@mui/material/Grow";
import Fade from "@mui/material/Fade";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { alpha } from "@mui/material/styles";
import {
  blue,
  deepPurple,
  pink,
  teal,
  amber,
  cyan,
  grey,
} from "@mui/material/colors";
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

// Fun, colorful theme w/ gentle motion
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: deepPurple[500] },
    secondary: { main: teal[500] },
    success: { main: cyan[600] },
    warning: { main: amber[600] },
    info: { main: blue[500] },
  },
  typography: {
    fontSize: 14,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(180deg, ${alpha(
            cyan[50],
            0.6
          )} 0%, ${alpha(pink[50], 0.6)} 60%, #fff 100%)`,
          minHeight: "100vh",
        },
        "::-webkit-scrollbar": { height: 10, width: 10 },
        "::-webkit-scrollbar-thumb": {
          background: alpha(deepPurple[400], 0.6),
          borderRadius: 999,
        },
      },
    },
    MuiContainer: {
      styleOverrides: { root: { paddingTop: 16, paddingBottom: 32 } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: `1px solid ${alpha(grey[400], 0.2)}`,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(6px)",
          transition:
            "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
          boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 10px 24px ${alpha(deepPurple[300], 0.25)}`,
            borderColor: alpha(deepPurple[300], 0.4),
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { variant: "contained" },
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 700,
          paddingInline: 16,
          transition: "transform 120ms ease, box-shadow 120ms ease",
          boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
          "&:active": { transform: "translateY(1px) scale(0.98)" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          background: `linear-gradient(135deg, ${alpha(
            pink[300],
            0.25
          )}, ${alpha(cyan[300], 0.25)})`,
          border: `1px solid ${alpha(pink[400], 0.35)}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
        },
      },
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
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [postText, setPostText] = useState<string>("");
  const [postSaving, setPostSaving] = useState<boolean>(false);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);
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

  function openEdit(r: Row) {
    setEditRow(r);
    setShowPrompt(true);
    setForm({
      person: r.person ?? "",
      team: (r.team as RCMTeam) ?? "",
      yesterday: r.yesterday ?? "",
      today: r.today ?? "",
      blockers: r.blockers ?? "",
      wildcard: r.wildcard ?? "",
    });
  }

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const rows = await listEntriesForDate(today);
      const posts = await listPostStandups(today);
      setPosts(posts);
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
        standupDate: editRow?.standup_date ?? today,
        yesterday: emptyToNull(form.yesterday),
        today: emptyToNull(form.today),
        blockers: emptyToNull(form.blockers),
        wildcard: emptyToNull(form.wildcard),
      });
      setShowPrompt(false);
      setEditRow(null);
      await refresh();
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

  const teamBadge = (t: string) => {
    const colorByTeam: Record<string, string> = {
      RCM: deepPurple[400],
      Core: teal[500],
      AI: pink[400],
      Design: amber[600],
      Product: blue[500],
      Unassigned: grey[500],
    };
    return (
      <Chip
        label={t}
        sx={{
          px: 1,
          fontWeight: 700,
          color: "#fff",
          background: `linear-gradient(90deg, ${alpha(
            colorByTeam[t] || grey[600],
            0.95
          )}, ${alpha(colorByTeam[t] || grey[600], 0.6)})`,
          boxShadow: `0 6px 16px ${alpha(colorByTeam[t] || grey[600], 0.35)}`,
        }}
      />
    );
  };

  return (
    <>
      {/* App bar with playful gradient */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          background: `linear-gradient(90deg, ${deepPurple[500]}, ${teal[500]})`,
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.3 }}>
            Standups for {today}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Chip
            size="small"
            label="Have a great standup!"
            sx={{ color: "#fff", borderColor: "#fff" }}
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ maxWidth: 1200 }}>
        <Box sx={{ py: 2 }}>
          {showPrompt && (
            <Dialog open onClose={() => {}} maxWidth="md" fullWidth>
              <DialogTitle sx={{ fontWeight: 800 }}>
                {editRow
                  ? `Edit standup for ${editRow.person}`
                  : "Share your standup"}
              </DialogTitle>
              <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <TextField
                    label="Your name"
                    value={form.person}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, person: e.target.value }))
                    }
                    required
                    placeholder={WILDCARD_PLACEHOLDER}
                    fullWidth
                  />

                  <TextField
                    label="Team"
                    select
                    value={form.team}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        team: e.target.value as RCMTeam,
                      }))
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
                    label={WILDCARD_LABEL}
                    value={form.wildcard}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, wildcard: e.target.value }))
                    }
                    placeholder={WILDCARD_PLACEHOLDER}
                    fullWidth
                  />

                  {error && <Alert severity="error">{error}</Alert>}
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleSkip} variant="text">
                  {editRow ? "Cancel" : "Skip"}
                </Button>
                <Button onClick={handlePost} disabled={submitting}>
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
            <Stack spacing={3}>
              {TEAMS.filter((t) => (entriesByTeam[t]?.length ?? 0) > 0).map(
                (team) => (
                  <Fade key={team} in timeout={350}>
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 1 }}
                      >
                        {teamBadge(team)}
                        <Divider
                          flexItem
                          sx={{ borderColor: alpha(grey[500], 0.2) }}
                        />
                      </Stack>
                      <Grid container spacing={1.5}>
                        {(entriesByTeam[team] ?? []).map((e) => (
                          <Grid
                            key={`${e.person}-${e.standup_date}-${e.team}`}
                            spacing={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                          >
                            <Grow in timeout={240}>
                              <div>
                                <StandupCard row={e} onEdit={openEdit} />
                              </div>
                            </Grow>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Fade>
                )
              )}
              {entriesByTeam["Unassigned"] && (
                <Fade in timeout={350}>
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      {teamBadge("Unassigned")}
                      <Divider
                        flexItem
                        sx={{ borderColor: alpha(grey[500], 0.2) }}
                      />
                    </Stack>
                    <Grid container spacing={1.5}>
                      {entriesByTeam["Unassigned"].map((e) => (
                        <Grid
                          key={`${e.person}-${e.standup_date}-${e.team}`}
                          spacing={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                        >
                          <Grow in timeout={240}>
                            <div>
                              <StandupCard row={e} onEdit={openEdit} />
                            </div>
                          </Grow>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
              )}
              {entries.length === 0 && (
                <Typography color="text.secondary">
                  No updates yet for today.
                </Typography>
              )}

              <StandupAssignments />

              {/* Post-standup notes */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: `1px solid ${alpha(grey[400], 0.25)}`,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  background: `linear-gradient(180deg, ${alpha(
                    teal[50],
                    0.6
                  )}, #fff)`,
                }}
              >
                <Box display="flex" flexDirection="column" gap="8px">
                  <Typography variant="h5" gutterBottom fontWeight={800}>
                    Post‑standup notes
                  </Typography>
                  {posts.map((p) => {
                    return (
                      <Card key={p.id} variant="outlined" sx={{ p: 1.5 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                        >
                          {p.description}
                        </Typography>
                      </Card>
                    );
                  })}
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 1, mb: 1, fontWeight: 700 }}
                >
                  Add a note
                </Typography>
                <TextField
                  label="Post-standup notes"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Anything notable after standup?"
                  multiline
                  minRows={2}
                  fullWidth
                  sx={{ mb: 1 }}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    disabled={postSaving || !postText.trim()}
                    onClick={async () => {
                      setPostSaving(true);
                      setPostSuccess(null);
                      setError(null);
                      try {
                        await upsertStandupPost({
                          standupDate: today,
                          description: postText.trim(),
                        });
                        setPostSuccess("Saved post-standup note.");
                        setPostText("");
                        await refresh();
                      } catch (e: any) {
                        setError(
                          e?.message ?? "Failed to save post-standup note"
                        );
                      } finally {
                        setPostSaving(false);
                      }
                    }}
                  >
                    {postSaving ? "Saving…" : "Save post"}
                  </Button>
                  {postSuccess && (
                    <Typography variant="body2" color="success.main">
                      {postSuccess}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  );
}

/* function TeamSection({
  team,
  rows,
  openEdit,
}: {
  team: RCMTeam | "Unassigned";
  rows: Row[];
  openEdit: (r: Row) => void;
}) {
  // NOTE: Unused now; kept for parity with original file export
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
            <StandupCard row={e} onEdit={openEdit} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} */

function StandupCard({ row, onEdit }: { row: Row; onEdit: (r: Row) => void }) {
  return (
    <Card variant="outlined" sx={{ height: "100%", overflow: "hidden" }}>
      <Box
        sx={{
          height: 6,
          background: `linear-gradient(90deg, ${alpha(pink[400], 0.9)}, ${alpha(
            cyan[400],
            0.9
          )})`,
        }}
      />
      <CardContent sx={{ p: 1.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 0.5 }}
        >
          <Typography variant="subtitle2" fontWeight={800} noWrap>
            {row.person}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {row.wildcard && (
              <Chip
                size="small"
                label={row.wildcard}
                sx={{
                  background: `linear-gradient(135deg, ${alpha(
                    amber[400],
                    0.35
                  )}, ${alpha(teal[300], 0.35)})`,
                  border: `1px solid ${alpha(amber[500], 0.4)}`,
                }}
              />
            )}
            <IconButton
              size="small"
              aria-label="Edit"
              onClick={() => onEdit(row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Stack>
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
    <Box sx={{ mt: 0.75 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: "block", mb: 0.25, letterSpacing: 0.4 }}
      >
        {title}
      </Typography>
      <Typography variant="body2" sx={clampLines(4)}>
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
