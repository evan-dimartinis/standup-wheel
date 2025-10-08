import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Button,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  TextField,
  Divider,
} from "@mui/material";
import { format } from "date-fns";
import WheelComponent from "./components/wheel";
import V2 from "./components/V2";
import V3 from "./v3/V3";

// Define interfaces
interface ChecklistItem {
  name: string;
  checked: boolean;
  notes: string;
}

/**
 * Generates a random hex color code.
 * @returns A string representing a random hex color code, including the '#' prefix.
 */
function generateRandomHexColor(): string {
  // Generate a random number between 0 and 16,777,215 (FFFFFF in hex)
  const randomNumber = Math.floor(Math.random() * 16777216);

  // Convert to hex and ensure it has 6 digits with leading zeros if needed
  const hexColor = randomNumber.toString(16).padStart(6, "0");

  // Return with '#' prefix
  return `#${hexColor}`;
}

const RANDOM_COLOR_LIST = [
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
  generateRandomHexColor(),
];

// Hardcoded list of names
const NAMES: string[] = [
  // "Christian Lopez",
  "Maggie Smith", // 1
  "George Uehling", // 2
  "Gus Price", // 1
  "Travis McAuley",
  // "Yosh Talwar", // 2
  "Camille Jwo",
  "Craig O'Donnell",
  "Marissa Sileo", // 0.5
  "Jonah Offitzer", // 2
  "Jaime Riley", // 1
  "Alex Blackson",
  "Phil Gray", // 0.5
  // "Gabe Szczepanek", // 1
  "Evan DiMartinis",
  // "WILD CARD",
];

// Fun emoji list for wacky mode
const EMOJIS = ["🚀", "✨", "🎉", "🔥", "💯", "🌈", "🦄", "🤩", "🎸", "🍕"];

const App: React.FC = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    NAMES.map((name) => ({ name, checked: false, notes: "" }))
  );
  const [showWheel, setShowWheel] = useState<boolean>(false);
  const [showChecklist, setShowChecklist] = useState<boolean>(true);
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const [isWacky, setIsWacky] = useState<boolean>(false);
  const [bounceEffect, setBounceEffect] = useState<number>(-1);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem(
      `StandupChecklist${
        new Date().getMonth() + 1
      }${new Date().getDate()}${new Date().getFullYear()}`,
      JSON.stringify(checklist)
    );
  }, [checklist]);

  // Wacky rotation effect
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 100);

    return () => clearInterval(rotationInterval);
  }, []);

  // Handle checkbox changes with bounce effect
  const handleToggleCheck = (index: number): void => {
    setBounceEffect(index);
    setTimeout(() => setBounceEffect(-1), 500);

    setChecklist((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        checked: !updated[index].checked,
      };
      return updated;
    });
  };

  // Handle notes changes
  const handleNoteChange = (index: number, value: string): void => {
    setChecklist((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        notes: value,
      };
      return updated;
    });
  };

  const onPlaySound = () => {
    const audio = document.getElementById("sound-audio") as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0; // Reset to start
      audio.play();
    }
  };

  // Get random emoji
  const getRandomEmoji = () => {
    return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  };

  return <V2 />;

  return (
    <Box
      display="flex"
      flex={1}
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      p={4}
      sx={{
        background: `linear-gradient(45deg, #1890FF, #FFFFFF, #1890FF)`,
        backgroundSize: "200% 200%",
        animation: "gradientShift 10s ease infinite",
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          /* background:
            'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="3" fill="rgba(255,255,255,0.2)"/></svg>\')', */
          opacity: 0.4,
          zIndex: 0,
        },
        "@keyframes gradientShift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        align="center"
        gutterBottom
        sx={{
          fontFamily: "'Comic Sans MS', cursive, sans-serif",
          fontWeight: "bold",
          color: "#0066cc",
          textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
          /* animation: "wiggle 1s ease-in-out infinite",
          "@keyframes wiggle": {
            "0%, 100%": { transform: "rotate(-2deg)" },
            "50%": { transform: "rotate(2deg)" },
          }, */
        }}
      >
        What are you Demoing today at Sprint Review?
      </Typography>

      {showQuestion && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          p="16px"
          bgcolor={"white"}
          mb="12px"
          borderRadius="8px"
        >
          <Typography variant="h6" align="center" gutterBottom>
            Name the 2 celebrities mashed up in this photo
          </Typography>

          <img
            style={{
              height: "360px",
              width: "600px",
            }}
            src="/assets/novak-dreyfuss.png"
            alt="Chocolate pic"
          />
        </Box>
      )}

      {/* <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{
            padding: "10px",
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            fontStyle: "italic",
            // transform: `rotate(${Math.sin(rotation / 20) * 3}deg)`,
            transition: "transform 0.3s ease",
          }}
        >
          What country produces the SECOND-most coffee in the world? (behind
          Brazil as the #1)
        </Typography> */}
      {/* */}
      {/*  */}

      {/* <Typography
        variant="h6"
        align="center"
        gutterBottom
        sx={{
          padding: "10px",
          backgroundColor: "rgba(255,255,255,0.7)",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          fontStyle: "italic",
          // transform: `rotate(${Math.sin(rotation / 20) * 3}deg)`,
          transition: "transform 0.3s ease",
        }}
      >
        Bring up any tech debt that you have noticed recently!
      </Typography>

      <Typography
        variant="h6"
        align="center"
        gutterBottom
        sx={{
          padding: "10px",
          backgroundColor: "rgba(255,255,255,0.7)",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          fontStyle: "italic",
          // transform: `rotate(${Math.sin(rotation / 20) * 3}deg)`,
          transition: "transform 0.3s ease",
        }}
      >
        Tell me if you have anything to demo today in sprint retro!
      </Typography> */}

      <Box
        display="flex"
        flex={1}
        justifyContent="space-between"
        width="100%"
        gap="16px"
        sx={{
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "flex-start" },
        }}
      >
        {/* Wheel Section */}
        {showWheel && (
          <Box
            sx={{
              animation: "float 6s ease-in-out infinite",
              "@keyframes float": {
                "0%, 100%": { transform: "translateY(0px)" },
                "50%": { transform: "translateY(-15px)" },
              },
            }}
          >
            <WheelComponent names={NAMES} />
          </Box>
        )}

        {/* Checklist Section */}
        {showChecklist && (
          <Box
            display="flex"
            flexDirection="column"
            gap="4px"
            width="700px"
            sx={{
              backgroundColor: "rgba(255,255,255,0.7)",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 8px 16px rgba(0,102,204,0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 24px rgba(0,102,204,0.3)",
                transform: "translateY(-5px)",
              },
            }}
          >
            {checklist
              .sort(
                (itema, itemb) =>
                  (itemb.checked ? 0 : 1) - (itema.checked ? 0 : 1)
              )
              .map((item, index) => (
                <React.Fragment key={index}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    sx={{
                      animation:
                        bounceEffect === index ? "bounce 0.5s ease" : "none",
                      "@keyframes bounce": {
                        "0%, 100%": { transform: "scale(1)" },
                        "50%": { transform: "scale(1.05)" },
                      },
                    }}
                  >
                    <ListItem
                      sx={{
                        padding: "8px 12px",
                        display: "flex",
                        borderRadius: "8px",
                        backgroundColor: item.checked
                          ? "rgba(0,102,204,0.1)"
                          : "transparent",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: item.checked
                            ? "rgba(0,102,204,0.15)"
                            : "rgba(255,255,255,0.5)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ height: "40px" }}>
                        <Checkbox
                          edge="start"
                          checked={item.checked}
                          onChange={() => handleToggleCheck(index)}
                          color="primary"
                          sx={{
                            "& .MuiSvgIcon-root": {
                              fontSize: 28,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.2)",
                              },
                            },
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <span>
                            {item.name} {item.checked}
                          </span>
                        }
                        sx={{
                          textDecoration: item.checked
                            ? "line-through"
                            : "none",
                          opacity: item.checked ? 0.7 : 1,
                          cursor: "pointer",
                          minWidth: "fit-content",
                          display: "flex",
                          flexShrink: 1,
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                        }}
                        onClick={() => handleToggleCheck(index)}
                      />
                      <TextField
                        label="Notes"
                        value={item.notes}
                        onChange={(e) =>
                          handleNoteChange(index, e.target.value)
                        }
                        variant="outlined"
                        size="small"
                        sx={{
                          width: "400px",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              "& fieldset": {
                                borderColor: "#1890FF",
                              },
                            },
                          },
                        }}
                      />
                    </ListItem>
                    {index < checklist.length - 1 && (
                      <Divider
                        variant="middle"
                        sx={{ borderStyle: "dashed" }}
                      />
                    )}
                  </Box>
                </React.Fragment>
              ))}
          </Box>
        )}
      </Box>

      <Box
        display="flex"
        gap="32px"
        width="100%"
        alignItems="center"
        justifyContent="center"
        mt={4}
      >
        <Button
          onClick={() => setShowWheel(!showWheel)}
          variant="contained"
          sx={{
            borderRadius: "20px",
            padding: "10px 20px",
            fontWeight: "bold",
            background: "linear-gradient(45deg, #1890FF, #74b9ff)",
            boxShadow: "0 4px 8px rgba(0,102,204,0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-3px) scale(1.05)",
              boxShadow: "0 6px 12px rgba(0,102,204,0.4)",
            },
          }}
        >
          {showWheel ? "🙈 Hide Wheel" : "🎡 Show Wheel"}
        </Button>

        <Button
          onClick={() => {
            setShowQuestion(!showQuestion);
          }}
          variant="contained"
          sx={{
            borderRadius: "20px",
            padding: "10px 20px",
            fontWeight: "bold",
            background: "linear-gradient(45deg, #1890FF, #74b9ff)",
            boxShadow: "0 4px 8px rgba(0,102,204,0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-3px) scale(1.05)",
              boxShadow: "0 6px 12px rgba(0,102,204,0.4)",
            },
          }}
        >
          {showQuestion ? "🤫 Hide Question" : "🤔 Show Question"}
        </Button>

        <Button
          onClick={() => setShowChecklist(!showChecklist)}
          variant="contained"
          sx={{
            borderRadius: "20px",
            padding: "10px 20px",
            fontWeight: "bold",
            background: "linear-gradient(45deg, #1890FF, #74b9ff)",
            boxShadow: "0 4px 8px rgba(0,102,204,0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-3px) scale(1.05)",
              boxShadow: "0 6px 12px rgba(0,102,204,0.4)",
            },
          }}
        >
          {showChecklist ? "📝 Hide Checklist" : "📋 Show Checklist"}
        </Button>

        <Button
          onClick={onPlaySound}
          variant="contained"
          sx={{
            borderRadius: "20px",
            padding: "10px 20px",
            fontWeight: "bold",
            background: "linear-gradient(45deg, #1890FF, #74b9ff)",
            boxShadow: "0 4px 8px rgba(0,102,204,0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-3px) scale(1.05)",
              boxShadow: "0 6px 12px rgba(0,102,204,0.4)",
            },
          }}
        >
          Play Sound
        </Button>
      </Box>

      <Button
        onClick={() => setIsWacky(!isWacky)}
        variant="outlined"
        sx={{
          mt: 2,
          borderRadius: "20px",
          borderWidth: "2px",
          borderColor: "#1890FF",
          color: "#1890FF",
          fontWeight: "bold",
          animation: "pulse 2s infinite",
          "@keyframes pulse": {
            "0%": {
              boxShadow: "0 0 0 0 rgba(24, 144, 255, 0.4)",
            },
            "70%": {
              boxShadow: "0 0 0 10px rgba(24, 144, 255, 0)",
            },
            "100%": {
              boxShadow: "0 0 0 0 rgba(24, 144, 255, 0)",
            },
          },
        }}
      >
        {isWacky ? "🧐 Normal Mode" : "🤪 Wacky Mode!"}
      </Button>

      <audio src="/assets/MondayMorning.mp3" id="sound-audio" />

      {/* Floating bubbles for extra wackiness */}
      {isWacky &&
        Array.from({ length: 10 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              fontSize: `${Math.random() * 30 + 20}px`,
              opacity: 0.6,
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
              zIndex: 0,
              animation: `float-bubble ${
                Math.random() * 10 + 10
              }s linear infinite`,
              "@keyframes float-bubble": {
                "0%": { transform: "translateY(100vh) rotate(0deg)" },
                "100%": { transform: "translateY(-100px) rotate(360deg)" },
              },
            }}
          >
            {EMOJIS[Math.floor(Math.random() * EMOJIS.length)]}
          </Box>
        ))}
    </Box>
  );
};

export default App;
