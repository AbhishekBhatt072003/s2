-- Run this once in Supabase SQL Editor (Project → SQL → New query → paste → Run).
-- Then click 'Save' to keep it in your history.

create extension if not exists pgcrypto;

create table if not exists config (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists drive_media (
  id uuid primary key default gen_random_uuid(),
  drive_file_id text not null,
  file_name text,
  mime_type text,
  section text,
  associated_id text,
  display_order int default 0,
  thumbnail_link text,
  created_at timestamptz default now(),
  unique(drive_file_id)
);

create table if not exists google_tokens (
  id text primary key,
  access_token text,
  expires_at timestamptz,
  scope text,
  updated_at timestamptz default now()
);

-- All access is via SERVICE_ROLE from the Next.js server, so RLS can be disabled for simplicity.
alter table config disable row level security;
alter table drive_media disable row level security;
alter table google_tokens disable row level security;
