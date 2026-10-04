-- AURA recruitment applications.
-- Written only by the server (service role) through /api/apply. No public policies exist:
-- the anon / authenticated roles cannot read or write this table. Selection tooling should
-- use its own authenticated admin surface, kept separate from the public site.

create extension if not exists "pgcrypto";

create table if not exists public.aura_applications (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  team          text not null check (team in ('technical', 'creatives', 'operations')),

  full_name           text not null,
  registration_number text not null,
  email               text not null,
  phone               text not null,
  linkedin_url        text,

  existing_clubs        boolean not null default false,
  existing_club_details text,
  experience            text,

  -- technical
  github_url                text,
  technical_work_links      text[],
  technical_project_story   text,
  technical_ai_usage        text,
  technical_build_idea      text,

  -- creatives
  creative_interests        text[],
  creative_portfolio_links  text[],
  creative_notes            text,

  -- operations
  operations_interests              text[],
  operations_responsibility_story   text,
  operations_notes                  text,

  status text not null default 'submitted'
    check (status in ('submitted', 'profile_review', 'project_round', 'interview', 'selected', 'rejected')),

  -- idempotency: one click == one row, even if the request is retried
  submission_nonce text not null unique,

  constraint aura_applications_one_per_team unique (email, team)
);

create index if not exists aura_applications_created_idx on public.aura_applications (created_at desc);
create index if not exists aura_applications_team_status_idx on public.aura_applications (team, status);

alter table public.aura_applications enable row level security;
-- Intentionally no policies. The service role bypasses RLS; everyone else is denied.
revoke all on public.aura_applications from anon, authenticated;
