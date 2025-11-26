import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Divider,
  ListItem,
} from "@mui/material";
import WheelComponent from "./wheel";

const ScrumStandupMobile: React.FC = () => {
  const [postStandupTopics, setPostStandupTopics] = useState<
    {
      topic: string;
      members: string[];
    }[]
  >([]);

  const [newTopic, setNewTopic] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [showEvansAnswer, setShowEvansAnswer] = useState(false);
  const toggleEvansAnswer = () => {
    setShowEvansAnswer((prev) => !prev);
  };

  const [showScoreboard, setShowScoreboard] = useState(false);
  const toggleScoreboard = () => {
    setShowScoreboard((prev) => !prev);
  };

  const [showQuestion, setShowQuestion] = useState(false);
  const toggleQuestion = () => {
    setShowQuestion((prev) => !prev);
  };

  const [showWheel, setShowWheel] = useState(false);
  const toggleWheel = () => {
    setShowWheel((prev) => !prev);
  };

  const onPlayAudio = () => {
    const audio = document.getElementById("sound-audio") as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0; // Reset to start
      audio.play();
    }
  };

  type TeamMember =
    | "Evan DiMartinis"
    | "Camille Jwo"
    | "Jonah Offitzer"
    | "Yosh Talwar"
    | "Phil Gray"
    | "Marissa Sileo"
    | "Gus Price"
    | "Jaime Riley"
    | "George Uehling"
    | "Alex Blackson"
    | "Maggie Smith"
    | "Christian Lopez"
    | "Gabe Szczepanek"
    | "Sam Rozenfeld"
    | "Vanessa Barker"
    | "Rob Pisano"
    | "Adam Grider";

  const teams: { [key: string]: TeamMember[] } = {
    Infra: ["Gus Price", "Rob Pisano"],
    Core: [
      "Marissa Sileo",
      "Yosh Talwar",
      "Phil Gray",
      "Sam Rozenfeld",
      "Jaime Riley",
    ],
    RCM: ["Evan DiMartinis", "Camille Jwo", "Jonah Offitzer", "Adam Grider"],
    Product: ["Alex Blackson", "Vanessa Barker"],
    Design: ["Maggie Smith", "Christian Lopez"],
  };

  const absenteeMembers: TeamMember[] = ["Sam Rozenfeld"];

  /* const allMembers: { member: TeamMember; petPeeve: string }[] = [
    { member: "George Uehling", petPeeve: "Left Lane Campers" },
    {
      member: "Yosh Talwar",
      petPeeve:
        "When I pause a YouTube video to examine some detail and they overlay stupid thumbnails for other videos they think I should watch, right over where I need to look!",
    },
    {
      member: "Evan DiMartinis",
      petPeeve: "Being late to things without good reason/meandering",
    },
    {
      member: "Jaime Riley",
      petPeeve:
        "Specifically my mother chewing with her mouth open and talking",
    },
    { member: "Phil Gray", petPeeve: "Line Cutters" },
    {
      member: "Travis McAuley",
      petPeeve: "Small dogs with high pitched barks that yip away non stop",
    },
    {
      member: "Maggie Smith",
      petPeeve:
        "When you go on vacation and then get sick and can’t make it into the office but no one waters your plant and it dies",
    },
    {
      member: "Christian Lopez",
      petPeeve: "Talking on speakerphone in public places",
    },
    {
      member: "Craig O'Donnell",
      petPeeve: "Waiting around at the doctor's office",
    },
    {
      member: "Alex Blackson",
      petPeeve: "People that only want to talk about themselves",
    },
    {
      member: "Camille Jwo",
      petPeeve:
        "Drivers honking at traffic as if it's going to make a difference",
    },
  ]; */

  const scores: Record<TeamMember, number> = {
    "Evan DiMartinis": 0,
    "Camille Jwo": 6,
    "Jonah Offitzer": 8,
    "Yosh Talwar": 6,
    "Phil Gray": 5,
    "Marissa Sileo": 1,
    "Gus Price": 5,
    "Jaime Riley": 8,
    "George Uehling": 4,
    "Alex Blackson": 5,
    "Maggie Smith": 2,
    "Christian Lopez": 7,
    "Gabe Szczepanek": 4,
    "Sam Rozenfeld": 7,
    "Vanessa Barker": 2,
    "Rob Pisano": 0,
    "Adam Grider": 0,
  };

  const [checked, setChecked] = useState<{ [key: string]: boolean }>({});

  const handleCheck = (name: string) => {
    setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleToggleMember = (name: string) => {
    setSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    setPostStandupTopics([
      ...postStandupTopics,
      { topic: newTopic, members: selectedMembers },
    ]);
    setNewTopic("");
    setSelectedMembers([]);
  };

  const renderTeam = (teamName: string, members: TeamMember[]) => (
    <Paper
      key={teamName}
      sx={{
        mb: 3,
        p: 2,
        backgroundColor: "#132f4c",
        border: "2px solid #38bdf8",
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: "#7dd3fc" }}>
        {teamName}
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        {members.map((name) => (
          <FormControlLabel
            key={name}
            control={
              <Checkbox
                checked={!!checked[name] || absenteeMembers.includes(name)}
                onChange={() => handleCheck(name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCheck(name);
                  }
                }}
                sx={{
                  color: "#7dd3fc",
                  "&.Mui-checked": { color: "#7dd3fc" },
                }}
              />
            }
            label={name}
            sx={{
              backgroundColor: !!checked[name] ? "#1e3a52" : "transparent",
              color: "#e0f2fe",
              "& .MuiFormControlLabel-label": { color: "#e0f2fe" },
            }}
          />
        ))}
      </Box>
    </Paper>
  );

  return (
    <Container
      // maxWidth="sm"
      sx={{ py: 2, backgroundColor: "#0a1929", minHeight: "100vh" }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ color: "#7dd3fc", mb: 2, fontWeight: "bold" }}
      >
        Good Morning Good Morning!
      </Typography>

      <Button
        variant="outlined"
        sx={{
          color: "#7dd3fc",
          borderColor: "#7dd3fc",
          mb: 2,
          "&:hover": {
            borderColor: "#38bdf8",
            backgroundColor: "#1e3a52",
          },
        }}
        onClick={toggleQuestion}
      >
        {showQuestion ? "Hide" : "Show"} Question
      </Button>

      <Button
        variant="outlined"
        sx={{
          color: "#7dd3fc",
          borderColor: "#7dd3fc",
          mb: 2,
          "&:hover": {
            borderColor: "#38bdf8",
            backgroundColor: "#1e3a52",
          },
        }}
        onClick={toggleScoreboard}
      >
        {showScoreboard ? "Hide" : "Show"} Scoreboard
      </Button>

      {showScoreboard && (
        <Paper
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#132f4c",
            borderRadius: 2,
            border: "2px solid #38bdf8",
          }}
        >
          <Typography variant="h6" sx={{ color: "#7dd3fc" }} gutterBottom>
            ❄️ Scoreboard ⛄
          </Typography>
          <Stack spacing={1}>
            {Object.entries(scores)
              .sort((a, b) => b[1] - a[1])
              .map(([name, score]) => (
                <Box
                  key={name}
                  display="flex"
                  justifyContent="space-between"
                  px={1}
                >
                  <Typography color="#e0f2fe">{name}</Typography>
                  <Typography fontWeight="bold" color="#7dd3fc">
                    {score}
                  </Typography>
                </Box>
              ))}
          </Stack>
        </Paper>
      )}

      {showQuestion && (
        <Paper
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#132f4c",
            borderRadius: 2,
            border: "2px solid #38bdf8",
          }}
        >
          <Typography variant="h6" sx={{ color: "#7dd3fc" }} gutterBottom>
            The original Thanksgiving was held between the Pilgrims and This
            Native American tribe, that resided in Southeastern Massachussets
            and was led by Massasoit
          </Typography>

          <Button
            onClick={toggleEvansAnswer}
            variant="outlined"
            sx={{
              marginBottom: "8px",
              color: "#7dd3fc",
              borderColor: "#7dd3fc",
            }}
          >
            {showEvansAnswer ? "Hide" : "Show"} Answer
          </Button>

          {showEvansAnswer && (
            <>
              <Typography mb="24px" color="#e0f2fe">
                The Wompanoag
              </Typography>
            </>
          )}
        </Paper>
      )}

      {/* <Paper
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          border: "2px solid #0985F8",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {allMembers.map(({ member, petPeeve }) => (
          <FormControlLabel
            key={member}
            disabled
            control={
              <Checkbox
                checked={!!checked[member]}
                onChange={() => handleCheck(member)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCheck(member);
                  }
                }}
                sx={{
                  color: "#0985F8",
                  "&.Mui-checked": { color: "#0985F8" },
                }}
              />
            }
            label={petPeeve}
            sx={{
              backgroundColor: !!checked[member] ? "#E3F2FD" : "transparent",
            }}
          />
        ))}
      </Paper> */}

      <Box display="flex" gap="12px" width="100%" flexWrap="wrap">
        {Object.entries(teams)
          .slice(0, 3)
          .map(([teamName, members]) => renderTeam(teamName, members))}
      </Box>

      <Box display="flex" gap="12px" width="100%" flexWrap="wrap">
        {Object.entries(teams)
          .slice(3)
          .map(([teamName, members]) => renderTeam(teamName, members))}
      </Box>

      <Paper
        sx={{
          p: 2,
          backgroundColor: "#132f4c",
          borderRadius: 2,
          mb: 3,
          border: "2px solid #38bdf8",
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: "#7dd3fc" }}>
          Posts
        </Typography>
        <TextField
          fullWidth
          label="New Topic"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          margin="normal"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#e0f2fe",
              "& fieldset": { borderColor: "#38bdf8" },
              "&:hover fieldset": { borderColor: "#7dd3fc" },
              "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
            },
            "& .MuiInputLabel-root": { color: "#7dd3fc" },
          }}
        />
        <Stack direction="row" spacing={1} rowGap={1} flexWrap="wrap">
          {Object.values(teams)
            .flat()
            .map((name) => (
              <Chip
                key={name}
                label={name}
                clickable
                onClick={() => handleToggleMember(name)}
                sx={{
                  backgroundColor: selectedMembers.includes(name)
                    ? "#38bdf8"
                    : "#1e3a52",
                  color: "#e0f2fe",
                  "&:hover": {
                    backgroundColor: selectedMembers.includes(name)
                      ? "#7dd3fc"
                      : "#2a5070",
                  },
                  mb: 1,
                }}
              />
            ))}
        </Stack>
        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "#38bdf8",
            "&:hover": { backgroundColor: "#7dd3fc" },
          }}
          onClick={handleAddTopic}
        >
          +++++++++
        </Button>

        <Box mt={3}>
          {postStandupTopics.map((topic, idx) => (
            <Box key={idx} mb={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", color: "#e0f2fe" }}
              >
                {topic.topic}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {topic.members.map((member) => (
                  <Chip
                    key={member}
                    label={member}
                    size="small"
                    sx={{ backgroundColor: "#1e3a52", color: "#e0f2fe" }}
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      </Paper>

      <Divider sx={{ mb: 2 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#38bdf8",
            "&:hover": { backgroundColor: "#7dd3fc" },
          }}
          onClick={toggleWheel}
        >
          {showWheel ? "Hide Wheel" : "Show Wheel"}
        </Button>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            onClick={toggleScoreboard}
            sx={{
              color: "#7dd3fc",
              borderColor: "#7dd3fc",
              "&:hover": {
                borderColor: "#38bdf8",
                backgroundColor: "#1e3a52",
              },
            }}
          >
            {showScoreboard ? "Hide Scoreboard" : "Show Scoreboard"}
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#38bdf8",
              "&:hover": { backgroundColor: "#7dd3fc" },
            }}
            onClick={onPlayAudio}
          >
            Play Sound
          </Button>
        </Box>
      </Box>
      {showWheel && (
        <WheelComponent
          names={Object.entries(scores)
            .filter((x) => !absenteeMembers.includes(x[0] as TeamMember))
            .map((e) => e[0].split(" ")[0])}
        />
      )}

      <audio src="/assets/stirfry.mp3" id="sound-audio" />
    </Container>
  );
};

export default ScrumStandupMobile;
