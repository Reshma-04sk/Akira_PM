# Akira-PM Frontend

This is the React 19 + TypeScript + Vite frontend application for **Akira-PM**, a production-grade SaaS Project Management platform.

## Folder Structure

The application follows a clean, component-oriented structure:

```text
src/
├── app/          # App bootstrap, providers, routing
├── components/   # Presentation components
│   ├── ui/       # Shared atomic UI controls (shadcn/ui style primitives)
│   ├── layout/   # Layout structures (Public, Protected, Blank)
│   └── common/   # Reusable placeholders (LoadingScreen, NotFound, ErrorBoundary, PageContainer)
├── features/     # Feature-based folders containing custom feature components
├── hooks/        # Shared react hooks
├── lib/          # External library configurations (e.g., Axios instance)
├── services/     # API request services / query abstractions
├── routes/       # Explicit route declarations/constants
├── types/        # Global TypeScript typings
├── utils/        # Generic helper functions
├── styles/       # Stylesheets
└── assets/       # Static assets (images, icons)
```

## Setup & Configuration

- **Absolute Imports**: Configured to resolve using `@/*` pointing to `src/*`.
- **Environment Variables**: Managed using Vite `.env` mechanics. See `.env.example` for details.
- **Theme Support**: Includes Light/Dark/System themes ready for themed styles via `ThemeProvider`.
- **Axios & API Interceptor**: Preconfigured under `src/lib/axios.ts` to support API endpoint routing and authorization header injection.
- **Error Boundary**: Implemented `ErrorBoundary` wrapping the React application node tree.

## Scripts

Execute from the workspace root (with standard pnpm or via local node context):

- `pnpm run dev` - Runs the development server
- `pnpm run build` - Builds production target
- `pnpm run lint` - Runs lints
- `pnpm run preview` - Previews local production build
