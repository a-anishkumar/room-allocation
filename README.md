# Hostel Management System — Room Allocation

A modern web application for managing hostel room allocations, student profiles, leave applications, feedback, and admin operations. Built with React + Vite, it provides a streamlined experience for both students and administrators with role-based access and a visual room grid for allocations.

## Features

- Room selection and allocation with visual grid
- Role-based views for students and admins
- Student profile management
- Leave applications (student submission and admin review)
- Feedback collection and management
- View vacant rooms and handle room requests
- Printable/downloadable allocation details (via jsPDF)

## Tech Stack

- React (Vite)
- React Router
- Supabase (data/auth integration)
- Heroicons
- jsPDF

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (if using cloud data/auth)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` (or `.env.local`) at the project root with your Supabase credentials:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are consumed in `src/utils/supabase.js` using Vite's import meta env.

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview build locally
- `npm run lint` — run ESLint

## Project Structure

```
src/
  components/           # Reusable UI components
    admin/              # Admin-only views (allocations, requests, feedback, etc.)
  pages/                # Route-level pages (Login, Profile, RoomSelection, etc.)
  contexts/             # React context (e.g., UserContext)
  utils/                # Helpers (Supabase client, storage utils)
  styles/               # CSS modules for pages/components
```

Key files:

- `src/utils/supabase.js` — Supabase client setup
- `src/pages/RoomSelection.jsx` — student room selection flow
- `src/components/RoomGrid.jsx` — visual room grid
- `src/components/admin/*` — admin dashboards and tools

## Configuration Notes

- Make sure your `.env` values match Supabase project's URL and anon key.
- Update storage/menu/room helpers in `src/utils/` if switching between local mock storage and Supabase.

## Contributing

1. Fork the repo and create a feature branch
2. Make your changes with clear, readable code
3. Run `npm run lint` and ensure there are no errors
4. Open a PR with a concise description of the change

## License

This project is licensed under the MIT License. See `LICENSE` if present, or include one when publishing.
