# Power BI Lite — Agent Guide

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase keys
npm run dev
```

The app runs at http://localhost:3000.

## Core Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript compiler
```

## Supabase Local Development (Optional)

If you want to test locally with the Supabase CLI:

```bash
supabase start
supabase db reset
```

## Architecture Overview

### Directory Structure

- `app/` — Next.js App Router pages with route groups
  - `(auth)/` — Login & signup (public)
  - `(protected)/` — All user-facing app pages (requires auth)
- `components/` — Reusable UI components
  - `ui/` — Primitives (Button, Card, Input, etc.)
- `lib/` — Utilities and API clients
- `store/` — Zustand global state
- `supabase/` — Database migrations and setup docs

### Data Flow

1. User uploads CSV → parsed with PapaParse → preview shown
2. Confirmed → file uploaded to Supabase Storage  
3. Metadata saved to `datasets` table (columns as JSONB)
4. Chart builder reads from Storage → processes with `lib/data/aggregate.ts` → Recharts renders
5. Dashboard editor saves widget configs → `dashboards` + `widgets` tables

### Key Files

- `lib/supabase/client.ts` — Browser Supabase client (auth + storage + DB)
- `lib/supabase/server.ts` — Server component client (session handling)
- `lib/data/aggregate.ts` — Client-side group-by + aggregation
- `middleware.ts` — Route protection for `(protected)` group

### Database Schema

Four tables with Row Level Security (RLS):

- `profiles` — User display name
- `datasets` — Uploaded file metadata
- `dashboards` — Dashboard collections
- `widgets` — Individual chart configs

### State Management

Zustand stores:

- `useUploadStore` — File upload state
- `useChartBuilderStore` — Chart configuration
- `useDashboardStore` — Dashboard edit state

### RLS Policies

All tables have `USING (auth.uid() = user_id)` policies. Public dashboards have an additional SELECT policy for `is_public = true`.

### Styling

Tailwind CSS with custom design tokens in `tailwind.config.ts`. Base styles in `app/globals.css`.

Fonts: Inter (UI), Playfair Display (headings).

### Icons

Lucide React for iconography.

## Adding New Chart Types

1. Add icon to CHART_ICONS map in `app/(protected)/charts/new/page.tsx`
2. Add case to `renderChart()` function with Recharts component
3. Register type in `ChartType` enum (if needed)

## Migration Workflow

1. Write new SQL migration in `supabase/migrations/YYYYMMDDNN_name.sql`
2. Apply via Supabase dashboard SQL editor
3. Document in comments

## Common Issues

**"Invalid API key"** — double-check `.env.local` and that you copied the anon key correctly.

**"Row Level Security policy violation"** — verify RLS policies were applied from migration; check you're using the correct user context.

**"Module not found: papaparse"** — run `npm install` again; ensure `papaparse` is in `package.json`.

**"Charts not rendering"** — confirm X column is categorical and Y column is numeric; check browser console for data format errors.

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Performance Tips

- File size capped at 5 MB for MVP (see `maxSize` in DropZone)
- Client-side parsing limited to 50k rows by default
- CSS Grid for dashboard layout (no drag-drop library)
- All charts lazy-loaded with ResponsiveContainer

## Future Enhancement Ideas

- React-Grid-Layout for drag-and-drop positioning
- Excel file upload support
- Export to PNG/CSV
- Multi-series charts
- Date range filter on dashboards
- Mobile-responsive layout

---

Generated for Kilo agent automation. Last updated: April 2026.
