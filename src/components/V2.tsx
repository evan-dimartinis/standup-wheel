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
    | "Craig O'Donnell"
    | "George Uehling"
    | "Alex Blackson"
    | "Maggie Smith"
    | "Christian Lopez"
    | "Gabe Szczepanek"
    | "Sam Rozenfeld"
    | "Vanessa Barker";

  const absenteeMembers: TeamMember[] = [];

  const teams: { [key: string]: TeamMember[] } = {
    AI: ["Gus Price", "Jaime Riley", "Craig O'Donnell"],
    Core: ["Marissa Sileo", "Yosh Talwar", "Phil Gray", "Sam Rozenfeld"],
    RCM: ["Evan DiMartinis", "Camille Jwo", "Jonah Offitzer"],
    Product: ["George Uehling", "Alex Blackson", "Vanessa Barker"],
    Design: ["Maggie Smith", "Christian Lopez"],
  };

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
    "Camille Jwo": 3,
    "Jonah Offitzer": 4,
    "Yosh Talwar": 5,
    "Phil Gray": 2,
    "Marissa Sileo": 0,
    "Gus Price": 3,
    "Jaime Riley": 7,
    "Craig O'Donnell": 2,
    "George Uehling": 2,
    "Alex Blackson": 4,
    "Maggie Smith": 2,
    "Christian Lopez": 1,
    "Gabe Szczepanek": 4,
    "Sam Rozenfeld": 4,
    "Vanessa Barker": 0,
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
        backgroundColor: "#ffffff",
        border: "2px solid #0985F8",
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: "#0985F8" }}>
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
                  color: "#0985F8",
                  "&.Mui-checked": { color: "#0985F8" },
                }}
              />
            }
            label={name}
            sx={{
              backgroundColor: !!checked[name] ? "#E3F2FD" : "transparent",
            }}
          />
        ))}
      </Box>
    </Paper>
  );

  return (
    <Container
      // maxWidth="sm"
      sx={{ py: 2, backgroundColor: "#D1E9FF", minHeight: "100vh" }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ color: "#0985F8", mb: 2, fontWeight: "bold" }}
      >
        Good Morning!
      </Typography>

      <Button
        variant="outlined"
        sx={{
          color: "#0985F8",
          borderColor: "#0985F8",
          mb: 2,
          "&:hover": {
            borderColor: "#0667C5",
            backgroundColor: "#E3F2FD",
          },
        }}
        onClick={toggleQuestion}
      >
        {showQuestion ? "Hide" : "Show"} Question
      </Button>

      <Button
        variant="outlined"
        sx={{
          color: "#0985F8",
          borderColor: "#0985F8",
          mb: 2,
          "&:hover": {
            borderColor: "#0667C5",
            backgroundColor: "#E3F2FD",
          },
        }}
        onClick={toggleScoreboard}
      >
        {showScoreboard ? "Hide" : "Show"} Scoreboard
      </Button>

      {showScoreboard && (
        <Paper
          sx={{ mb: 3, p: 2, backgroundColor: "#ffffff", borderRadius: 2 }}
        >
          <Typography variant="h6" sx={{ color: "#0985F8" }} gutterBottom>
            Scoreboard
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
                  <Typography>{name}</Typography>
                  <Typography fontWeight="bold" color="#0985F8">
                    {score}
                  </Typography>
                </Box>
              ))}
          </Stack>
        </Paper>
      )}

      {showQuestion && (
        <Paper
          sx={{ mb: 3, p: 2, backgroundColor: "#ffffff", borderRadius: 2 }}
        >
          <Typography variant="h6" sx={{ color: "#0985F8" }} gutterBottom>
            What small creature, often seen after rain, has been known to
            hibernate for up to three years when facing drought?
          </Typography>

          <Button
            onClick={toggleEvansAnswer}
            variant="outlined"
            sx={{
              marginBottom: "8px",
            }}
          >
            {showEvansAnswer ? "Hide" : "Show"} Answer
          </Button>

          {showEvansAnswer && (
            <>
              <Typography mb="24px">Snails</Typography>
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

      <Paper sx={{ p: 2, backgroundColor: "#ffffff", borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: "#0985F8" }}>
          Posts
        </Typography>
        <TextField
          fullWidth
          label="New Topic"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          margin="normal"
          variant="outlined"
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
                    ? "#0985F8"
                    : "#E3F2FD",
                  color: selectedMembers.includes(name) ? "#fff" : "#000",
                  "&:hover": {
                    backgroundColor: selectedMembers.includes(name)
                      ? "#0667C5"
                      : "#BBDEFB",
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
            backgroundColor: "#0985F8",
            "&:hover": { backgroundColor: "#0667C5" },
          }}
          onClick={handleAddTopic}
        >
          +++++++++
        </Button>

        <Box mt={3}>
          {postStandupTopics.map((topic, idx) => (
            <Box key={idx} mb={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {topic.topic}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {topic.members.map((member) => (
                  <Chip
                    key={member}
                    label={member}
                    size="small"
                    sx={{ backgroundColor: "#E3F2FD" }}
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
            backgroundColor: "#0985F8",
            "&:hover": { backgroundColor: "#0667C5" },
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
              color: "#0985F8",
              borderColor: "#0985F8",
              "&:hover": {
                borderColor: "#0667C5",
                backgroundColor: "#E3F2FD",
              },
            }}
          >
            {showScoreboard ? "Hide Scoreboard" : "Show Scoreboard"}
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#0985F8",
              "&:hover": { backgroundColor: "#0667C5" },
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

      <audio src="/assets/Catastrophe.mp3" id="sound-audio" />
    </Container>
  );
};

export default ScrumStandupMobile;
