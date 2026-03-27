# EcoSpark Hub Frontend

Client application for EcoSpark Hub built with Next.js + Tailwind CSS.

## Features

- Public home page with hero, search, top-voted ideas, and newsletter.
- Ideas listing with search, filters, sorting, and pagination.
- Idea details page with paid/free badges, paywall UX, voting, and nested comments.
- Role-aware dashboard UI (member + admin views).
- Authentication screens (register/login), profile page, about and blog pages.
- Responsive navigation with mobile menu and global footer.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Environment Variables

Create `./.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Local Development

```bash
bun install
bun dev
```

Frontend runs on `http://localhost:3000` by default.

## API Dependency

This app expects the backend API to be running and reachable through `NEXT_PUBLIC_API_URL`.

## Assignment Mapping (Frontend)

- Pages: Home, Ideas, Dashboard, About Us, Blog, Login/Register, My Profile.
- Responsive UI with reusable components.
- Loading and error states in key async flows.
- Paid idea lock/unlock user experience integrated with backend checkout flow.

## Deployment

Deploy on Vercel (recommended):

1. Import the repository in Vercel.
2. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
3. Deploy.
