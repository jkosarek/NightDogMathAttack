# Night Dog Math Attack

## Overview
A fun dog-and-dragon themed math game for kids. The heroic dog battles the sneaky dragon by solving math questions! Covers addition, subtraction, multiplication, and division with animations, score tracking, and themed feedback messages.

## Recent Changes
- 2026-02-20: Upgraded to "Night Dog Math Attack" theme with dog hero, dragon villain, nighttime color scheme, shake/bounce/flash animations, themed feedback messages, and generated character images
- 2026-02-20: Initial build of math game with all 4 operations, score tracking, streaks, and kid-friendly theme

## Project Architecture
- **Frontend**: React + TypeScript with Tailwind CSS and shadcn/ui components
- **Game Page**: `client/src/pages/math-game.tsx` - Main game component with all logic
- **Images**: `client/public/images/dog-hero.png` and `client/public/images/dragon-villain.png`
- **Theme**: Dark nighttime color scheme (deep blue/navy) with amber/gold accents in `client/src/index.css`
- **Font**: Poppins for friendly, rounded text
- **Animations**: Framer Motion - dog bounces on correct, dragon flashes on wrong, both shake, twinkling stars background

## Key Features
- 4 math operations: Addition, Subtraction, Multiplication, Division
- Dog hero and dragon villain characters with images
- Dog winner messages on correct answers, bad dragon messages on wrong answers
- Shake, bounce, flash, and glow animations on answers
- Twinkling star background for nighttime theme
- Score, streak, best streak tracking
- Auto-generates new question after answering
- Enter key support for quick submission
- Responsive design for all screen sizes

## User Preferences
- Code should be simple and well-commented (kid-friendly learning project)
