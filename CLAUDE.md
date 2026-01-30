# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

This is a Next.js 16 project using the App Router pattern with TypeScript and Tailwind CSS 4.

**Key structure:**

- `app/` - App Router pages and layouts (React Server Components by default)
- `app/layout.tsx` - Root layout with metadata and Geist font
- `app/page.tsx` - Home page
- `app/globals.css` - Global styles with Tailwind
- `public/` - Static assets

**Path alias:** `@/*` maps to the project root for imports.

## Project rules

Don't run lint and build automatically, only run when I tell you to do
