import { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Zap, Check, X, RefreshCw, Plus, Minus, Divide, Swords, Moon, Shield, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ===== OPERATION SYMBOLS ===== */
/* These are the 4 math operations the game uses */
const OPERATIONS = ["+", "-", "x", "/"] as const;
type Operation = typeof OPERATIONS[number];

/* ===== DOG WINNER MESSAGES ===== */
/* These messages show when you get the right answer - the dog wins! */
const DOG_WINNER_MESSAGES = [
  "You're a dog winner!",
  "The dog is so proud of you!",
  "Woof woof! You nailed it!",
  "Super pup power!",
  "The dog does a happy dance!",
  "Bark bark! Amazing math!",
  "Good boy energy! You got it!",
  "The dog wags its tail for you!",
  "Paw-some job, math hero!",
  "The dog howls with joy!",
];

/* ===== BAD DRAGON MESSAGES ===== */
/* These messages show when you get it wrong - the dragon strikes! */
const BAD_DRAGON_MESSAGES = [
  "You're a bad dragon!",
  "The dragon breathes fire! Try again!",
  "The dragon laughs... but you'll get it!",
  "Dragon wins this round!",
  "The dragon roars! Don't give up!",
  "The sneaky dragon tricked you!",
  "The dragon dances... get the next one!",
  "Oh no, dragon attack! Try again!",
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
    case "+": return "bg-emerald-500";
    case "-": return "bg-sky-500";
    case "x": return "bg-purple-500";
    case "/": return "bg-amber-500";
  }
}

function getOperationBorderColor(op: Operation): string {
  switch (op) {
    case "+": return "border-emerald-500/50";
    case "-": return "border-sky-500/50";
    case "x": return "border-purple-500/50";
    case "/": return "border-amber-500/50";
  }
}

function getOperationTextColor(op: Operation): string {
  switch (op) {
    case "+": return "text-emerald-400";
    case "-": return "text-sky-400";
    case "x": return "text-purple-400";
    case "/": return "text-amber-400";
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

/* ===== SHAKE ANIMATION ===== */
/* This makes the dog or dragon shake when something happens */
const shakeAnimation = {
  shake: {
    x: [0, -8, 8, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

/* ===== BOUNCE ANIMATION ===== */
/* This makes the dog bounce happily when you get the right answer */
const bounceAnimation = {
  bounce: {
    y: [0, -20, 0, -10, 0],
    scale: [1, 1.1, 1, 1.05, 1],
    transition: { duration: 0.6 },
  },
};

/* ===== FLASH ANIMATION ===== */
/* This makes the dragon flash red when you get the wrong answer */
const flashAnimation = {
  flash: {
    opacity: [1, 0.3, 1, 0.3, 1],
    scale: [1, 1.15, 1, 1.1, 1],
    transition: { duration: 0.5 },
  },
};

/* ===== TWINKLING STARS ===== */
/* These are the little stars that twinkle in the night sky background */
function Stars() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-yellow-200"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
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

  /* ----- Dog and Dragon animation state ----- */
  /* These control when the dog and dragon animate */
  const [dogAnimate, setDogAnimate] = useState("");
  const [dragonAnimate, setDragonAnimate] = useState("");

  /* ----- Focus the input box when the page loads ----- */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* ----- Create a new question ----- */
  const newQuestion = useCallback((op: Operation) => {
    setQuestion(generateQuestion(op));
    setUserAnswer("");
    setShowFeedback(false);
    setDogAnimate("");
    setDragonAnimate("");
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
      /* The answer is right! The dog wins! */
      const newStreak = streak + 1;
      setScore((prev) => prev + 1);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setFeedback({ correct: true, message: pickRandom(DOG_WINNER_MESSAGES) });
      /* Make the dog bounce happily */
      setDogAnimate("bounce");
      setDragonAnimate("shake");
    } else {
      /* The answer is wrong - the dragon attacks! */
      setStreak(0);
      setFeedback({
        correct: false,
        message: `${pickRandom(BAD_DRAGON_MESSAGES)} The answer was ${question.answer}.`,
      });
      /* Make the dragon flash and the dog shake */
      setDragonAnimate("flash");
      setDogAnimate("shake");
    }

    setShowFeedback(true);

    /* Wait 2 seconds then show a new question */
    setTimeout(() => {
      newQuestion(operation);
    }, 2000);
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
    setDogAnimate("");
    setDragonAnimate("");
    newQuestion(operation);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6 md:p-8 overflow-y-auto relative">
      {/* ===== TWINKLING NIGHT SKY STARS ===== */}
      <Stars />

      {/* ===== GAME TITLE ===== */}
      {/* The name of our game with cool gradient text */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-4 sm:mb-6 relative z-10"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1">
          <Moon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            data-testid="text-title"
          >
            <span className="text-amber-400">Night Dog</span>
            <span className="text-red-400"> Math Attack</span>
          </h1>
          <Swords className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
        </div>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base" data-testid="text-subtitle">
          Help the dog defeat the dragon with your math powers!
        </p>
      </motion.div>

      {/* ===== DOG AND DRAGON CHARACTERS ===== */}
      {/* The dog is our hero - the dragon is the villain! */}
      {/* They animate when you answer a question */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center justify-center gap-4 sm:gap-8 mb-4 sm:mb-6 relative z-10"
      >
        {/* ===== THE DOG (our hero!) ===== */}
        {/* The dog bounces when you get the right answer */}
        {/* The dog shakes when you get it wrong */}
        <motion.div
          variants={{ ...bounceAnimation, ...shakeAnimation }}
          animate={dogAnimate}
          className="flex flex-col items-center"
        >
          <div className={`relative rounded-2xl overflow-hidden border-4 ${
            showFeedback && feedback?.correct
              ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
              : "border-amber-400/30"
          }`}>
            <img
              src="/images/dog-hero.png"
              alt="Hero Dog"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-cover"
              data-testid="img-dog"
            />
            {/* Glow effect when the dog wins */}
            {showFeedback && feedback?.correct && (
              <motion.div
                className="absolute inset-0 bg-amber-400/20"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
          <Badge className="mt-2 bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">
            <Shield className="w-3 h-3 mr-1" /> Hero Dog
          </Badge>
        </motion.div>

        {/* ===== VS ICON ===== */}
        {/* The battle symbol between dog and dragon */}
        <motion.div
          animate={showFeedback ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <Swords className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
          <span className="text-xs sm:text-sm font-bold text-red-400 mt-1">VS</span>
        </motion.div>

        {/* ===== THE DRAGON (the villain!) ===== */}
        {/* The dragon flashes when you get it wrong (dragon attack!) */}
        {/* The dragon shakes when you get it right (dog defeats it!) */}
        <motion.div
          variants={{ ...flashAnimation, ...shakeAnimation }}
          animate={dragonAnimate}
          className="flex flex-col items-center"
        >
          <div className={`relative rounded-2xl overflow-hidden border-4 ${
            showFeedback && !feedback?.correct
              ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
              : "border-red-500/30"
          }`}>
            <img
              src="/images/dragon-villain.png"
              alt="Villain Dragon"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-cover"
              data-testid="img-dragon"
            />
            {/* Red glow when the dragon wins */}
            {showFeedback && !feedback?.correct && (
              <motion.div
                className="absolute inset-0 bg-red-500/20"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
          <Badge className="mt-2 bg-red-500/20 text-red-300 border-red-500/30 font-bold">
            <Flame className="w-3 h-3 mr-1" /> Bad Dragon
          </Badge>
        </motion.div>
      </motion.div>

      {/* ===== OPERATION SELECTOR ===== */}
      {/* Pick which type of math you want to practice */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 relative z-10"
      >
        {OPERATIONS.map((op) => (
          <Button
            key={op}
            variant={operation === op ? "default" : "outline"}
            className={`font-semibold ${
              operation === op
                ? `${getOperationColor(op)} text-white`
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

      {/* ===== THE QUESTION CARD ===== */}
      {/* This is the main area where the math question appears */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className={`p-6 sm:p-8 md:p-10 border-2 ${getOperationBorderColor(operation)}`}>
          {/* The math question numbers and symbol */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${question.num1}-${question.num2}-${operation}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-center mb-6 sm:mb-8"
            >
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
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
              <Swords className="w-5 h-5 mr-1" />
              Attack!
            </Button>
          </div>

          {/* ===== FEEDBACK MESSAGE ===== */}
          {/* Shows dog winner or bad dragon message with emoji */}
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
                  className={`mt-4 sm:mt-6 p-4 rounded-lg text-center font-bold text-base sm:text-lg ${
                    feedback.correct
                      ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                      : "bg-red-500/15 text-red-300 border border-red-500/30"
                  }`}
                  data-testid="text-feedback"
                >
                  <span className="flex flex-wrap items-center justify-center gap-2">
                    {feedback.correct ? (
                      <Shield className="w-6 h-6" />
                    ) : (
                      <Flame className="w-6 h-6" />
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
        className="mt-6 relative z-10"
      >
        <Button
          variant="outline"
          onClick={resetGame}
          className="font-semibold"
          data-testid="button-reset"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          New Battle
        </Button>
      </motion.div>

      {/* ===== SCORE CARDS ===== */}
      {/* Shows your score, questions answered, streak, and best streak */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 w-full max-w-2xl relative z-10"
      >
        <Card className="p-3 sm:p-4 text-center border-amber-500/20">
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Score</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-400" data-testid="text-score">
            {score}
          </p>
        </Card>

        <Card className="p-3 sm:p-4 text-center border-purple-500/20">
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Questions</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-purple-400" data-testid="text-total">
            {totalQuestions}
          </p>
        </Card>

        <Card className="p-3 sm:p-4 text-center border-orange-500/20">
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Streak</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-orange-400" data-testid="text-streak">
            {streak}
          </p>
        </Card>

        <Card className="p-3 sm:p-4 text-center border-emerald-500/20">
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1">
            <Star className="w-4 h-4 text-emerald-400" />
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Best</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400" data-testid="text-best-streak">
            {bestStreak}
          </p>
        </Card>
      </motion.div>

      {/* ===== FUN TIP AT THE BOTTOM ===== */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-sm text-muted-foreground text-center relative z-10"
        data-testid="text-tip"
      >
        Tip: Press Enter to attack the dragon faster!
      </motion.p>
    </div>
  );
}
