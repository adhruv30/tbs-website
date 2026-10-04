-- Recruitment portal: applications, member votes, and the helpers RLS leans on.

-- Members sign in with Google; the session's email is matched against this
-- column, so it must be unique regardless of case.
alter table public.members
  add column auth_user_id uuid unique references auth.users (id) on delete set null;

-- The roster may have been filled in by hand: normalise what's there (blank
-- means "no sign-in"), then keep it lowercase so lookups can use equality.
-- If the unique index below fails, two members share an email: fix the
-- roster and re-run.
update public.members
set email = nullif(lower(btrim(email)), '')
where email is distinct from nullif(lower(btrim(email)), '');

alter table public.members
  add constraint members_email_lowercase check (email = lower(btrim(email)) and email <> '');

create unique index members_email_lower_idx on public.members (lower(email));

/*
 * The signed-in member: the roster row whose email matches the signed-in
 * account's. Read from auth.users rather than the JWT, and only once the
 * address is confirmed -- Google sign-ins always are, but an email/password
 * sign-up claiming a roster address is not until its owner clicks the link,
 * so it can't borrow that member's access. `security definer` so policies
 * can call it without recursing into the members table's own RLS (and so it
 * can read auth.users).
 *
 * Re-evaluated on every query, so roster edits take effect immediately:
 * flipping `is_admin` changes access on the next page load, and clearing a
 * member's email locks them out.
 */
create function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.id
  from auth.users u
  join public.members m on m.email = lower(u.email)
  where u.id = auth.uid()
    and u.email_confirmed_at is not null
$$;

create function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_member_id() is not null
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select m.is_admin from public.members m where m.id = public.current_member_id()),
    false
  )
$$;

create policy "members are visible to members"
  on public.members for select
  to authenticated
  using (public.is_member());

-- Applications ---------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  cycle text not null,
  email text not null,
  name text not null,
  phone text,
  year smallint check (year between 1 and 5),
  major text not null,
  grad_term text not null,
  gpa numeric(3, 2) check (gpa between 0 and 4),
  answers jsonb not null default '{}',
  photo_path text,
  resume_path text,
  created_at timestamptz not null default now()
);

-- One application per email per recruitment cycle. The apply action checks
-- first for a friendly message, but this index is what actually enforces it.
create unique index applications_cycle_email_idx
  on public.applications (cycle, lower(email));

create index applications_created_at_idx on public.applications (created_at);

alter table public.applications enable row level security;

-- No insert policy: submissions go through a server action using the service
-- role, so the anon key can neither read nor write applications.
create policy "applications are visible to members"
  on public.applications for select
  to authenticated
  using (public.is_member());

-- Votes ----------------------------------------------------------------------

create table public.votes (
  application_id uuid not null references public.applications (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  vote text not null check (vote in ('yes', 'no', 'abstain')),
  updated_at timestamptz not null default now(),
  primary key (application_id, member_id)
);

create index votes_member_idx on public.votes (member_id);

alter table public.votes enable row level security;

-- Members see only their own ballot; admins see every one.
create policy "votes are visible to their caster or admins"
  on public.votes for select
  to authenticated
  using (member_id = public.current_member_id() or public.is_admin());

-- Admins run the process and read the results; only active members vote.
create policy "members cast their own vote"
  on public.votes for insert
  to authenticated
  with check (member_id = public.current_member_id() and not public.is_admin());

create policy "members change their own vote"
  on public.votes for update
  to authenticated
  using (member_id = public.current_member_id() and not public.is_admin())
  with check (member_id = public.current_member_id() and not public.is_admin());

/*
 * Per-applicant tallies. `security_invoker` makes it obey the votes policies,
 * so a non-admin reading it only ever counts their own vote.
 */
create view public.application_vote_summary
with (security_invoker = true)
as
select
  a.id as application_id,
  count(v.vote) filter (where v.vote = 'yes')::int as yes,
  count(v.vote) filter (where v.vote = 'no')::int as no,
  count(v.vote) filter (where v.vote = 'abstain')::int as abstain,
  count(v.vote)::int as total
from public.applications a
left join public.votes v on v.application_id = a.id
group by a.id;

-- Settings -------------------------------------------------------------------

-- One row of portal-wide settings, set by admins on the admin page.
create table public.portal_settings (
  id boolean primary key default true check (id),
  -- Yes votes an applicant needs to be marked as meeting the bar. 0 = off.
  vote_threshold integer not null default 0 check (vote_threshold >= 0),
  -- Hide which member cast which vote, leaving only the tallies.
  anonymize_votes boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.members (id) on delete set null
);

insert into public.portal_settings (id) values (true);

alter table public.portal_settings enable row level security;

create policy "settings are visible to members"
  on public.portal_settings for select
  to authenticated
  using (public.is_member());

create policy "admins change settings"
  on public.portal_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Storage --------------------------------------------------------------------

-- Headshots and resumes, under `<application_id>/`. Private: pages hand out
-- short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'applications',
  'applications',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create policy "application files are readable by members"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'applications' and public.is_member());
