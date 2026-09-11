create table public.members (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  email text unique,
  name text not null,
  role text,
  is_exec boolean not null default false,
  is_admin boolean not null default false,
  year smallint check (year between 1 and 5),
  major text,
  hometown text,
  career_interests text[] not null default '{}',
  hobbies text[] not null default '{}',
  photo_path text,
  linkedin_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.members(id)
);

create index members_slug_idx on public.members (slug);
create index members_email_idx on public.members (email);

alter table public.members enable row level security;