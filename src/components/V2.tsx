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
    | "Travis McAuley"
    | "Jaime Riley"
    | "Craig O'Donnell"
    | "George Uehling"
    | "Alex Blackson"
    | "Maggie Smith"
    | "Christian Lopez"
    | "Gabe Szczepanek";

  const teams: { [key: string]: TeamMember[] } = {
    AI: ["Travis McAuley", "Gus Price", "Jaime Riley", "Craig O'Donnell"],
    Core: ["Marissa Sileo", "Yosh Talwar", "Phil Gray"],
    RCM: ["Evan DiMartinis", "Camille Jwo", "Jonah Offitzer"],
    Product: ["George Uehling", "Alex Blackson"],
    Design: ["Maggie Smith", "Christian Lopez"],
  };

  const scores: Record<TeamMember, number> = {
    "Evan DiMartinis": 0,
    "Camille Jwo": 0,
    "Jonah Offitzer": 2,
    "Yosh Talwar": 2,
    "Phil Gray": 0,
    "Marissa Sileo": 0,
    "Gus Price": 1,
    "Travis McAuley": 0,
    "Jaime Riley": 1,
    "Craig O'Donnell": 0,
    "George Uehling": 2,
    "Alex Blackson": 0,
    "Maggie Smith": 1,
    "Christian Lopez": 0,
    "Gabe Szczepanek": 1,
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
                checked={!!checked[name]}
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
        Fun Friday!!!!
      </Typography>

      <Button
        variant="outlined"
        onClick={toggleScoreboard}
        sx={{
          mb: 2,
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
            Fun Friday Question: What job would you least want or be the worst
            at?
          </Typography>

          <Button
            onClick={toggleEvansAnswer}
            variant="outlined"
            sx={{
              marginBottom: "8px",
            }}
          >
            {showEvansAnswer ? "Hide" : "Show"} Evan's Answer
          </Button>

          {showEvansAnswer && (
            <>
              <Typography mb="24px">
                Evan's answer: Anything in a lab. I would be nervous all the
                time + I have very shaky hands
              </Typography>

              <Typography>Happy Friday! have a great weekend 🫡</Typography>
            </>
          )}
        </Paper>
      )}

      <Paper
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          border: "2px solid #0985F8",
        }}
      >
        <Typography variant="h6" sx={{ color: "#0985F8" }} gutterBottom>
          Retro Reminders!
        </Typography>
        <Stack spacing={1}>
          <ListItem>
            <Typography>Do holistic reviews every time through</Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Don't cram work at the end of your sprint - stay balanced
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>Be open to new code patterns!</Typography>
          </ListItem>
        </Stack>
      </Paper>

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
            sx={{
              color: "#0985F8",
              borderColor: "#0985F8",
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
        <WheelComponent names={Object.entries(scores).map((e) => e[0])} />
      )}

      <audio src="/assets/New.mp3" id="sound-audio" />
    </Container>
  );
};

export default ScrumStandupMobile;
