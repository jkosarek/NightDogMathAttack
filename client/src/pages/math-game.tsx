import { useState, useCallback, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Zap, Check, X, RefreshCw, Plus, Minus, Divide, Swords, Moon, Shield, Flame, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FlappyMiniGame from "@/components/flappy-mini-game";

/* ===== OPERATION SYMBOLS ===== */
/* These are the 4 math operations the game uses */
const OPERATIONS = ["+", "-", "x", "/"] as const;
type Operation = typeof OPERATIONS[number];

/* ===== CHARACTER TYPE ===== */
/* The player can choose to be the dog or the dragon */
type PlayerCharacter = "dog" | "dragon";

/* ===== DOG WINNER MESSAGES ===== */
/* These messages show when you get the right answer playing as the dog */
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
/* These messages show when you get it wrong playing as the dog */
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

/* ===== DRAGON WINNER MESSAGES ===== */
/* These messages show when you get the right answer playing as the dragon */
const DRAGON_WINNER_MESSAGES = [
  "Dragon power! You got it!",
  "Fire breath of knowledge!",
  "The dragon roars with pride!",
  "Scales of steel, brain of gold!",
  "Dragon math mastery!",
  "You breathe fire on that problem!",
  "The mighty dragon conquers!",
  "Fearsome and smart!",
  "Dragon wins this battle!",
  "Your fire burns bright with brains!",
];

/* ===== BAD DOG MESSAGES ===== */
/* These messages show when you get it wrong playing as the dragon */
const BAD_DOG_MESSAGES = [
  "The dog fetched the answer first!",
  "The dog outran you! Try again!",
  "The pup is too clever!",
  "Dog snatches the bone of victory!",
  "Woof! The dog got you!",
  "The dog digs up the right answer!",
  "Ruff round! The dog wins this one!",
  "The dog howls in triumph!",
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

/* ===== LEVEL SETTINGS ===== */
/* 15 levels total! Level 1 uses easy numbers, Level 2 gets a bit harder,
   and Level 3+ all use the same range (the math doesn't get harder after Level 3) */
/* Level 1: numbers 1-5, Level 2: numbers 4-7, Levels 3-15: numbers 4-11 */
function getLevelMin(level: number): number {
  if (level <= 1) return 1;
  return 4;
}
function getLevelMax(level: number): number {
  if (level <= 1) return 5;
  if (level <= 2) return 7;
  return 11;
}
const MAX_LEVEL = 15;
const CORRECT_TO_LEVEL_UP = 5;

/* ===== HELPER: pick a random number in a range ===== */
/* Gets a random whole number between min and max (including both) */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ===== GENERATE A NEW MATH QUESTION ===== */
/* This function creates a random math problem using the level's number range */
function generateQuestion(operation: Operation, level: number = 1): { num1: number; num2: number; answer: number } {
  let num1: number, num2: number, answer: number;
  const minNum = getLevelMin(level);
  const maxNum = getLevelMax(level);

  switch (operation) {
    case "+":
      /* Addition: numbers from minNum to maxNum */
      num1 = randomInRange(minNum, maxNum);
      num2 = randomInRange(minNum, maxNum);
      answer = num1 + num2;
      break;
    case "-":
      /* Subtraction: make sure the answer is never negative */
      num1 = randomInRange(minNum, maxNum);
      num2 = randomInRange(minNum, num1);
      answer = num1 - num2;
      break;
    case "x":
      /* Multiplication: numbers from minNum to maxNum */
      num1 = randomInRange(minNum, maxNum);
      num2 = randomInRange(minNum, maxNum);
      answer = num1 * num2;
      break;
    case "/":
      /* Division: make sure it divides evenly (no remainders) */
      num2 = randomInRange(minNum, maxNum);
      answer = randomInRange(minNum, maxNum);
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
  /* ----- Character Selection State ----- */
  /* null means the player hasn't picked yet - show the selection screen */
  const [playerCharacter, setPlayerCharacter] = useState<PlayerCharacter | null>(null);

  /* ----- Game State ----- */
  /* These keep track of everything in the game */
  const [operation, setOperation] = useState<Operation>("x");
  const [level, setLevel] = useState(1);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [question, setQuestion] = useState(() => generateQuestion("x", 1));
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ----- Mini-game state ----- */
  /* When true, the flappy mini-game is shown instead of math questions */
  const [showMiniGame, setShowMiniGame] = useState(false);
  /* Which level was just completed (used to tell the mini-game) */
  const [miniGameLevel, setMiniGameLevel] = useState(1);

  /* ----- Victory state ----- */
  /* When true, the player beat all 15 levels — show the victory screen! */
  const [showVictory, setShowVictory] = useState(false);

  /* ----- Dog and Dragon animation state ----- */
  /* These control when the dog and dragon animate */
  const [dogAnimate, setDogAnimate] = useState("");
  const [dragonAnimate, setDragonAnimate] = useState("");

  /* ----- Helper: is the player the dog? ----- */
  const isDog = playerCharacter === "dog";

  /* ----- Focus the input box when the game starts ----- */
  useEffect(() => {
    if (playerCharacter) {
      inputRef.current?.focus();
    }
  }, [playerCharacter]);

  /* ----- Create a new question ----- */
  /* Uses the current level to pick the right number range */
  const newQuestion = useCallback((op: Operation, lvl?: number) => {
    setQuestion(generateQuestion(op, lvl ?? level));
    setUserAnswer("");
    setShowFeedback(false);
    setDogAnimate("");
    setDragonAnimate("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [level]);

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
      /* The answer is right! Your character wins! */
      const newStreak = streak + 1;
      setScore((prev) => prev + 1);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      /* Check if the player levels up (5 correct answers in this level) */
      const newCorrectInLevel = correctInLevel + 1;
      let nextLevel = level;

      /* ★ VICTORY! The player finished all 15 levels! ★ */
      if (newCorrectInLevel >= CORRECT_TO_LEVEL_UP && level >= MAX_LEVEL) {
        setCorrectInLevel(newCorrectInLevel);
        setFeedback({
          correct: true,
          message: isDog ? "YOU DID IT! You defeated all the dragons!" : "YOU DID IT! You defeated all the dogs!",
        });

        if (isDog) {
          setDogAnimate("bounce");
          setDragonAnimate("shake");
        } else {
          setDragonAnimate("bounce");
          setDogAnimate("shake");
        }

        /* Show the victory message, then switch to the victory screen */
        setShowFeedback(true);
        setTimeout(() => {
          setShowFeedback(false);
          setShowVictory(true);
        }, 2500);
      } else if (newCorrectInLevel >= CORRECT_TO_LEVEL_UP && level < MAX_LEVEL) {
        nextLevel = level + 1;
        setLevel(nextLevel);
        setCorrectInLevel(0);
        setFeedback({
          correct: true,
          message: `LEVEL UP! Mini-game time! ${pickRandom(isDog ? DOG_WINNER_MESSAGES : DRAGON_WINNER_MESSAGES)}`,
        });

        /* Make the player's character bounce, opponent shakes */
        if (isDog) {
          setDogAnimate("bounce");
          setDragonAnimate("shake");
        } else {
          setDragonAnimate("bounce");
          setDogAnimate("shake");
        }

        /* Show the level-up feedback, then launch the mini-game! */
        setShowFeedback(true);
        setMiniGameLevel(level);
        setTimeout(() => {
          setShowFeedback(false);
          setShowMiniGame(true);
        }, 2000);
      } else {
        setCorrectInLevel(newCorrectInLevel);
        setFeedback({
          correct: true,
          message: pickRandom(isDog ? DOG_WINNER_MESSAGES : DRAGON_WINNER_MESSAGES),
        });

        /* Make the player's character bounce, opponent shakes */
        if (isDog) {
          setDogAnimate("bounce");
          setDragonAnimate("shake");
        } else {
          setDragonAnimate("bounce");
          setDogAnimate("shake");
        }

        /* Wait 2 seconds then show a new question */
        setShowFeedback(true);
        setTimeout(() => {
          newQuestion(operation, nextLevel);
        }, 2000);
      }
    } else {
      /* The answer is wrong - the opponent strikes! */
      setStreak(0);
      setFeedback({
        correct: false,
        message: `${pickRandom(isDog ? BAD_DRAGON_MESSAGES : BAD_DOG_MESSAGES)} The answer was ${question.answer}.`,
      });
      /* Make the opponent flash, player shakes */
      if (isDog) {
        setDragonAnimate("flash");
        setDogAnimate("shake");
      } else {
        setDogAnimate("flash");
        setDragonAnimate("shake");
      }

      setShowFeedback(true);
      /* Wait 2 seconds then show a new question */
      setTimeout(() => {
        newQuestion(operation);
      }, 2000);
    }
  }, [userAnswer, question, streak, bestStreak, operation, newQuestion, isDog, level, correctInLevel]);

  /* ----- Handle pressing Enter to submit ----- */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  };

  /* ----- Restart the game from the very beginning ----- */
  /* This resets everything so you can play all 15 levels again! */
  const restartGame = () => {
    setScore(0);
    setTotalQuestions(0);
    setStreak(0);
    setBestStreak(0);
    setLevel(1);
    setCorrectInLevel(0);
    setFeedback(null);
    setShowFeedback(false);
    setShowVictory(false);
    setShowMiniGame(false);
    setDogAnimate("");
    setDragonAnimate("");
    newQuestion(operation, 1);
  };

  /* ----- Handle when the mini-game finishes ----- */
  /* The player finished the flappy game, now go back to math! */
  const handleMiniGameComplete = useCallback((survivalTime: number) => {
    setShowMiniGame(false);
    setFeedback(null);
    setShowFeedback(false);
    setUserAnswer("");
    newQuestion(operation, level);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [operation, level, newQuestion]);

  /* ----- Character Selection Handler ----- */
  const selectCharacter = (character: PlayerCharacter) => {
    setPlayerCharacter(character);
  };

  /* ----- Go back to character selection ----- */
  const goToCharacterSelect = () => {
    setPlayerCharacter(null);
    setScore(0);
    setTotalQuestions(0);
    setStreak(0);
    setBestStreak(0);
    setLevel(1);
    setCorrectInLevel(0);
    setFeedback(null);
    setShowFeedback(false);
    setShowVictory(false);
    setShowMiniGame(false);
    setDogAnimate("");
    setDragonAnimate("");
    setUserAnswer("");
    setQuestion(generateQuestion(operation, 1));
  };

  /* ===== CHARACTER SELECTION SCREEN ===== */
  /* This screen shows at the start so the player can pick their character */
  if (!playerCharacter) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative">
        <Stars />

        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-8 relative z-10"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <Moon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
              data-testid="text-title-select"
            >
              <span className="text-amber-400">Night Dog</span>
              <span className="text-red-400"> Math Attack</span>
            </h1>
            <Swords className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
          </div>
          <p className="text-muted-foreground text-lg sm:text-xl mt-2" data-testid="text-choose-prompt">
            Choose your character!
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 relative z-10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectCharacter("dog")}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl border-4 border-amber-400/30 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all duration-300 bg-amber-500/5 cursor-pointer"
            data-testid="button-select-dog"
          >
            <img
              src="/images/dog-hero.png"
              alt="Play as Dog"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover"
            />
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold text-base px-4 py-1">
              <Shield className="w-4 h-4 mr-1.5" /> Play as Dog
            </Badge>
            <p className="text-amber-300/70 text-sm max-w-[160px] text-center">
              Be the hero pup and defeat the dragon!
            </p>
          </motion.button>

          <div className="flex flex-col items-center">
            <Swords className="w-8 h-8 text-red-400" />
            <span className="text-sm font-bold text-red-400 mt-1">OR</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => selectCharacter("dragon")}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl border-4 border-red-500/30 hover:border-red-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all duration-300 bg-red-500/5 cursor-pointer"
            data-testid="button-select-dragon"
          >
            <img
              src="/images/dragon-villain.png"
              alt="Play as Dragon"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover"
            />
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30 font-bold text-base px-4 py-1">
              <Flame className="w-4 h-4 mr-1.5" /> Play as Dragon
            </Badge>
            <p className="text-red-300/70 text-sm max-w-[160px] text-center">
              Be the mighty dragon and outsmart the dog!
            </p>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ===== VICTORY SCREEN ===== */
  /* You beat all 15 levels! This screen celebrates your amazing win! */
  if (showVictory && playerCharacter) {
    /* These are the fun confetti pieces that float around the screen */
    const confettiEmojis = ["🎉", "⭐", "🏆", "✨", "🎊", "💥", "🌟", "🥇"];

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
        {/* Twinkling stars in the background */}
        <Stars />

        {/* ===== FLOATING CONFETTI ===== */}
        {/* These emoji float and spin around to celebrate your win! */}
        {confettiEmojis.map((emoji, i) => (
          <motion.div
            key={`confetti-${i}`}
            className="absolute text-3xl sm:text-4xl pointer-events-none select-none"
            style={{
              left: `${10 + (i * 11) % 80}%`,
              top: `${5 + (i * 17) % 70}%`,
            }}
            animate={{
              y: [0, -30, 0, 30, 0],
              x: [0, 15, -15, 10, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 0.9, 1.1, 1],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
            data-testid={`confetti-${i}`}
          >
            {emoji}
          </motion.div>
        ))}

        {/* ===== EXTRA SPARKLE PARTICLES ===== */}
        {/* Little dots of light that twinkle all over */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-2 h-2 rounded-full bg-amber-400 pointer-events-none"
            style={{
              left: `${5 + (i * 8) % 90}%`,
              top: `${10 + (i * 13) % 80}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* ===== THE BIG "YOU'VE WON!" MESSAGE ===== */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
          className="relative z-10 text-center"
        >
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-4"
            style={{
              background: "linear-gradient(to right, #f59e0b, #fbbf24, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(245, 158, 11, 0.5))",
            }}
            data-testid="text-victory-title"
          >
            YOU'VE WON!
          </h1>

          {/* A glowing line under the title */}
          <motion.div
            className="h-1 mx-auto rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent"
            initial={{ width: 0 }}
            animate={{ width: "80%" }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        {/* ===== CHARACTER IMAGES ===== */}
        {/* Show the winning character big and bouncy! */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10 flex items-center gap-6 sm:gap-10 mt-6 mb-6"
        >
          {/* The winner bounces up and down */}
          <motion.img
            src={isDog ? "/images/dog-hero.png" : "/images/dragon-villain.png"}
            alt={isDog ? "Dog Hero" : "Dragon Champion"}
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            data-testid="img-victory-winner"
          />
          {/* The loser is small and faded */}
          <motion.img
            src={isDog ? "/images/dragon-villain.png" : "/images/dog-hero.png"}
            alt={isDog ? "Defeated Dragon" : "Defeated Dog"}
            className="w-14 h-14 sm:w-20 sm:h-20 object-contain opacity-40 grayscale"
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            data-testid="img-victory-loser"
          />
        </motion.div>

        {/* ===== CELEBRATORY MESSAGE ===== */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 text-xl sm:text-2xl text-amber-300 font-bold text-center mb-6"
          data-testid="text-victory-message"
        >
          {isDog
            ? "🐕 You defeated all the dragons! 🐉"
            : "🐉 You defeated all the dogs! 🐕"}
        </motion.p>

        {/* ===== FINAL SCORE AND STATS ===== */}
        {/* This card shows how well you did */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative z-10"
        >
          <Card className="p-6 sm:p-8 border-2 border-amber-500/50 bg-card/80 backdrop-blur-sm max-w-sm w-full">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <Trophy className="w-6 h-6" />
                <span className="text-lg font-bold">Final Stats</span>
                <Trophy className="w-6 h-6" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-green-400" data-testid="text-victory-score">
                    {score}
                  </p>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-cyan-400" data-testid="text-victory-streak">
                    {bestStreak}
                  </p>
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  You answered {score} out of {totalQuestions} questions correctly!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ===== PLAY AGAIN AND SWITCH CHARACTER BUTTONS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="relative z-10 flex flex-col sm:flex-row gap-3 mt-6"
        >
          {/* Play Again — restart from Level 1 with the same character */}
          <Button
            onClick={restartGame}
            size="lg"
            className="font-bold text-lg bg-amber-500 text-black"
            data-testid="button-play-again"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Play Again
          </Button>

          {/* Switch Character — go back to the character selection screen */}
          <Button
            onClick={goToCharacterSelect}
            variant="outline"
            size="lg"
            className="font-semibold"
            data-testid="button-victory-switch"
          >
            <Swords className="w-5 h-5 mr-2" />
            Switch Character
          </Button>
        </motion.div>
      </div>
    );
  }

  /* ===== MINI-GAME SCREEN ===== */
  /* When the player levels up, show the flappy mini-game! */
  if (showMiniGame && playerCharacter) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative">
        <Stars />
        <div className="relative z-10 w-full max-w-2xl">
          <FlappyMiniGame
            playerCharacter={playerCharacter}
            level={miniGameLevel}
            onComplete={handleMiniGameComplete}
          />
        </div>
      </div>
    );
  }

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
          {isDog
            ? "Help the dog defeat the dragon with your math powers!"
            : "Use dragon fire to outsmart the dog with math!"}
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
          variants={{ ...bounceAnimation, ...shakeAnimation, ...flashAnimation }}
          animate={dogAnimate}
          className="flex flex-col items-center"
        >
          <div className={`relative rounded-2xl overflow-hidden border-4 ${
            showFeedback && ((isDog && feedback?.correct) || (!isDog && !feedback?.correct))
              ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
              : "border-amber-400/30"
          }`}>
            <img
              src="/images/dog-hero.png"
              alt={isDog ? "You - The Dog" : "Opponent Dog"}
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-cover"
              data-testid="img-dog"
            />
            {showFeedback && ((isDog && feedback?.correct) || (!isDog && !feedback?.correct)) && (
              <motion.div
                className="absolute inset-0 bg-amber-400/20"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
          <Badge className={`mt-2 font-bold ${
            isDog
              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
              : "bg-amber-500/10 text-amber-300/60 border-amber-500/20"
          }`}>
            <Shield className="w-3 h-3 mr-1" /> {isDog ? "You (Dog)" : "Enemy Dog"}
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
          variants={{ ...flashAnimation, ...shakeAnimation, ...bounceAnimation }}
          animate={dragonAnimate}
          className="flex flex-col items-center"
        >
          <div className={`relative rounded-2xl overflow-hidden border-4 ${
            showFeedback && ((!isDog && feedback?.correct) || (isDog && !feedback?.correct))
              ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
              : "border-red-500/30"
          }`}>
            <img
              src="/images/dragon-villain.png"
              alt={!isDog ? "You - The Dragon" : "Opponent Dragon"}
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-cover"
              data-testid="img-dragon"
            />
            {showFeedback && ((!isDog && feedback?.correct) || (isDog && !feedback?.correct)) && (
              <motion.div
                className="absolute inset-0 bg-red-500/20"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
          <Badge className={`mt-2 font-bold ${
            !isDog
              ? "bg-red-500/20 text-red-300 border-red-500/30"
              : "bg-red-500/10 text-red-300/60 border-red-500/20"
          }`}>
            <Flame className="w-3 h-3 mr-1" /> {!isDog ? "You (Dragon)" : "Enemy Dragon"}
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

      {/* ===== LEVEL DISPLAY ===== */}
      {/* Shows current level and progress toward the next level */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col items-center mb-4 sm:mb-6 relative z-10 w-full max-w-lg"
      >
        <div className="flex items-center gap-3 mb-2">
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-bold text-base px-4 py-1" data-testid="text-level">
            <ArrowUp className="w-4 h-4 mr-1.5" />
            Level {level}
          </Badge>
          <span className="text-sm text-muted-foreground" data-testid="text-level-range">
            Numbers {getLevelMin(level)}–{getLevelMax(level)}
          </span>
        </div>
        {level < MAX_LEVEL && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{correctInLevel}/{CORRECT_TO_LEVEL_UP} to next level</span>
            </div>
            <div className="w-full bg-cyan-500/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-cyan-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(correctInLevel / CORRECT_TO_LEVEL_UP) * 100}%` }}
                transition={{ duration: 0.3 }}
                data-testid="progress-level"
              />
            </div>
          </div>
        )}
        {level >= MAX_LEVEL && (
          <span className="text-xs text-cyan-300/70" data-testid="text-max-level">Max level reached!</span>
        )}
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
                    {feedback.correct
                      ? (isDog ? <Shield className="w-6 h-6" /> : <Flame className="w-6 h-6" />)
                      : (isDog ? <Flame className="w-6 h-6" /> : <Shield className="w-6 h-6" />)
                    }
                    {feedback.message}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* ===== RESET AND SWITCH BUTTONS ===== */}
      {/* Start over or switch character */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-6 flex flex-wrap gap-3 justify-center relative z-10"
      >
        <Button
          variant="outline"
          onClick={restartGame}
          className="font-semibold"
          data-testid="button-reset"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          New Battle
        </Button>
        <Button
          variant="outline"
          onClick={goToCharacterSelect}
          className="font-semibold"
          data-testid="button-switch-character"
        >
          <Swords className="w-4 h-4 mr-1.5" />
          Switch Character
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
