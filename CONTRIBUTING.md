# Contributing to Instrumento

Thanks for your interest in contributing!

## Getting Started

1. Fork the repository and clone your fork.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your `DATABASE_URL`.
4. Start the dev server: `npm run dev`

## Making Changes

- Create a branch for your change: `git checkout -b my-feature`
- Follow the existing code style — the project mixes `.ts/.tsx` and `.js/.jsx`; match the surrounding files.
- Keep audio logic in `src/lib/audio/` and UI in `src/components/` / `src/routes/`.
- Don't break existing instrument behavior — test piano, drums, and tuners after audio changes.
- Run the type check before submitting: `npx tsgo --noEmit`

## Pull Requests

- Describe what changed and why.
- Include screenshots for UI changes.
- Keep PRs focused — one feature or fix per PR.

## Reporting Issues

Open an issue with:

- What you expected vs. what happened
- Browser and OS
- Steps to reproduce
- Console errors, if any
