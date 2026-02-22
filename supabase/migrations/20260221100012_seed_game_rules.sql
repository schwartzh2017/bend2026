INSERT INTO documents (id, title, doc_type, content, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Game Rules',
  'game_rules',
  '# Game Rules

## Overview

Welcome to our game! The rules will be added here once we decide what we're playing.

## Getting Started

Stay tuned for the full rulebook. In the meantime, here's what we know:

- We're going to have a great time
- The game will be easy to learn
- Everyone can participate

## Scoring

Scoring details coming soon!

## Tips

1. Have fun
2. Play fair
3. Enjoy the company

> "The best game is the one played with friends."

*Check back later for the complete rules!*',
  now(),
  now()
)
ON CONFLICT DO NOTHING;
