import React, { useState } from "react";
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

  const [showScoreboard, setShowScoreboard] = useState(false);
  const toggleScoreboard = () => {
    setShowScoreboard((prev) => !prev);
  };

  const [showWheel, setShowWheel] = useState(false);
  const toggleWheel = () => {
    setShowWheel((prev) => !prev);
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
    | "Christian Lopez";

  const teams: { [key: string]: TeamMember[] } = {
    AI: ["Gus Price", "Travis McAuley", "Jaime Riley", "Craig O'Donnell"],
    Core: ["Yosh Talwar", "Phil Gray", "Marissa Sileo"],
    RCM: ["Evan DiMartinis", "Camille Jwo", "Jonah Offitzer"],
    Product: ["George Uehling", "Alex Blackson"],
    Design: ["Maggie Smith", "Christian Lopez"],
  };

  const scores: Record<TeamMember, number> = {
    "Evan DiMartinis": 0,
    "Camille Jwo": 0,
    "Jonah Offitzer": 0,
    "Yosh Talwar": 0,
    "Phil Gray": 0,
    "Marissa Sileo": 0,
    "Gus Price": 0,
    "Travis McAuley": 0,
    "Jaime Riley": 0,
    "Craig O'Donnell": 0,
    "George Uehling": 0,
    "Alex Blackson": 0,
    "Maggie Smith": 0,
    "Christian Lopez": 0,
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

  return (
    <Container
      // maxWidth="sm"
      sx={{ py: 2, backgroundColor: "#D1E9FF", minHeight: "100vh" }}
    >
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

      {Object.entries(teams).map(([teamName, members]) => (
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
      ))}

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
      {showWheel && (
        <WheelComponent names={Object.entries(scores).map((e) => e[0])} />
      )}
    </Container>
  );
};

export default ScrumStandupMobile;
