# Civic Issue Tracker

Let residents of Finnish municipalities create accounts, report and track local
infrastructure issues (potholes, broken streetlights, etc.), upvote and comment
on existing reports, and see status updates from moderators — all mapped to
their municipality, and cross-referenced against official open municipal data
on planned maintenance.

## Monorepo layout
civic-issue-tracker/
├── client/ React + Vite + TypeScript + Tailwind CSS frontend (Finnish + English)
├── server/ Node.js + Express + TypeScript + MongoDB backend
└── .github/ CI/CD workflows


## Tech stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Leaflet (maps), react-i18next (fi/en)
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT auth
- **Testing:** Vitest + Supertest (backend), Vitest + React Testing Library (frontend)
- **CI/CD:** GitHub Actions
- **Deployment:** Render (separate Web Service for the API, Static Site for the client)

## Status

Work in progress — built step by step as a course project for LUT University's
Full Stack Web Development course.

## Getting started

```bash
npm install
npm run dev:server   # starts the API
npm run dev:client   # starts the frontend
```

Each workspace has its own `.env.example` describing required environment variables.