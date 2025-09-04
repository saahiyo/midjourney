# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

# MidJourney Preview (React + Vite)

This small React + Vite app provides a UI for generating image previews via a MidJourney-like proxy API. It focuses on a clean UX: prompt entry, aspect-ratio presets, example prompts, and a responsive results grid.

## Features
- Prompt input with example prompts (click to paste into the prompt box)
- Aspect ratio presets (1:1, 3:2, 16:9, 21:9, 2:3, 9:16)
- Deduped result grid (identical image URLs are removed)
- Progress bar with moving percentage label during generation
- Error and empty states rendered inside the results area

## Quick start

Requirements: Node.js (16+ recommended) and npm.

1. Install dependencies

```powershell
npm install
```

2. Start the dev server

```powershell
npm run dev
```

3. Open the app in your browser (Vite will print the local URL)

## How to use
- Type a prompt in the left column and choose an aspect ratio.
- Click Generate to start a job. While the job runs the results area shows a progress bar and percentage that moves with the bar.
- If the app shows "No images to display", click one of the example chips to paste a ready-made prompt into the input.
- Each generated image has a Download button.

## Notes
- Polling timeout: the app waits up to 5 minutes for the generation to complete (configurable in `src/App.jsx`).
- The empty state includes example prompts and quick tips to reduce friction for new users.
- Deduplication is performed by comparing image URLs. If your API returns unique URLs for identical images you may want to dedupe by image content or an ID instead.

## Troubleshooting
- If Generate doesn't start, verify there is a prompt in the input and check the browser console for errors.
- If the proxy API is down or slow the UI will show errors or may time out. You can cancel a running job by pressing Clear.

## Development notes
- The main UI lives in `src/App.jsx`.
- Feel free to add example prompts, tweak the polling timeout, or improve the dedupe logic.

---

If you'd like, I can add a short CONTRIBUTING section or update `package.json` scripts for deployment. Tell me what you'd like next.
