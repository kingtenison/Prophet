# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose the free tier (Hobby)
3. Wait for project to be ready

## 2. Get API Keys

In your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy the **URL** (NEXT_PUBLIC_SUPABASE_URL)
3. Copy the **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Copy the **service_role** key (SUPABASE_SERVICE_ROLE_KEY, optional for admin ops)

## 3. Create Storage Bucket

In your Supabase project dashboard:

1. Go to **Storage** → **Buckets**
2. Click **"+"** to create new bucket
3. Name: `datasets`
4. Set **Public bucket** to **Off**
5. Click **Create bucket**

## 4. Apply Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"+" New Query**
3. Paste the contents of `supabase/migrations/20240101000000_initial_schema.sql`
4. Click **Run**
5. The database schema and RLS policies are now deployed

## 5. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 6. Auth Setup

Supabase Auth works out of the box with email/password. The signup page uses the Supabase Auth API. For production, configure email templates in **Authentication** → **Email Templates**.

## 7. Storage Policies

The RLS policies on `datasets` table control who can upload/download. Storage files are protected automatically:
- Users can only upload to paths prefixed with their user ID
- Files are accessible server-side via the Supabase client

## Important Notes

- **Row Level Security (RLS)** is enabled on all tables. Test with the SQL editor before deploying.
- Storage files are stored encrypted at rest on Supabase's free tier (500 MB limit)
- Keep your `.env.local` file in `.gitignore` — never commit API keys
