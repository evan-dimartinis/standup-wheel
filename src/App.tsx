import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  TextField,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { format } from "date-fns";
import ClosestGuess from "./ClosestGuess";

// Define interfaces
interface ChecklistItem {
  name: string;
  checked: boolean;
  notes: string;
}

interface WheelProps {
  rotation: number;
  spinDuration: number;
  spinEasing: string;
  theme?: any; // For styled components
}

interface WheelContentProps {
  names: string[];
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
  "Christian Lopez",
  "Maggie Smith",
  "George Uehling",
  "Sabina Lowitt",
  "Gus Price",
  "Travis McAuley",
  "Yosh Talwar",
  "Camille Jwo",
  "Craig O'Donnell",
  "Tom DeHart",
  "Marissa Sileo",
  "Jonah Offitzer",
  "Jaime Riley",
  "Alex Blackson",
  "Phil Gray",
  "Evan DiMartinis",
  // "WILD CARD",
];
/* 
First Ever Ritten Annual Bi-weekly Standup 
fix everything zero
*/

/* const NAMES = [
  "HELL", // "What is your personal hell?",
  "Fav game", // "What is your favorite board game?",
  "Childhood dream", // "What was your dream job as a child?",
  "Playlist?", // "Give me a song you've been feeling lately to put into a group fun friday playlist",
  "WILD CARD",
  "HELL", // "What is your personal hell?",
  "Fav game", // "What is your favorite board game?",
  "Childhood dream", // "What was your dream job as a child?",
  "Playlist?", // "Give me a song you've been feeling lately to put into a group fun friday playlist",
  "WILD CARD",
]; */

// Styled components
const WheelContainer = styled(Box)(() => ({
  position: "relative",
  width: "540px", // Larger wheel
  height: "540px", // Larger wheel
  margin: "0 auto 12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const WheelIndicator = styled("div")(({ theme }) => ({
  position: "absolute",
  top: "-25px", // Larger indicator
  left: "50%",
  width: "50px", // Larger indicator
  height: "50px", // Larger indicator
  background: theme.palette.error.main,
  transform: "translateX(-50%) rotate(180deg)",
  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
  zIndex: 10,
}));

const Wheel = styled("div")<WheelProps>(
  ({ rotation, theme, spinDuration, spinEasing }) => ({
    width: "500px", // Larger wheel
    height: "500px", // Larger wheel
    borderRadius: "50%",
    position: "relative",
    border: `6px solid ${theme.palette.primary.main}`, // Thicker border for larger wheel
    transition: `transform ${spinDuration}s ${spinEasing}`,
    transform: `rotate(${rotation}deg)`,
  })
);

// Updated wheel rendering that uses SVG for precise slices - with larger dimensions
const WheelContent: React.FC<WheelContentProps> = ({ names }) => {
  const radius = 250; // Larger radius
  const center = radius;
  const anglePerSlice = 360 / names.length;

  return (
    <svg width="500" height="500" viewBox="0 0 500 500">
      {/* Larger SVG dimensions */}
      {names.map((name, index) => {
        const startAngle = index * anglePerSlice;
        const endAngle = (index + 1) * anglePerSlice;
        const startRad = ((startAngle - 90) * Math.PI) / 180;
        const endRad = ((endAngle - 90) * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        // Create slice path
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        const pathData = [
          `M ${center},${center}`,
          `L ${x1},${y1}`,
          `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`,
          "Z",
        ].join(" ");

        // Calculate text position (midpoint of arc)
        const midAngle = (startAngle + endAngle) / 2;
        const midRad = ((midAngle - 90) * Math.PI) / 180;
        const textDistance = radius * 0.75; // Position text 75% from center to edge
        const textX = center + textDistance * Math.cos(midRad);
        const textY = center + textDistance * Math.sin(midRad);

        // Calculate text rotation
        const textRotation = midAngle - 90;

        let color = index % 2 === 1 ? "#1890FF" : "white";
        if (name === "WILD CARD") {
          color = "#238f96";
        }

        // const color = RANDOM_COLOR_LIST[index];

        return (
          <g key={index}>
            <path
              d={pathData}
              fill={color}
              stroke="#fff"
              strokeWidth="2" // Thicker borders
            />
            <text
              x={textX}
              y={textY}
              textAnchor="middle"
              fontSize="16" // Larger text
              fontWeight="bold"
              fill="#000"
              transform={`rotate(${textRotation}, ${textX}, ${textY})`}
              style={{
                maxWidth: "100px", // Larger text area
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const App: React.FC = () => {
  // State variables
  const [spinning, setSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [spinDuration, setSpinDuration] = useState<number>(9);
  const [spinEasing, setSpinEasing] = useState<string>(
    "cubic-bezier(0.2, 0.8, 0.2, 1)"
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    NAMES.map((name) => ({ name, checked: false, notes: "" }))
  );
  const [showWheel, setShowWheel] = useState<boolean>(true);
  const [showChecklist, setShowChecklist] = useState<boolean>(true);

  const [showConfig, setShowConfig] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(
      `StandupChecklist${
        new Date().getMonth() + 1
      }${new Date().getDate()}${new Date().getFullYear()}`,
      JSON.stringify(checklist)
    );
  }, [checklist]);

  // Function to spin the wheel
  const spinWheel = (): void => {
    if (spinning) return;

    setSpinning(true);
    setSelectedName(null);

    // Play the jingle
    (document.getElementById("sound-audio") as HTMLAudioElement).play();

    // Calculate random rotation (5-10 full spins plus random position)
    const spinCount = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const newRotation = rotation + spinCount * 360 + randomAngle;

    setRotation(newRotation);

    // Determine selected name after spin completes - match the duration from state
    setTimeout(() => {
      // Calculate which slice is at the top after spinning
      const normalizedRotation = newRotation % 360;
      const sliceSize = 360 / NAMES.length;
      // We need to adjust for the fact that the wheel spins clockwise but our indexes go counterclockwise
      const selectedIndex =
        NAMES.length -
        (Math.floor(normalizedRotation / sliceSize) % NAMES.length) -
        1;
      const actualIndex =
        selectedIndex >= 0 ? selectedIndex : NAMES.length + selectedIndex;

      setSelectedName(NAMES[actualIndex]);
      setSpinning(false);

      if (NAMES[actualIndex] === "WILD CARD") {
        window.location.replace("https://dailydozentrivia.com/");
      } else {
        const u = new SpeechSynthesisUtterance(NAMES[actualIndex]);
        window.speechSynthesis.speak(u);
      }
    }, spinDuration * 1000);
  };

  // Handle checkbox changes
  const handleToggleCheck = (index: number): void => {
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

  // Handle spin duration change
  const handleSpinDurationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSpinDuration(parseFloat(event.target.value));
  };

  // Handle spin easing change
  const handleSpinEasingChange = (event: any): void => {
    setSpinEasing(event.target.value);
  };

  return (
    <Box
      display="flex"
      flex={1}
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      p={4}
      sx={{
        background: "linear-gradient(45deg, #1890FF, #FFFFFF);",
      }}
    >
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Ritten Standup {format(new Date(), "MM/dd/yyyy")}
      </Typography>

      <Typography variant="h6" component="h3" align="center" gutterBottom>
        Include Demos!
      </Typography>

      <Box
        display="flex"
        flex={1}
        justifyContent="space-between"
        width="100%"
        gap="16px"
      >
        {/* Wheel Section */}
        {showWheel && (
          <Box display="flex" flexDirection="column" flex={1} gap="8px">
            {/* Wider to accommodate larger wheel */}
            <Paper
              elevation={3}
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                background: "transparent",
                boxShadow: "none",
              }}
            >
              <WheelContainer>
                <WheelIndicator />
                <Wheel
                  rotation={rotation}
                  spinDuration={spinDuration}
                  spinEasing={spinEasing}
                >
                  <WheelContent names={NAMES} />
                </Wheel>
              </WheelContainer>

              {/* Spin controls */}
              {showConfig ? (
                <Box sx={{ width: "100%", mb: 3, mt: -4 }}>
                  <Button onClick={() => setShowConfig(false)}>
                    Hide Config
                  </Button>
                  <Box display="flex" width="100%" gap="8px">
                    <Box display="flex" flex={1} gap="8px">
                      <Typography variant="body2" gutterBottom>
                        Spin Duration: {spinDuration}s
                      </Typography>
                      <TextField
                        type="range"
                        inputProps={{
                          min: 1,
                          max: 10,
                          step: 0.5,
                        }}
                        value={spinDuration}
                        onChange={handleSpinDurationChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    </Box>
                    <Box display="flex" flex={1} gap="8px">
                      <Typography variant="body2" gutterBottom>
                        Slow Down Rate:
                      </Typography>
                      <TextField
                        select
                        value={spinEasing}
                        onChange={handleSpinEasingChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="cubic-bezier(0.2, 0.8, 0.2, 1)">
                          Smooth
                        </option>
                        <option value="cubic-bezier(0.1, 0.7, 0.1, 1)">
                          Gradual
                        </option>
                        <option value="cubic-bezier(0.3, 0.9, 0.3, 1)">
                          Quick
                        </option>
                        <option value="cubic-bezier(0, 1, 0, 1)">Abrupt</option>
                        <option value="ease-out">Standard</option>
                      </TextField>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Button onClick={() => setShowConfig(true)}>Show Config</Button>
              )}

              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={spinWheel}
                disabled={spinning}
              >
                {spinning ? "Spinning..." : "Spin the Wheel"}
              </Button>

              {selectedName && (
                <Box mt={3} textAlign="center">
                  <Typography variant="h6" component="div" gutterBottom>
                    Selected:
                  </Typography>
                  <Typography variant="h4" component="div" color="primary">
                    {selectedName}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* Checklist Section */}
        {showChecklist && (
          <Box display="flex" flexDirection="column" gap="4px" width="700px">
            {checklist
              .sort(
                (itema, itemb) =>
                  (itemb.checked ? 0 : 1) - (itema.checked ? 0 : 1)
              )
              .map((item, index) => (
                <React.Fragment key={index}>
                  <Box display="flex" flexDirection="column">
                    <ListItem sx={{ padding: "4px 8px", display: "flex" }}>
                      <ListItemIcon sx={{ height: "40px" }}>
                        <Checkbox
                          edge="start"
                          checked={item.checked}
                          onChange={() => handleToggleCheck(index)}
                          color="primary"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        sx={{
                          textDecoration: item.checked
                            ? "line-through"
                            : "none",
                          opacity: item.checked ? 0.7 : 1,
                          cursor: "pointer",
                          minWidth: "fit-content",
                          display: "flex",
                          flexShrink: 1,
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
                        sx={{ width: "400px" }}
                      />
                    </ListItem>
                    {index < checklist.length - 1 && (
                      <Divider variant="inset" />
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
      >
        <Button onClick={() => setShowWheel(!showWheel)}>
          {showWheel ? "Hide Wheel" : "Show Wheel"}
        </Button>

        <IconButton
          onClick={() => {
            (document.getElementById("sound-audio") as HTMLAudioElement).play();
          }}
        >
          <Typography variant="h5" component="h2" align="center">
            Play Sound
          </Typography>
        </IconButton>

        <Button onClick={() => setShowChecklist(!showChecklist)}>
          {showChecklist ? "Hide Checklist" : "Show Checklist"}
        </Button>
      </Box>
      <audio src="/assets/FourFlushin.mp3" id="sound-audio" />
    </Box>
  );
};

const ClosestGuessApp = () => {
  return <ClosestGuess />;
};

export default ClosestGuessApp;
