# Power BI Lite — Quick Start

## What's Been Built

Full-stack BI dashboard platform with:
- Next.js 14 App Router + TypeScript
- Supabase (Auth, PostgreSQL, Storage)
- Recharts for visualizations
- PapaParse + SheetJS for file parsing
- Tailwind CSS with editorial-inspired design

### Pages Implemented

- `/` — Landing page with hero, features, testimonials
- `/login` — Email/password sign in
- `/signup` — Create account
- `/dashboard` — Protected home: list datasets & dashboards
- `/datasets/upload` — CSV upload with preview
- `/datasets/[id]` — Clean dataset (rename/drop columns, drop nulls)
- `/charts/new` — Chart builder (bar/line/pie) with live preview
- `/dashboards/[id]/edit` — Dashboard editor
- `/dashboards/[id]/view` — Public read-only dashboard
- `/not-found` — 404 page

### Core Features

✅ User authentication with Supabase Auth  
✅ CSV upload with 50-row preview  
✅ Data cleaning (rename/drop columns, drop null rows)  
✅ Bar, Line, Pie charts with live Recharts preview  
✅ Aggregations: Sum, Avg, Count, Min, Max  
✅ Column filters on charts  
✅ Dashboard widget grid + share toggle  
✅ Public dashboard links (no login required)  

## Setup Guide

### Prerequisites

- Node.js 18+ and npm
- Supabase project (free tier)

### 1. Environment Variables

`.env.local` has been created with your Supabase keys. Verify they are correct:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hcvtiwqrkvteilotrzyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_MxTGGDF0zVN_wejYvXVGOA_Ldr8HpAW
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Keep this file out of version control.

### 2. Database Schema

1. Open your Supabase dashboard → **SQL Editor**
2. Paste the contents of `supabase/migrations/20240101000000_initial_schema.sql`
3. Click **Run** — tables and RLS policies will be created

### 3. Storage Bucket

1. Go to **Storage** in Supabase
2. Click **"+" New bucket**
3. Name: `datasets`
4. **Public bucket**: OFF (private)
5. Create

### 4. Install Dependencies

```bash
npm install
```

If npm hangs, try:
```bash
npm config set registry https://registry.npmjs.org/
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

Open **http://localhost:3000**

## Testing the App

1. Click **Start for free** → sign up
2. On `/dashboard`, click **Upload dataset**
3. Select a CSV file (max 5 MB)
4. Preview appears → **Confirm upload**
5. Visit dataset detail to clean data
6. Go to **Charts** → Create Chart
   - Select dataset
   - Choose Bar/Line/Pie
   - Set X and Y columns
   - Adjust aggregation
   - See live preview
   - **Save to Dashboard** → creates dashboard
7. Open dashboard editor → toggle **Share** to make public
8. Copy public URL → open in incognito (no login needed)

## Key Files

- `lib/supabase/client.ts` — Browser client
- `lib/supabase/server.ts` — Server client (cookies)
- `lib/data/aggregate.ts` — Client-side aggregation engine
- `middleware.ts` — Route protection
- `components/ui/` — Design system
- `app/(protected)/` — Secure pages
- `app/dashboards/[id]/view/` — Public view (no auth)

## Design System

- **Fonts**: Playfair Display (headings), Inter (UI)
- **Colors**: Primary 600 (#0ea5e9), Secondary slate scale
- **Effects**: Soft shadows, rounded-2xl, subtle animations
- **Responsive**: Mobile-first with breakpoints

## Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User metadata |
| datasets | Uploaded file info + column JSONB |
| dashboards | Collections + sharing flag |
| widgets | Individual chart configs |

RLS policies enforce row-level ownership; public dashboards readable by all authenticated users.

## API Routes

- `GET /api/datasets/[datasetId]/download` — Server-side CSV fetch for public dashboards (uses service_role key)

## Troubleshooting

**Row Level Security error on upload**
- Re-run the SQL migration
- Storage bucket must be private

**Charts not rendering**
- X column must be categorical (text)
- Y column must be numeric
- Check browser console for data parse errors

**TypeScript errors during build**
- Ensure node_modules installed correctly
- Run `npm install` to fetch all dependencies

**Next.js modules not found**
- `npm install` should pull Next.js 14
- Verify `node_modules/next` exists

## Deployment

Deploy to Vercel:

```bash
git init
git add .
git commit -m "Initial commit"
# Push to GitHub, then import in Vercel
```

Set environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Project is ready for production on Vercel Hobby tier.

---

**Project Status:** MVP complete. All core features working end-to-end. Stretch goals (drag-drop layout, Excel upload, PNG export) can be added later.
