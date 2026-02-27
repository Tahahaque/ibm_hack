# BuckeyeBoard

BuckeyeBoard is a React + TypeScript web app for student event discovery, RSVP planning, and schedule/calendar management.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview production build:

```bash
npm run preview
```

## Main Routes

- `/login` – login screen
- `/feed` – event feed
- `/calendar` – all-events weekly calendar
- `/schedule` – class calendar + personal calendar (classes + RSVP events)
- `/create` – create event form
- `/profile` – user profile
- `/org/:id` – organization page
- `/org-dashboard` – org dashboard

## UI Layout Notes

- The app uses full-width responsive layout for core pages so content can use available screen space.
- Calendar views are expanded with larger day columns and improved spacing for readability.
- The Create Event page is intentionally centered with a narrower max width for better form scanning on large screens.

## Project Structure

- `src/pages` – route pages
- `src/components` – reusable UI and layout components
- `src/context` – app state/context
- `src/data` – mock/demo data
- `src/services` – integration placeholders (Firebase / Watsonx)
- `src/types` – shared TypeScript types

## Notes

- Some AI/Firebase integration points are marked as TODO placeholders for future backend wiring.
