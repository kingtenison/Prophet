# Quick Setup Guide

## 1. Run Database Migration

Copy and paste this SQL into your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (stores user profile data)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz DEFAULT now()
);

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  file_path text NOT NULL,
  columns jsonb NOT NULL DEFAULT '[]',
  row_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Dashboard',
  is_public boolean DEFAULT false,
  layout jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Widgets table
CREATE TABLE IF NOT EXISTS widgets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id uuid REFERENCES dashboards(id) ON DELETE CASCADE NOT NULL,
  dataset_id uuid REFERENCES datasets(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('bar', 'line', 'pie', 'scatter', 'kpi', 'table')),
  config jsonb NOT NULL DEFAULT '{}',
  position jsonb NOT NULL DEFAULT '{"x":0,"y":0,"w":6,"h":4}',
  created_at timestamptz DEFAULT now()
);

-- Storage bucket for datasets
INSERT INTO storage.buckets (id, name, public) VALUES ('datasets', 'datasets', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own datasets" ON datasets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own dashboards" ON dashboards
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public dashboards are viewable by all" ON dashboards
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage widgets in own dashboards" ON widgets
  FOR ALL USING (
    dashboard_id IN (SELECT id FROM dashboards WHERE user_id = auth.uid())
  )
  WITH CHECK (
    dashboard_id IN (SELECT id FROM dashboards WHERE user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_widgets_dashboard_id ON widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_widgets_dataset_id ON widgets(dataset_id);

-- Auto-update updated_at for dashboards
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## 2. Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **"+" New bucket**
3. Name: `datasets`
4. **Public bucket**: **OFF** (private)
5. Click **Create bucket**

## 3. Start Development Server

```bash
npm run dev
```

App runs at **http://localhost:3000**

## Project Structure

```
powerbi-lite/
├── app/
│   ├── (auth)/         → /login, /signup
│   ├── (protected)/    → all authenticated routes
│   ├── api/            → serverless API routes
│   └── layout.tsx
├── components/
│   ├── ui/             → Button, Card, Input, etc.
│   ├── auth/
│   ├── upload/
│   └── layout/
├── lib/
│   ├── supabase/
│   ├── parsers/
│   └── data/
├── store/              → Zustand stores
├── types/              → TypeScript definitions
└── supabase/
    └── migrations/     → SQL schema (already applied)
```

## MVP Features Implemented

✅ Email authentication (Supabase Auth)
✅ CSV upload with client-side parsing (Papa Parse)
✅ 50-row preview before confirm
✅ Data cleaning: rename/drop columns, drop null rows
✅ Charts: bar, line, pie with live Recharts preview
✅ Aggregations: sum, avg, count, min, max
✅ Column filters
✅ Dashboard editor + public sharing
✅ Client-side data processing (no heavy backend)

## Testing Checklist

1. Open http://localhost:3000
2. Click "Start for free" → signup
3. Upload a CSV (sample data works)
4. Preview → confirm
5. Go to dataset detail → try cleaning operations
6. Chart Builder → configure a bar chart → save to dashboard
7. Dashboard editor → toggle "Share" on
8. Copy public link → open in incognito (should render)

All data persists in your Supabase project.
