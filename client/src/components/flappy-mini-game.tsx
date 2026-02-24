/* ===================================================================
   FLAPPY MINI-GAME
   ===================================================================
   This is a fun flying mini-game that appears when you beat a level!
   You control your character (dog or dragon) and try to fly through
   gaps between obstacles. Press SPACEBAR to flap and fly up!
   Gravity pulls you down, so keep flapping!
   =================================================================== */

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Gamepad2, ArrowUp, Clock, Trophy } from "lucide-react";

/* ===== MINI-GAME SETTINGS ===== */
/* These numbers control how the game feels */
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.4;
const FLAP_STRENGTH = -7;
const PLAYER_SIZE = 30;
const OBSTACLE_WIDTH = 50;
const GAP_SIZE = 130;
const OBSTACLE_SPEED = 3;
const OBSTACLE_INTERVAL = 100;
const STAR_COUNT = 40;

/* ===== WHAT THE COMPONENT NEEDS ===== */
/* playerCharacter: "dog" or "dragon" — who you're playing as
   level: which level you just completed (1 or 2)
   onComplete: a function that runs when the mini-game ends */
type FlappyMiniGameProps = {
  playerCharacter: "dog" | "dragon";
  level: number;
  onComplete: (survivalTime: number) => void;
};

/* ===== OBSTACLE TYPE ===== */
/* Each obstacle has an x position and a gapY (where the opening is) */
type Obstacle = {
  x: number;
  gapY: number;
};

/* ===== STAR TYPE ===== */
/* Stars twinkle in the background to match our night theme */
type Star = {
  x: number;
  y: number;
  size: number;
  brightness: number;
};

export default function FlappyMiniGame({ playerCharacter, level, onComplete }: FlappyMiniGameProps) {
  /* ----- Game phases: "ready" (waiting to start), "playing", "gameover" ----- */
  const [phase, setPhase] = useState<"ready" | "playing" | "gameover">("ready");
  /* ----- How long the player survived (in seconds) ----- */
  const [survivalTime, setSurvivalTime] = useState(0);

  /* ----- References to things we need across frames ----- */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    playerY: CANVAS_HEIGHT / 2,
    velocity: 0,
    obstacles: [] as Obstacle[],
    frameCount: 0,
    startTime: 0,
    currentTime: 0,
    gameOver: false,
    stars: [] as Star[],
  });
  const animationFrameRef = useRef<number>(0);

  /* ===== IS THE PLAYER A DOG? ===== */
  const isDog = playerCharacter === "dog";

  /* ===== CREATE RANDOM STARS ===== */
  /* Fill the sky with twinkling stars */
  const createStars = useCallback((): Star[] => {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 1,
        brightness: Math.random(),
      });
    }
    return stars;
  }, []);

  /* ===== DRAW EVERYTHING ON THE CANVAS ===== */
  /* This function draws the sky, stars, player, and obstacles every frame */
  const draw = useCallback((ctx: CanvasRenderingContext2D, state: typeof gameStateRef.current) => {
    /* --- Draw the night sky background --- */
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGradient.addColorStop(0, "#0a0e27");
    skyGradient.addColorStop(0.5, "#1a1a4e");
    skyGradient.addColorStop(1, "#0d1b3e");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    /* --- Draw twinkling stars --- */
    state.stars.forEach((star) => {
      const twinkle = Math.sin(state.frameCount * 0.05 + star.brightness * 10) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 200, ${twinkle * 0.8})`;
      ctx.fill();
    });

    /* --- Draw the ground (grassy bottom) --- */
    const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 40, 0, CANVAS_HEIGHT);
    groundGradient.addColorStop(0, "#1a5c2a");
    groundGradient.addColorStop(1, "#0d3318");
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);

    /* --- Draw little grass blades on top of the ground --- */
    ctx.fillStyle = "#2a7a3a";
    for (let i = 0; i < CANVAS_WIDTH; i += 8) {
      const grassHeight = Math.sin(i * 0.3 + state.frameCount * 0.1) * 3 + 5;
      ctx.fillRect(i, CANVAS_HEIGHT - 40 - grassHeight, 3, grassHeight);
    }

    /* --- Draw obstacles (towers with glowing tops) --- */
    state.obstacles.forEach((obs) => {
      /* Top obstacle (from the ceiling down to the gap) */
      const topGradient = ctx.createLinearGradient(obs.x, 0, obs.x + OBSTACLE_WIDTH, 0);
      topGradient.addColorStop(0, "#4a1a6b");
      topGradient.addColorStop(0.5, "#6b2fa0");
      topGradient.addColorStop(1, "#4a1a6b");
      ctx.fillStyle = topGradient;
      ctx.fillRect(obs.x, 0, OBSTACLE_WIDTH, obs.gapY);
      /* Little cap on the bottom of the top obstacle */
      ctx.fillStyle = "#8b4fcf";
      ctx.fillRect(obs.x - 5, obs.gapY - 15, OBSTACLE_WIDTH + 10, 15);
      /* Glowing edge */
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#c084fc";
      ctx.fillRect(obs.x - 5, obs.gapY - 3, OBSTACLE_WIDTH + 10, 3);
      ctx.shadowBlur = 0;

      /* Bottom obstacle (from below the gap to the ground) */
      const bottomY = obs.gapY + GAP_SIZE;
      const botGradient = ctx.createLinearGradient(obs.x, bottomY, obs.x + OBSTACLE_WIDTH, bottomY);
      botGradient.addColorStop(0, "#4a1a6b");
      botGradient.addColorStop(0.5, "#6b2fa0");
      botGradient.addColorStop(1, "#4a1a6b");
      ctx.fillStyle = botGradient;
      ctx.fillRect(obs.x, bottomY, OBSTACLE_WIDTH, CANVAS_HEIGHT - bottomY);
      /* Little cap on the top of the bottom obstacle */
      ctx.fillStyle = "#8b4fcf";
      ctx.fillRect(obs.x - 5, bottomY, OBSTACLE_WIDTH + 10, 15);
      /* Glowing edge */
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#c084fc";
      ctx.fillRect(obs.x - 5, bottomY, OBSTACLE_WIDTH + 10, 3);
      ctx.shadowBlur = 0;
    });

    /* --- Draw the player character --- */
    const px = 80;
    const py = state.playerY;

    /* Glow effect behind the character */
    ctx.shadowColor = isDog ? "#f59e0b" : "#ef4444";
    ctx.shadowBlur = 20;

    /* Draw the character body (circle) */
    ctx.beginPath();
    ctx.arc(px, py, PLAYER_SIZE, 0, Math.PI * 2);
    const playerGradient = ctx.createRadialGradient(px - 5, py - 5, 3, px, py, PLAYER_SIZE);
    if (isDog) {
      playerGradient.addColorStop(0, "#fbbf24");
      playerGradient.addColorStop(1, "#b45309");
    } else {
      playerGradient.addColorStop(0, "#f87171");
      playerGradient.addColorStop(1, "#991b1b");
    }
    ctx.fillStyle = playerGradient;
    ctx.fill();
    ctx.shadowBlur = 0;

    /* Draw a border around the character */
    ctx.strokeStyle = isDog ? "#fcd34d" : "#fca5a5";
    ctx.lineWidth = 2;
    ctx.stroke();

    /* Draw eyes on the character */
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(px + 8, py - 6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1a2e";
    ctx.beginPath();
    ctx.arc(px + 9, py - 5, 3, 0, Math.PI * 2);
    ctx.fill();

    /* Draw the character label */
    ctx.fillStyle = "white";
    ctx.font = "bold 11px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(isDog ? "DOG" : "DRAGON", px, py + PLAYER_SIZE + 14);

    /* Draw little wings that flap */
    const wingFlap = Math.sin(state.frameCount * 0.3) * 8;
    ctx.beginPath();
    ctx.moveTo(px - 15, py);
    ctx.quadraticCurveTo(px - 30, py - 15 + wingFlap, px - 20, py - 25 + wingFlap);
    ctx.quadraticCurveTo(px - 10, py - 10, px - 15, py);
    ctx.fillStyle = isDog ? "rgba(251, 191, 36, 0.6)" : "rgba(248, 113, 113, 0.6)";
    ctx.fill();

    /* --- Draw the survival timer in the top-right corner --- */
    const elapsed = state.gameOver
      ? (state.currentTime - state.startTime) / 1000
      : (Date.now() - state.startTime) / 1000;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(CANVAS_WIDTH - 130, 10, 120, 35);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(CANVAS_WIDTH - 130, 10, 120, 35);
    ctx.fillStyle = "#fcd34d";
    ctx.font = "bold 16px Poppins, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${elapsed.toFixed(1)}s`, CANVAS_WIDTH - 20, 34);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "11px Poppins, sans-serif";
    ctx.fillText("TIME", CANVAS_WIDTH - 95, 32);
  }, [isDog]);

  /* ===== START THE GAME ===== */
  /* This sets up everything and begins the game loop */
  const startGame = useCallback(() => {
    const state = gameStateRef.current;
    state.playerY = CANVAS_HEIGHT / 2;
    state.velocity = 0;
    state.obstacles = [];
    state.frameCount = 0;
    state.startTime = Date.now();
    state.currentTime = 0;
    state.gameOver = false;
    state.stars = createStars();
    setPhase("playing");
  }, [createStars]);

  /* ===== THE GAME LOOP ===== */
  /* This runs over and over (about 60 times per second) to update the game */
  useEffect(() => {
    if (phase !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = () => {
      const state = gameStateRef.current;
      if (state.gameOver) return;

      state.frameCount++;

      /* --- Apply gravity (pulls the player down) --- */
      state.velocity += GRAVITY;
      state.playerY += state.velocity;

      /* --- Keep the player on screen --- */
      if (state.playerY < PLAYER_SIZE) {
        state.playerY = PLAYER_SIZE;
        state.velocity = 0;
      }
      /* --- Hit the ground = game over --- */
      if (state.playerY > CANVAS_HEIGHT - 40 - PLAYER_SIZE) {
        state.playerY = CANVAS_HEIGHT - 40 - PLAYER_SIZE;
        state.gameOver = true;
        state.currentTime = Date.now();
        const finalTime = (state.currentTime - state.startTime) / 1000;
        setSurvivalTime(parseFloat(finalTime.toFixed(1)));
        setPhase("gameover");
        return;
      }

      /* --- Add new obstacles every OBSTACLE_INTERVAL frames --- */
      if (state.frameCount % OBSTACLE_INTERVAL === 0) {
        const minGapY = 60;
        const maxGapY = CANVAS_HEIGHT - 40 - GAP_SIZE - 60;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
        state.obstacles.push({ x: CANVAS_WIDTH, gapY });
      }

      /* --- Move obstacles to the left and remove ones off screen --- */
      state.obstacles = state.obstacles
        .map((obs) => ({ ...obs, x: obs.x - OBSTACLE_SPEED }))
        .filter((obs) => obs.x + OBSTACLE_WIDTH > -10);

      /* --- Check for collisions with obstacles --- */
      const px = 80;
      const py = state.playerY;
      for (const obs of state.obstacles) {
        /* Is the player horizontally overlapping this obstacle? */
        if (px + PLAYER_SIZE > obs.x && px - PLAYER_SIZE < obs.x + OBSTACLE_WIDTH) {
          /* Is the player above the gap or below the gap? */
          if (py - PLAYER_SIZE < obs.gapY || py + PLAYER_SIZE > obs.gapY + GAP_SIZE) {
            /* CRASH! Game over! */
            state.gameOver = true;
            state.currentTime = Date.now();
            const finalTime = (state.currentTime - state.startTime) / 1000;
            setSurvivalTime(parseFloat(finalTime.toFixed(1)));
            setPhase("gameover");
            return;
          }
        }
      }

      /* --- Draw everything --- */
      draw(ctx, state);

      /* --- Keep the loop going --- */
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    /* --- Clean up when the component goes away --- */
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [phase, draw]);

  /* ===== HANDLE SPACEBAR PRESS ===== */
  /* When you press spacebar, the character flaps upward! */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (phase === "ready") {
          startGame();
        } else if (phase === "playing") {
          gameStateRef.current.velocity = FLAP_STRENGTH;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, startGame]);

  /* ===== DRAW THE "READY" SCREEN ===== */
  /* Show a preview of the game before starting */
  useEffect(() => {
    if (phase !== "ready") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;
    state.stars = createStars();
    state.playerY = CANVAS_HEIGHT / 2;
    state.frameCount = 0;
    state.obstacles = [];
    draw(ctx, state);
  }, [phase, draw, createStars]);

  /* ===== READY SCREEN ===== */
  /* Shows the "Mini Game Unlocked!" message and instructions */
  if (phase === "ready") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 w-full"
        data-testid="minigame-ready"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gamepad2 className="w-8 h-8 text-cyan-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-300">
              Mini Game Unlocked!
            </h2>
            <Gamepad2 className="w-8 h-8 text-cyan-400" />
          </div>
          <p className="text-amber-300 text-lg font-semibold" data-testid="text-minigame-subtitle">
            Survive as long as you can!
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            You completed Level {level}! Time for a bonus challenge!
          </p>
        </motion.div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="rounded-xl border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/10 max-w-full"
            style={{ maxWidth: "100%", height: "auto" }}
            data-testid="minigame-canvas"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
            <div className="text-center">
              <ArrowUp className="w-10 h-10 text-white mx-auto mb-2 animate-bounce" />
              <p className="text-white text-lg font-bold">Press SPACEBAR to Start!</p>
              <p className="text-white/70 text-sm mt-1">Tap SPACE to flap and dodge obstacles</p>
            </div>
          </div>
        </div>

        <Button
          onClick={startGame}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-8 py-3 text-lg"
          data-testid="button-start-minigame"
        >
          <Gamepad2 className="w-5 h-5 mr-2" />
          Start Flying!
        </Button>
      </motion.div>
    );
  }

  /* ===== GAME OVER SCREEN ===== */
  /* Shows the final score and a button to go back to math */
  if (phase === "gameover") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 w-full"
        data-testid="minigame-gameover"
      >
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-2">
            Great Flying!
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-cyan-400" />
            <span className="text-3xl font-bold text-cyan-300" data-testid="text-survival-time">
              {survivalTime}s
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-muted-foreground">
              You survived {survivalTime} seconds!
            </span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-xl border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/10 max-w-full"
          style={{ maxWidth: "100%", height: "auto" }}
          data-testid="minigame-canvas-gameover"
        />

        <Button
          onClick={() => onComplete(survivalTime)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 text-lg"
          data-testid="button-back-to-math"
        >
          <ArrowUp className="w-5 h-5 mr-2" />
          Back to Math! (Level {level + 1})
        </Button>
      </motion.div>
    );
  }

  /* ===== PLAYING SCREEN ===== */
  /* Just show the canvas while the game is running */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4 w-full"
      data-testid="minigame-playing"
    >
      <div className="flex items-center gap-2">
        <Gamepad2 className="w-5 h-5 text-cyan-400" />
        <span className="text-cyan-300 font-semibold">Press SPACE to flap!</span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-xl border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/10 max-w-full"
        style={{ maxWidth: "100%", height: "auto" }}
        data-testid="minigame-canvas-playing"
      />
    </motion.div>
  );
}
