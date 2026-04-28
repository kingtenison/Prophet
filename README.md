# Power BI Lite

A full-stack web-based Business Intelligence dashboard platform built with Next.js, Supabase, and Recharts. Upload CSV/Excel datasets, clean and explore the data, build interactive charts, and compose them into shareable dashboards — all from the browser.

## Features

- **Authentication**: Sign up / Sign in via Supabase Auth with email/password
- **Data Upload**: Drag-and-drop CSV/Excel upload with browser-side parsing
- **Data Cleaning**: Rename/drop columns, drop null rows
- **Chart Builder**: Bar, Line, Pie, Scatter, KPI, and Table widgets
- **Aggregations**: Sum, Average, Count, Min, Max
- **Filters**: Column-level filtering on charts
- **Dashboards**: Grid layout for widgets (CSS grid MVP), public sharing
- **Public Sharing**: Generate read-only links for dashboards
- ** beautiful UI**: Editorial-inspired design with fluid animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18 |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Charts | Recharts 2 |
| Parsers | Papa Parse (CSV), SheetJS (Excel) |
| State | Zustand |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Installation

1. **Clone & install**
   ```bash
   git clone <your-repo-url>
   cd powerbi-lite
   npm install
   ```

2. **Supabase setup**

   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL migration from `supabase/migrations/20240101000000_initial_schema.sql`
   - Create a Storage bucket named `datasets`
   - Copy your API keys

3. **Environment configuration**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
powerbi-lite/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── (protected)/              # Protected routes (middleware)
│   │   ├── dashboard/            # Home page
│   │   ├── datasets/             # Upload & clean data
│   │   ├── charts/               # Chart builder
│   │   └── dashboards/           # Dashboard editor & view
│   ├── dashboards/[id]/view/     # Public view (no auth)
│   └── layout.tsx
├── components/
│   ├── ui/                       # Reusable primitives (Button, Card, etc.)
│   ├── auth/                     # AuthCard
│   ├── upload/                   # DropZone, PreviewTable
│   ├── layout/                   # Navbar
│   └── charts/                   # Chart wrappers
├── lib/
│   ├── supabase/                 # Client & server clients
│   ├── parsers/                  # CSV/Excel parsing
│   └── data/                     # Aggregation & filtering
├── store/                        # Zustand state
├── types/                        # TypeScript definitions
└── supabase/
    ├── migrations/               # SQL schema
    └── SETUP.md                  # Setup guide
```

## Feature Overview

### MVP (Completed)

- ✅ Email authentication (sign up / sign in / out)
- ✅ CSV upload with client-side parsing
- ✅ 50-row data preview before confirm
- ✅ Basic data cleaning (rename columns, drop columns, drop null rows)
- ✅ Bar, Line, Pie chart types with Recharts
- ✅ Axis mapping (X, Y column selection)
- ✅ Aggregations (Sum, Avg, Count, Min, Max)
- ✅ Column filters on charts
- ✅ Live chart preview
- ✅ Save chart as widget to dashboard
- ✅ Dashboard editor (widget list, title edit, share toggle)
- ✅ Public shareable dashboard URL
- ✅ Client-side data processing; no heavy backend needed

### Stretch Goals (Not Implemented in MVP)

- Excel (.xlsx) upload support
- Scatter plot & KPI card
- Drag-and-drop grid layout (react-grid-layout)
- Export chart as PNG
- Export data as CSV
- Responsive / mobile layout
- Global date range filter on dashboard

## Data Flow

```
User uploads CSV → Parsed client-side (Papa Parse)
      ↓
Preview shown → Confirmed → Upload to Supabase Storage
      ↓
Metadata saved → DB row in datasets table
      ↓
Chart builder reads CSV from Storage → Aggregates in-memory → Recharts renders
      ↓
Widget config saved in dashboards.widgets
      ↓
Dashboard editor loads widgets → Public view renders from CSV again
```

## Database Schema

### profiles
- `id` (uuid, PK) → references auth.users
- `display_name` (text)
- `created_at` (timestamptz)

### datasets
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `name` (text)
- `file_path` (text) — path in Storage
- `columns` (jsonb) — [{name, type}]
- `row_count` (integer)
- `created_at` (timestamptz)

### dashboards
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `title` (text)
- `is_public` (boolean)
- `layout` (jsonb) — grid config
- `created_at`, `updated_at` (timestamptz)

### widgets
- `id` (uuid, PK)
- `dashboard_id` (uuid, FK → dashboards)
- `dataset_id` (uuid, FK → datasets)
- `type` (text) — bar|line|pie|scatter|kpi|table
- `config` (jsonb) — full chart config
- `position` (jsonb) — {x, y, w, h}

## RLS Policies

All tables have Row Level Security enabled:
- Users can only SELECT/INSERT/UPDATE/DELETE rows where `user_id = auth.uid()`
- Dashboards additionally have SELECT policy for `is_public = true`

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Check code style
npm run typecheck  # TypeScript type checking
```

## Design Philosophy

The UI aesthetic combines editorial typography with modern data dashboard clarity:

- **Typography**: Playfair Display for headings (serif, authoritative), Inter for UI (readable, neutral)
- **Color palette**: Primary blue (#0ea5e9), accent gradients, ample whitespace
- **Motion**: Subtle entry animations, hover lift effects, smooth transitions
- **Components**: Rounded cards, soft shadows, glassmorphism touches

The goal is a distinctive look that doesn't feel like a generic template.

## Testing

### Manual Testing Checklist

1. Sign up with a new email → redirects to home
2. Upload a valid CSV → preview shows correct columns and rows
3. Upload > 5MB file → size error message
4. Upload CSV with missing values → null count shown
5. Build bar chart → values match manual calc
6. Save chart to dashboard → widget appears
7. Toggle share on → public URL loads in incognito
8. Delete dataset → widgets no longer render

### Automated Testing (Future)

- Unit tests for `lib/data/aggregate.ts` (Jest)
- E2E tests with Playwright

## Deployment

Deploy to Vercel (Hobby tier free):

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy

Vercel provides:
- Free SSL
- Edge network CDN
- CI/CD from GitHub
- Automatic preview deployments

## Academic Context

This project fulfills the final year project requirements for 2025/2026 by demonstrating:

- Full-stack development (Next.js + Supabase + PostgreSQL)
- Database design (normalised schema, RLS, indexes)
- Real-world UX (drag-drop upload, live preview, responsive layout)
- Data processing (client-side aggregation & filtering)
- Deployment & DevOps (Vercel, CI/CD)

## Troubleshooting

**RlsPolicyError when uploading files**
- Verify the SQL migration ran successfully
- Make sure you're using the supabase-js v2 client
- Storage bucket must be private (not public)

**TypeError: PapaParse is not a function**
- Ensure `papaparse` is in dependencies
- Import as `import Papa from 'papaparse'`

**Charts not rendering**
- Check that X-axis column has categorical values (not purely numeric)
- For Pie charts, ensure X column is text
- Y column must be numeric

## License

Educational project — free to use and modify.

---

Built with care for the 2025/2026 academic year. May your data be clean and your charts beautiful.
