import { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Zap, Check, X, RefreshCw, Plus, Minus, Divide } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ===== OPERATION SYMBOLS ===== */
/* These are the 4 math operations the game uses */
const OPERATIONS = ["+", "-", "x", "/"] as const;
type Operation = typeof OPERATIONS[number];

/* ===== ENCOURAGING MESSAGES ===== */
/* These messages show when you get the right answer! */
const CORRECT_MESSAGES = [
  "Amazing job!",
  "You're a math star!",
  "Fantastic!",
  "Super smart!",
  "You nailed it!",
  "Brilliant!",
  "Keep it up!",
  "Math wizard!",
  "Incredible!",
  "Way to go!",
];

/* These messages show when you get it wrong - still encouraging! */
const INCORRECT_MESSAGES = [
  "Almost! Try the next one!",
  "Don't worry, you'll get it!",
  "Keep trying, you're learning!",
  "So close! Next one's yours!",
  "That's okay, practice makes perfect!",
];

/* ===== PICK A RANDOM MESSAGE ===== */
/* This function picks a random message from a list */
function pickRandom(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

/* ===== COLOR FOR EACH OPERATION ===== */
/* Each math operation gets its own fun color */
function getOperationColor(op: Operation): string {
  switch (op) {
    case "+": return "bg-emerald-500 dark:bg-emerald-600";
    case "-": return "bg-sky-500 dark:bg-sky-600";
    case "x": return "bg-purple-500 dark:bg-purple-600";
    case "/": return "bg-amber-500 dark:bg-amber-600";
  }
}

function getOperationBorderColor(op: Operation): string {
  switch (op) {
    case "+": return "border-emerald-400 dark:border-emerald-500";
    case "-": return "border-sky-400 dark:border-sky-500";
    case "x": return "border-purple-400 dark:border-purple-500";
    case "/": return "border-amber-400 dark:border-amber-500";
  }
}

function getOperationTextColor(op: Operation): string {
  switch (op) {
    case "+": return "text-emerald-600 dark:text-emerald-400";
    case "-": return "text-sky-600 dark:text-sky-400";
    case "x": return "text-purple-600 dark:text-purple-400";
    case "/": return "text-amber-600 dark:text-amber-400";
  }
}

function getOperationIcon(op: Operation) {
  switch (op) {
    case "+": return <Plus className="w-4 h-4" />;
    case "-": return <Minus className="w-4 h-4" />;
    case "x": return <X className="w-4 h-4" />;
    case "/": return <Divide className="w-4 h-4" />;
  }
}

function getOperationLabel(op: Operation): string {
  switch (op) {
    case "+": return "Addition";
    case "-": return "Subtraction";
    case "x": return "Multiplication";
    case "/": return "Division";
  }
}

/* ===== GENERATE A NEW MATH QUESTION ===== */
/* This function creates a random math problem */
function generateQuestion(operation: Operation): { num1: number; num2: number; answer: number } {
  let num1: number, num2: number, answer: number;

  switch (operation) {
    case "+":
      /* Addition: numbers from 1 to 50 */
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      answer = num1 + num2;
      break;
    case "-":
      /* Subtraction: make sure the answer is never negative */
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      break;
    case "x":
      /* Multiplication: numbers from 1 to 12 (times tables) */
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
      break;
    case "/":
      /* Division: make sure it divides evenly (no remainders) */
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = Math.floor(Math.random() * 12) + 1;
      num1 = num2 * answer;
      break;
    default:
      num1 = 0;
      num2 = 0;
      answer = 0;
  }

  return { num1, num2, answer };
}

/* ===== THE MAIN GAME COMPONENT ===== */
/* This is where all the game magic happens! */
export default function MathGame() {
  /* ----- Game State ----- */
  /* These keep track of everything in the game */
  const [operation, setOperation] = useState<Operation>("x");
  const [question, setQuestion] = useState(() => generateQuestion("x"));
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ----- Focus the input box when the page loads ----- */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* ----- Create a new question ----- */
  const newQuestion = useCallback((op: Operation) => {
    setQuestion(generateQuestion(op));
    setUserAnswer("");
    setShowFeedback(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  /* ----- Switch to a different operation ----- */
  const switchOperation = useCallback((op: Operation) => {
    setOperation(op);
    newQuestion(op);
  }, [newQuestion]);

  /* ----- Check the player's answer ----- */
  const checkAnswer = useCallback(() => {
    if (userAnswer.trim() === "") return;

    const playerAnswer = parseInt(userAnswer, 10);
    const isCorrect = playerAnswer === question.answer;

    setTotalQuestions((prev) => prev + 1);

    if (isCorrect) {
      /* The answer is right! */
      const newStreak = streak + 1;
      setScore((prev) => prev + 1);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setFeedback({ correct: true, message: pickRandom(CORRECT_MESSAGES) });
    } else {
      /* The answer is wrong, but that's okay! */
      setStreak(0);
      setFeedback({
        correct: false,
        message: `${pickRandom(INCORRECT_MESSAGES)} The answer was ${question.answer}.`,
      });
    }

    setShowFeedback(true);

    /* Wait 1.5 seconds then show a new question */
    setTimeout(() => {
      newQuestion(operation);
    }, 1500);
  }, [userAnswer, question, streak, bestStreak, operation, newQuestion]);

  /* ----- Handle pressing Enter to submit ----- */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  };

  /* ----- Reset the game back to the start ----- */
  const resetGame = () => {
    setScore(0);
    setTotalQuestions(0);
    setStreak(0);
    setBestStreak(0);
    setFeedback(null);
    setShowFeedback(false);
    newQuestion(operation);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6 md:p-8 overflow-y-auto">
      {/* ===== GAME TITLE ===== */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-6 sm:mb-8"
      >
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
          data-testid="text-title"
        >
          <span className="text-purple-600 dark:text-purple-400">Math</span>
          <span className="text-pink-500 dark:text-pink-400"> Quest</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-base sm:text-lg" data-testid="text-subtitle">
          Practice your math skills and become a math champion!
        </p>
      </motion.div>

      {/* ===== OPERATION SELECTOR ===== */}
      {/* Pick which type of math you want to practice */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8"
      >
        {OPERATIONS.map((op) => (
          <Button
            key={op}
            variant={operation === op ? "default" : "outline"}
            className={`font-semibold toggle-elevate ${
              operation === op
                ? `${getOperationColor(op)} text-white toggle-elevated`
                : ""
            }`}
            onClick={() => switchOperation(op)}
            data-testid={`button-operation-${op === "x" ? "multiply" : op === "/" ? "divide" : op === "+" ? "add" : "subtract"}`}
          >
            {getOperationIcon(op)}
            <span className="ml-1.5">{getOperationLabel(op)}</span>
          </Button>
        ))}
      </motion.div>

      {/* ===== SCORE CARDS ===== */}
      {/* Shows your score, accuracy, and streaks */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-2xl"
      >
        <Card className="p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Score</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-score">
            {score}
          </p>
        </Card>

        <Card className="p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Star className="w-4 h-4 text-purple-500" />
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Questions</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-total">
            {totalQuestions}
          </p>
        </Card>

        <Card className="p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Streak</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-streak">
            {streak}
          </p>
        </Card>

        <Card className="p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Star className="w-4 h-4 text-emerald-500" />
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Best</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-best-streak">
            {bestStreak}
          </p>
        </Card>
      </motion.div>

      {/* ===== THE QUESTION CARD ===== */}
      {/* This is the main area where the question appears */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full max-w-lg"
      >
        <Card className={`p-6 sm:p-8 md:p-10 border-2 ${getOperationBorderColor(operation)}`}>
          {/* The math question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${question.num1}-${question.num2}-${operation}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-center mb-6 sm:mb-8"
            >
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <span
                  className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground"
                  data-testid="text-num1"
                >
                  {question.num1}
                </span>
                <span
                  className={`text-4xl sm:text-5xl md:text-6xl font-bold ${getOperationTextColor(operation)}`}
                  data-testid="text-operation"
                >
                  {operation === "x" ? "\u00D7" : operation === "/" ? "\u00F7" : operation}
                </span>
                <span
                  className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground"
                  data-testid="text-num2"
                >
                  {question.num2}
                </span>
              </div>

              <Badge
                variant="secondary"
                className={`mt-3 ${getOperationColor(operation)} text-white border-transparent`}
              >
                {getOperationLabel(operation)}
              </Badge>
            </motion.div>
          </AnimatePresence>

          {/* The answer input and submit button */}
          <div className="flex flex-wrap gap-3">
            <Input
              ref={inputRef}
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your answer..."
              className="text-center font-bold flex-1 min-w-[120px]"
              disabled={showFeedback}
              data-testid="input-answer"
            />
            <Button
              size="lg"
              onClick={checkAnswer}
              disabled={showFeedback || userAnswer.trim() === ""}
              className={`font-semibold ${getOperationColor(operation)} text-white`}
              data-testid="button-submit"
            >
              <Check className="w-5 h-5 mr-1" />
              Submit
            </Button>
          </div>

          {/* ===== FEEDBACK MESSAGE ===== */}
          {/* Tells the player if they got it right or wrong */}
          <AnimatePresence>
            {showFeedback && feedback && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className={`mt-4 sm:mt-6 p-4 rounded-md text-center font-semibold text-base sm:text-lg ${
                    feedback.correct
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                  }`}
                  data-testid="text-feedback"
                >
                  <span className="flex items-center justify-center gap-2">
                    {feedback.correct ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                    {feedback.message}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* ===== RESET BUTTON ===== */}
      {/* Start over with a fresh score */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-6"
      >
        <Button
          variant="outline"
          onClick={resetGame}
          className="font-semibold"
          data-testid="button-reset"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Start Over
        </Button>
      </motion.div>

      {/* ===== FUN TIP AT THE BOTTOM ===== */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-sm text-muted-foreground text-center"
        data-testid="text-tip"
      >
        Tip: Press Enter to submit your answer quickly!
      </motion.p>
    </div>
  );
}
