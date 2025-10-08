import React, { useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  Grid,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Checkbox,
  Avatar,
  Badge,
  Tooltip,
} from "@mui/material";

// ==== Types & Data ====
export type TeamMember =
  | "Evan DiMartinis"
  | "Camille Jwo"
  | "Jonah Offitzer"
  | "Yosh Talwar"
  | "Phil Gray"
  | "Marissa Sileo"
  | "Gus Price"
  | "Jaime Riley"
  | "Craig O'Donnell"
  | "George Uehling"
  | "Alex Blackson"
  | "Maggie Smith"
  | "Christian Lopez"
  | "Gabe Szczepanek"
  | "Sam Rozenfeld"
  | "Vanessa Barker";

export const teams: { [key: string]: TeamMember[] } = {
  AI: ["Gus Price", "Jaime Riley", "Craig O'Donnell"],
  Core: ["Marissa Sileo", "Yosh Talwar", "Phil Gray", "Sam Rozenfeld"],
  RCM: ["Evan DiMartinis", "Camille Jwo", "Jonah Offitzer"],
  Product: ["George Uehling", "Alex Blackson", "Vanessa Barker"],
  Design: ["Maggie Smith", "Christian Lopez"],
};

// Hardcoded absentees (edit this list as needed)
export const ABSENT: TeamMember[] = ["Marissa Sileo"];

// ==== Rotation Logic (deterministic by date) ====
function rotateArray<T>(arr: T[], k: number): T[] {
  const n = arr.length;
  if (n === 0) return [];
  const s = ((k % n) + n) % n;
  return arr.slice(s).concat(arr.slice(0, s));
}

function isoDayIndex(d: Date): number {
  const dow = d.getDay(); // Sun=0..Sat=6
  return (dow + 6) % 7; // Mon=0..Sun=6
}

function isoWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const diff = date.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 3600 * 1000));
}

export type Assignments = {
  meta: { isoWeek: number; date: string; dayOfWeekISO: number };
  teamPairings: { [readingTeam: string]: string };
  detail: {
    [readingTeam: string]: {
      readsFrom: string;
      assignments: { [readerName: string]: TeamMember[] };
    };
  };
};

export function getStandupAssignments(
  date: Date = new Date(),
  teamRoster: { [key: string]: TeamMember[] } = teams,
  absent: TeamMember[] = ABSENT
): Assignments {
  // Gather all present members (teams ignored for matching)
  const present: TeamMember[] = Object.values(teamRoster)
    .flat()
    .filter((m): m is TeamMember => !!m && !absent.includes(m))
    .sort();

  const dayIndex = isoDayIndex(date);
  const week = isoWeekNumber(date);

  // Build a deterministic derangement by rotating the sorted list by k
  // k is 1..n-1 so nobody gets themselves
  const n = present.length;
  let pairs: Record<string, TeamMember> = {};
  if (n >= 2) {
    const k = 1 + ((week * 7 + dayIndex) % (n - 1));
    for (let i = 0; i < n; i++) {
      const reader = present[i];
      const target = present[(i + k) % n];
      pairs[reader] = target;
    }
  }

  // Repackage into the existing per-team structure so the UI doesn’t need changes
  const detail: Assignments["detail"] = {};
  for (const teamName of Object.keys(teamRoster)) {
    const teamMembers = (teamRoster[teamName] ?? []).filter(
      (m): m is TeamMember => !!m && !absent.includes(m)
    );
    const assignments: { [reader: string]: TeamMember[] } = {};
    teamMembers.sort().forEach((reader) => {
      const target = pairs[reader];
      assignments[reader] = target ? [target] : []; // exactly one or none if <2 present
    });
    detail[teamName] = {
      readsFrom: "All",
      assignments,
    };
  }

  return {
    meta: {
      isoWeek: week,
      date: date.toISOString().slice(0, 10),
      dayOfWeekISO: dayIndex,
    },
    // Teams are not used for pairing anymore; keep field for UI compatibility
    teamPairings: Object.fromEntries(
      Object.keys(teamRoster).map((t) => [t, "All"])
    ),
    detail,
  };
}

// ==== UI Component (MUI) ====

type Props = {
  roster?: { [key: string]: TeamMember[] };
  initialDate?: Date;
  absent?: TeamMember[]; // optional override of hardcoded ABSENT
};

const allMembers = Object.values(teams).flat().sort();

function findTeamOf(member: string, roster: { [key: string]: TeamMember[] }) {
  return Object.keys(roster).find((t) =>
    roster[t].includes(member as TeamMember)
  );
}

function formatISODateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function humanDay(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function StandupAssignments({
  roster = teams,
  initialDate = new Date(),
  absent = ABSENT,
}: Props) {
  const [dateStr, setDateStr] = useState<string>(
    formatISODateInput(initialDate)
  );
  const [me, setMe] = useState<string>(allMembers[0] ?? "");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const date = useMemo(() => new Date(`${dateStr}T00:00:00`), [dateStr]);
  const data = useMemo(
    () => getStandupAssignments(date, roster, absent),
    [date, roster, absent]
  );

  const myTeam = findTeamOf(me, roster);
  const myAssignments = useMemo(() => {
    if (!myTeam) return null;
    const section = data.detail[myTeam];
    if (!section) return null;
    return {
      readingTeam: myTeam,
      targetTeam: section.readsFrom,
      targets: section.assignments[me as TeamMember] ?? [],
    };
  }, [data, me, myTeam, roster]);

  // Flatten to a sequential checklist: (readingTeam, reader) -> target person
  type FlatRow = {
    id: string;
    readingTeam: string;
    targetTeam: string;
    reader: string;
    target: string;
  };
  const flat: FlatRow[] = useMemo(() => {
    const rows: FlatRow[] = [];
    for (const readingTeam of Object.keys(data.detail).sort()) {
      const section = data.detail[readingTeam];
      const targetTeam = section.readsFrom;
      const readers = Object.keys(section.assignments).sort();
      for (const reader of readers) {
        const targets = (section.assignments[reader] ?? []).slice().sort();
        for (const target of targets) {
          const id = `${readingTeam}__${reader}__${target}`;
          rows.push({ id, readingTeam, targetTeam, reader, target });
        }
        if ((section.assignments[reader] ?? []).length === 0) {
          const id = `${readingTeam}__${reader}__NONE`;
          rows.push({ id, readingTeam, targetTeam, reader, target: "(none)" });
        }
      }
    }
    return rows;
  }, [data]);

  const toggleChecked = (id: string) =>
    setChecked((c) => ({ ...c, [id]: !c[id] }));

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh" }}>
      {/* <AppBar position="sticky" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 3 }}>
            Standup Reading Assignments
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", flexGrow: 1 }}
          >
            ISO Week {data.meta.isoWeek} · {humanDay(date)}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="me-label">Your name</InputLabel>
              <Select
                labelId="me-label"
                label="Your name"
                value={me}
                onChange={(e) => setMe(e.target.value)}
              >
                {Object.values(roster)
                  .flat()
                  .filter((m) => !absent.includes(m))
                  .sort()
                  .map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />
          </Stack>
        </Toolbar>
      </AppBar> */}

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Absentee banner */}
          {absent.length > 0 && (
            <Grid spacing={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "warning.50",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Absent today:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {absent.map((m) => (
                      <Chip
                        key={m}
                        label={m}
                        color="warning"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          )}

          {/* My Assignments */}
          {/* <Grid spacing={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Badge
                    color="primary"
                    badgeContent={data.meta.dayOfWeekISO + 1}
                  >
                    <Avatar>{me ? initials(me) : "?"}</Avatar>
                  </Badge>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      My Assignments
                    </Typography>
                    {myTeam && (
                      <Typography variant="caption" color="text.secondary">
                        Your team: {myTeam}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {!myAssignments ? (
                <Typography color="text.secondary">
                  Select your name to see your assignments.
                </Typography>
              ) : (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Today, <b>{myAssignments.readingTeam}</b> reads{" "}
                    <b>{myAssignments.targetTeam}</b>.
                  </Typography>
                  {myAssignments.targets.length === 0 ? (
                    <Paper
                      variant="outlined"
                      sx={{ p: 1.5, bgcolor: "grey.50" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        You have no assigned statuses today (load is rotated
                        across the week).
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {myAssignments.targets.map((t) => (
                        <Chip key={t} label={t} variant="outlined" />
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </Paper>
          </Grid> */}

          {/* Team Pairings Overview */}
          <Grid spacing={{ xs: 12, md: 7 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Team → Team (today)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {Object.keys(data.detail)
                  .sort()
                  .map((readingTeam) => {
                    const section = data.detail[readingTeam];
                    const targetTeam = section.readsFrom;
                    const readers = Object.keys(section.assignments).sort();
                    const totalTargets = Object.values(
                      section.assignments
                    ).flat().length;
                    return (
                      <Grid spacing={{ xs: 12, sm: 6 }} key={readingTeam}>
                        <Paper
                          variant="outlined"
                          sx={{ p: 1.5, borderRadius: 2 }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mb: 1 }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700 }}
                            >
                              {readingTeam}
                            </Typography>
                            <Tooltip title="Readers · Targets">
                              <Chip
                                size="small"
                                label={`${readers.length} · ${totalTargets}`}
                                variant="outlined"
                              />
                            </Tooltip>
                          </Stack>
                          <List dense disablePadding>
                            {readers.map((r) => {
                              const assigned = (section.assignments[r] ?? [])
                                .slice()
                                .sort();
                              /* const isMe = r === me; */
                              return (
                                <ListItem
                                  key={r}
                                  sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: "background.paper",
                                    borderRadius: 1,
                                    mb: 1,
                                  }}
                                >
                                  <Avatar
                                    sx={{ width: 28, height: 28, mr: 1.5 }}
                                  >
                                    {initials(r)}
                                  </Avatar>
                                  <ListItemText
                                    primary={
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 500 }}
                                      >
                                        {r}{" "}
                                      </Typography>
                                    }
                                    /* secondary={
                                      assigned.length > 0 ? (
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          flexWrap="wrap"
                                          sx={{ mt: 0.5 }}
                                        >
                                          {assigned.map((t) => (
                                            <Chip
                                              key={t}
                                              size="small"
                                              label={t}
                                              variant="outlined"
                                            />
                                          ))}
                                        </Stack>
                                      ) : (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          No assignment today.
                                        </Typography>
                                      )
                                    } */
                                  />
                                </ListItem>
                              );
                            })}
                          </List>
                        </Paper>
                      </Grid>
                    );
                  })}
              </Grid>
            </Paper>
          </Grid>

          {/* Linear Checklist: go down the list easily */}
          <Grid spacing={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                All Assignments Today (Checklist)
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <List
                dense
                subheader={
                  <ListSubheader
                    disableSticky
                    component="div"
                    sx={{ bgcolor: "transparent", pl: 0 }}
                  >
                    Ordered by Team → Reader → Target
                  </ListSubheader>
                }
              >
                {flat.map(({ id, readingTeam, targetTeam, reader, target }) => (
                  <ListItem
                    key={id}
                    /* secondaryAction={
                      <Chip
                        size="small"
                        label={`${readingTeam} → ${targetTeam}`}
                      />
                    } */
                  >
                    <Checkbox
                      edge="start"
                      checked={!!checked[id]}
                      onChange={() => toggleChecked(id)}
                      tabIndex={-1}
                    />
                    <Avatar sx={{ width: 28, height: 28, mx: 1 }}>
                      {initials(reader)}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: reader === me ? 700 : 500 }}
                          >
                            {reader}
                          </Typography>
                          {/* <Typography variant="body2">reads</Typography>
                          <Chip
                            size="small"
                            label={target}
                            variant="outlined"
                          /> */}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Notes: Team-to-team mapping rotates weekly (ISO week) with no team
            reading itself. Individual assignments rotate daily within the week
            to spread load. Absent members neither read nor get read that day.
            Same date → same output.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
