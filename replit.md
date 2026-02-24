# Night Dog Math Attack

## Overview
A fun dog-and-dragon themed math game for kids. Choose to play as the heroic dog or the mighty dragon, then battle the opponent by solving math questions! Covers addition, subtraction, multiplication, and division with animations, score tracking, and themed feedback messages. Includes a Flappy Bird-style bonus mini-game between levels!

## Recent Changes
- 2026-02-24: Expanded to 15 levels; Level 2+ excludes easy numbers (1-3); difficulty caps at Level 3 range (4-11)
- 2026-02-24: Added Flappy Bird-style mini-game that unlocks when player completes a level; HTML canvas, spacebar controls, gravity physics, obstacle dodging, survival timer
- 2026-02-21: Added level system with number ranges and auto level-up after 5 correct answers; level display with progress bar
- 2026-02-20: Added character selection screen - player can choose to be the dog or the dragon, with adapted messages, animations, and labels
- 2026-02-20: Upgraded to "Night Dog Math Attack" theme with dog hero, dragon villain, nighttime color scheme, shake/bounce/flash animations, themed feedback messages, and generated character images
- 2026-02-20: Initial build of math game with all 4 operations, score tracking, streaks, and kid-friendly theme

## Project Architecture
- **Frontend**: React + TypeScript with Tailwind CSS and shadcn/ui components
- **Game Page**: `client/src/pages/math-game.tsx` - Main game component with all logic
- **Mini-Game**: `client/src/components/flappy-mini-game.tsx` - Flappy Bird-style bonus game using HTML canvas
- **Images**: `client/public/images/dog-hero.png` and `client/public/images/dragon-villain.png`
- **Theme**: Dark nighttime color scheme (deep blue/navy) with amber/gold accents in `client/src/index.css`
- **Font**: Poppins for friendly, rounded text
- **Animations**: Framer Motion - dog bounces on correct, dragon flashes on wrong, both shake, twinkling stars background

## Key Features
- Character selection: Play as the dog OR the dragon
- 4 math operations: Addition, Subtraction, Multiplication, Division
- 15-level progression system (Level 1: 1-5, Level 2: 4-7, Levels 3-15: 4-11)
- Flappy mini-game bonus between levels (spacebar to fly, dodge obstacles, survival timer)
- Dog hero and dragon villain characters with images
- Character-specific feedback messages (dog winner/dragon winner on correct, bad dragon/bad dog on wrong)
- Shake, bounce, flash, and glow animations on answers (player bounces on correct, opponent flashes on wrong)
- Twinkling star background for nighttime theme
- Score, streak, best streak tracking
- Switch Character button to go back to selection
- Auto-generates new question after answering
- Enter key support for quick submission
- Responsive design for all screen sizes

## User Preferences
- Code should be simple and well-commented (kid-friendly learning project)
