import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Clear } from "@mui/icons-material";

const SUPABASE_URL = "https://glayielrecttnoxkmcjv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYXlpZWxyZWN0dG5veGttY2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNTkyMTEsImV4cCI6MjA1OTgzNTIxMX0.6e4wlmIt-W8UiExHUHFqEto6PokEaFUAHE0tHJnXP-8";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types for database tables
type Guess = {
  id?: number;
  name: string;
  guess: number;
  created_at?: string;
};

type Question = {
  id?: number;
  question: string;
  answer: number;
  created_at?: string;
  active?: boolean;
};

// Guest guess submission component
const ClosestGuessGuess = () => {
  const [name, setName] = useState<string>("");
  const [guess, setGuess] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch the currently active question
  useEffect(() => {
    const fetchActiveQuestion = async () => {
      try {
        const { data, error } = await supabase
          .from("closest_guess_questions")
          .select("*")
          .eq("active", true)
          .single();

        if (error) {
          console.error("Error fetching active question:", error);
        } else if (data) {
          setActiveQuestion(data);
        }
      } catch (error) {
        console.error("Failed to fetch active question:", error);
      }
    };

    fetchActiveQuestion();
  }, []);

  const upsertGuess = async () => {
    if (!name || guess === null) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("closest_guess")
        .upsert({ name, guess });

      if (error) {
        console.error("Error upserting guess:", error);
        setNotification({
          type: "error",
          message: "Failed to submit your guess. Please try again.",
        });
      } else {
        setNotification({
          type: "success",
          message: "Your guess has been submitted successfully!",
        });
        // Reset form
        setName("");
        setGuess(null);
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
      setNotification({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Card elevation={3}>
          <CardContent>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{ mb: 3 }}
            >
              Closest Guess Challenge
            </Typography>

            {activeQuestion ? (
              <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: "#f8f9fa" }}>
                <Typography variant="h6" gutterBottom>
                  Current Question:
                </Typography>
                <Typography variant="body1" paragraph>
                  {activeQuestion.question}
                </Typography>
              </Paper>
            ) : (
              <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: "#f8f9fa" }}>
                <Typography variant="body1" align="center">
                  No active question at the moment. Please check back later.
                </Typography>
              </Paper>
            )}

            <Box component="form" sx={{ mt: 3 }}>
              <TextField
                label="Your Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                margin="normal"
                disabled={!activeQuestion || loading}
              />

              <TextField
                label="Your Guess"
                variant="outlined"
                type="number"
                value={guess === null ? "" : guess}
                onChange={(e) =>
                  setGuess(
                    e.target.value === "" ? null : parseFloat(e.target.value)
                  )
                }
                fullWidth
                margin="normal"
                disabled={!activeQuestion || loading}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={upsertGuess}
                disabled={!name || guess === null || !activeQuestion || loading}
                fullWidth
                size="large"
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Submit Your Guess"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {notification && (
        <Snackbar
          open={notification !== null}
          autoHideDuration={6000}
          onClose={closeNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={closeNotification}
            severity={notification.type}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

// Admin panel component
const ClosestGuessAdmin = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [newQuestion, setNewQuestion] = useState<{
    question: string;
    answer: number | null;
  }>({ question: "", answer: null });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [truncateDialogOpen, setTruncateDialogOpen] = useState<boolean>(false);

  // Fetch questions and guesses on component mount
  useEffect(() => {
    fetchQuestions();
    fetchGuesses();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("closest_guess_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching questions:", error);
        setNotification({
          type: "error",
          message: "Failed to load questions.",
        });
      } else {
        setQuestions(data || []);
        // Find active question index
        const activeIndex = data?.findIndex((q) => q.active === true) || 0;
        if (activeIndex >= 0) {
          setCurrentQuestionIndex(activeIndex);
        }
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setNotification({
        type: "error",
        message: "An unexpected error occurred while loading questions.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGuesses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("closest_guess")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching guesses:", error);
        setNotification({ type: "error", message: "Failed to load guesses." });
      } else {
        setGuesses(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch guesses:", error);
      setNotification({
        type: "error",
        message: "An unexpected error occurred while loading guesses.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSetInactive = async (questionId: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("closest_guess_questions")
        .update({ active: false })
        .eq("id", questionId);
      if (error) {
        console.error("Error setting question inactive:", error);
        setNotification({
          type: "error",
          message: "Failed to set question inactive.",
        });
      } else {
        setNotification({
          type: "success",
          message: "Question set to inactive successfully.",
        });
        // Refresh questions
        fetchQuestions();
      }
    } catch (error) {
      console.error("Failed to set question inactive:", error);
      setNotification({
        type: "error",
        message: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const setActiveQuestion = async (questionId?: number) => {
    setLoading(true);
    try {
      // First, set all questions to inactive
      await supabase
        .from("closest_guess_questions")
        .update({ active: false })
        .neq("id", -1); // This will update all rows

      if (!questionId) {
        fetchQuestions();
        return;
      }

      // Then set the selected question to active
      const { error } = await supabase
        .from("closest_guess_questions")
        .update({ active: true })
        .eq("id", questionId);

      if (error) {
        console.error("Error setting active question:", error);
        setNotification({
          type: "error",
          message: "Failed to set active question.",
        });
      } else {
        setNotification({
          type: "success",
          message: "Active question updated successfully.",
        });
        // Refresh questions
        fetchQuestions();
      }
    } catch (error) {
      console.error("Failed to set active question:", error);
      setNotification({
        type: "error",
        message: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addNewQuestion = async () => {
    if (!newQuestion.question || newQuestion.answer === null) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("closest_guess_questions").insert({
        question: newQuestion.question,
        answer: newQuestion.answer,
        active: false,
      });

      if (error) {
        console.error("Error adding question:", error);
        setNotification({
          type: "error",
          message: "Failed to add new question.",
        });
      } else {
        setNotification({
          type: "success",
          message: "New question added successfully.",
        });
        setNewQuestion({ question: "", answer: null });
        setDialogOpen(false);
        // Refresh questions
        fetchQuestions();
      }
    } catch (error) {
      console.error("Failed to add question:", error);
      setNotification({
        type: "error",
        message: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const truncateGuesses = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("closest_guess")
        .delete()
        .neq("id", -1); // This will delete all rows

      if (error) {
        console.error("Error truncating guesses:", error);
        setNotification({
          type: "error",
          message: "Failed to clear all guesses.",
        });
      } else {
        setNotification({
          type: "success",
          message: "All guesses have been cleared successfully.",
        });
        setTruncateDialogOpen(false);
        // Refresh guesses
        fetchGuesses();
      }
    } catch (error) {
      console.error("Failed to truncate guesses:", error);
      setNotification({
        type: "error",
        message: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const navigateToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const openNewQuestionDialog = () => {
    setDialogOpen(true);
  };

  const closeNewQuestionDialog = () => {
    setDialogOpen(false);
  };

  const openTruncateDialog = () => {
    setTruncateDialogOpen(true);
  };

  const closeTruncateDialog = () => {
    setTruncateDialogOpen(false);
  };

  const getCurrentQuestion = (): Question | null => {
    return questions.length > 0 && currentQuestionIndex < questions.length
      ? questions[currentQuestionIndex]
      : null;
  };

  const currentQuestion = getCurrentQuestion();

  const getClosestGuess = (): {
    guess: Guess | null;
    distance: number;
  } | null => {
    if (!currentQuestion || guesses.length === 0) return null;

    const correctAnswer = currentQuestion.answer;
    let closestGuess: Guess | null = null;
    let minDistance = Number.MAX_SAFE_INTEGER;

    guesses.forEach((guess) => {
      // Ensure guess and correctAnswer are numbers
      const guessValue = Number(guess.guess);
      const answerValue = Number(correctAnswer);

      if (isNaN(guessValue) || isNaN(answerValue)) {
        console.error("Invalid number value:", {
          guess: guessValue,
          answer: answerValue,
        });
        return;
      }

      const distance = Math.abs(guessValue - answerValue);
      if (distance < minDistance) {
        minDistance = distance;
        closestGuess = guess;
      }
    });

    // Only return a result if we found a closest guess
    return closestGuess ? { guess: closestGuess, distance: minDistance } : null;
  };

  const getFarthestGuess = (): {
    guess: Guess | null;
    distance: number;
  } | null => {
    if (!currentQuestion || guesses.length === 0) return null;

    const correctAnswer = currentQuestion.answer;
    let farthestGuess: Guess | null = null;
    let maxDistance = -1;

    guesses.forEach((guess) => {
      // Ensure guess and correctAnswer are numbers
      const guessValue = Number(guess.guess);
      const answerValue = Number(correctAnswer);

      if (isNaN(guessValue) || isNaN(answerValue)) {
        console.error("Invalid number value:", {
          guess: guessValue,
          answer: answerValue,
        });
        return;
      }

      const distance = Math.abs(guessValue - answerValue);
      if (distance > maxDistance) {
        maxDistance = distance;
        farthestGuess = guess;
      }
    });

    // Only return a result if we found a farthest guess
    return farthestGuess
      ? { guess: farthestGuess, distance: maxDistance }
      : null;
  };

  const closestGuessResult = getClosestGuess();
  const farthestGuessResult = getFarthestGuess();

  return (
    <Container maxWidth="md">
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Closest Guess Admin Panel
          </Typography>
          <Button color="inherit" component={Link} to="/guess">
            Go to Guest View
          </Button>
        </Toolbar>
      </AppBar>

      <Box display="flex" flexDirection="column" gap={3}>
        {/* Questions Section */}
        <Card elevation={3}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h5">Questions</Typography>
              <Box>
                {currentQuestion?.active && (
                  <Button
                    variant="contained"
                    startIcon={<Clear />}
                    onClick={() => setActiveQuestion(undefined)}
                    sx={{ mr: 1 }}
                  >
                    Set Inactive
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openNewQuestionDialog}
                  sx={{ mr: 1 }}
                >
                  Add Question
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchQuestions}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            {loading && questions.length === 0 ? (
              <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress />
              </Box>
            ) : questions.length === 0 ? (
              <Paper elevation={1} sx={{ p: 3, bgcolor: "#f8f9fa" }}>
                <Typography align="center">
                  No questions available. Add a new question to get started.
                </Typography>
              </Paper>
            ) : (
              <>
                <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: "#f8f9fa" }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <IconButton
                      onClick={navigateToPreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="subtitle1">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </Typography>
                    <IconButton
                      onClick={navigateToNextQuestion}
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </Box>

                  {currentQuestion && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        {currentQuestion.question}
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mt={2}
                      >
                        <Chip
                          label={`Answer: ${currentQuestion.answer}`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={currentQuestion.active ? "Active" : "Inactive"}
                          color={currentQuestion.active ? "success" : "default"}
                          variant="outlined"
                        />
                      </Box>
                      {!currentQuestion.active && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setActiveQuestion(currentQuestion.id!)}
                          fullWidth
                          sx={{ mt: 2 }}
                          disabled={loading}
                        >
                          Set as Active Question
                        </Button>
                      )}
                    </>
                  )}
                </Paper>
              </>
            )}
          </CardContent>
        </Card>

        {/* Guesses Section */}
        <Card elevation={3}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h5">Guesses</Typography>
              <Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={openTruncateDialog}
                  sx={{ mr: 1 }}
                >
                  Clear All Guesses
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchGuesses}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            {loading && guesses.length === 0 ? (
              <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress />
              </Box>
            ) : guesses.length === 0 ? (
              <Paper elevation={1} sx={{ p: 3, bgcolor: "#f8f9fa" }}>
                <Typography align="center">
                  No guesses submitted yet.
                </Typography>
              </Paper>
            ) : (
              <>
                {currentQuestion && (
                  <Box mb={3}>
                    <Typography variant="h6" gutterBottom>
                      Results for current question:
                    </Typography>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      sx={{ mb: 2 }}
                    >
                      <Paper
                        elevation={1}
                        sx={{ p: 2, flex: 1, bgcolor: "#e8f5e9" }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          Correct Answer
                        </Typography>
                        <Typography variant="h5">
                          {currentQuestion.answer}
                        </Typography>
                      </Paper>

                      {guesses.length > 0 ? (
                        <>
                          {closestGuessResult && closestGuessResult.guess && (
                            <Paper
                              elevation={1}
                              sx={{ p: 2, flex: 1, bgcolor: "#e3f2fd" }}
                            >
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Closest Guess
                              </Typography>
                              <Typography variant="h5">
                                {closestGuessResult.guess.guess}
                              </Typography>
                              <Typography variant="body2">
                                by {closestGuessResult.guess.name} (off by{" "}
                                {closestGuessResult.distance.toFixed(2)})
                              </Typography>
                            </Paper>
                          )}

                          {farthestGuessResult && farthestGuessResult.guess && (
                            <Paper
                              elevation={1}
                              sx={{ p: 2, flex: 1, bgcolor: "#ffebee" }}
                            >
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Farthest Guess
                              </Typography>
                              <Typography variant="h5">
                                {farthestGuessResult.guess.guess}
                              </Typography>
                              <Typography variant="body2">
                                by {farthestGuessResult.guess.name} (off by{" "}
                                {farthestGuessResult.distance.toFixed(2)})
                              </Typography>
                            </Paper>
                          )}
                        </>
                      ) : (
                        <Paper
                          elevation={1}
                          sx={{ p: 2, flex: 2, bgcolor: "#f5f5f5" }}
                        >
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            No guesses yet
                          </Typography>
                          <Typography variant="body2">
                            Waiting for participants to submit their guesses.
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  </Box>
                )}

                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  All Submitted Guesses:
                </Typography>

                <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                  {guesses.map((guess, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 1,
                        bgcolor:
                          currentQuestion &&
                          closestGuessResult?.guess?.id === guess.id
                            ? "#e3f2fd" // Closest guess - light blue
                            : currentQuestion &&
                              farthestGuessResult?.guess?.id === guess.id
                            ? "#ffebee" // Farthest guess - light red
                            : "white",
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle1">
                          <strong>{guess.name}</strong>
                        </Typography>
                        <Typography variant="h6">{guess.guess}</Typography>
                      </Box>
                      {currentQuestion && (
                        <Typography variant="body2" color="text.secondary">
                          {Math.abs(
                            Number(guess.guess) - Number(currentQuestion.answer)
                          ) === 0
                            ? "Exact match!"
                            : `Off by ${Math.abs(
                                Number(guess.guess) -
                                  Number(currentQuestion.answer)
                              ).toFixed(2)}`}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* New Question Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeNewQuestionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Question</DialogTitle>
        <DialogContent>
          <TextField
            label="Question"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newQuestion.question}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, question: e.target.value })
            }
          />
          <TextField
            label="Answer"
            variant="outlined"
            type="number"
            fullWidth
            margin="normal"
            value={newQuestion.answer === null ? "" : newQuestion.answer}
            onChange={(e) =>
              setNewQuestion({
                ...newQuestion,
                answer:
                  e.target.value === "" ? null : parseFloat(e.target.value),
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewQuestionDialog}>Cancel</Button>
          <Button
            onClick={addNewQuestion}
            variant="contained"
            color="primary"
            disabled={
              !newQuestion.question || newQuestion.answer === null || loading
            }
          >
            {loading ? <CircularProgress size={24} /> : "Add Question"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Truncate Confirmation Dialog */}
      <Dialog open={truncateDialogOpen} onClose={closeTruncateDialog}>
        <DialogTitle>Confirm Clear All Guesses</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all guesses? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTruncateDialog}>Cancel</Button>
          <Button
            onClick={truncateGuesses}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Clear All Guesses"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      {notification && (
        <Snackbar
          open={notification !== null}
          autoHideDuration={6000}
          onClose={closeNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={closeNotification}
            severity={notification.type}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

const ClosestGuess = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/guess" element={<ClosestGuessGuess />} />
        <Route path="/admin" element={<ClosestGuessAdmin />} />
        <Route path="*" element={<ClosestGuessGuess />} />
        {/* Default to guess page */}
      </Routes>
    </BrowserRouter>
  );
};

export default ClosestGuess;
