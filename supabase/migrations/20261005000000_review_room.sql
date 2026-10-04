-- Live review room: an admin hosts, approved members vote on whichever
-- applicant the host puts on screen, and only while the host has voting open.

create table public.review_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  status text not null default 'live' check (status in ('live', 'ended')),
  current_application_id uuid references public.applications (id) on delete set null,
  voting text not null default 'idle' check (voting in ('idle', 'open', 'locked')),
  created_by uuid references public.members (id) on delete set null,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

-- One live room at a time.
create unique index review_rooms_one_live_idx on public.review_rooms ((true))
  where status = 'live';

create table public.room_participants (
  room_id uuid not null references public.review_rooms (id) on delete cascade,
  member_id uuid not null references public.members (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references public.members (id) on delete set null,
  primary key (room_id, member_id)
);

-- Which room a vote was cast in.
alter table public.votes
  add column room_id uuid references public.review_rooms (id) on delete set null;

create index votes_room_idx on public.votes (room_id);

-- Helpers ----------------------------------------------------------------------

create function public.live_room_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select r.id from public.review_rooms r where r.status = 'live'
$$;

create function public.is_approved_participant(target_room uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.room_participants p
    where p.room_id = target_room
      and p.member_id = public.current_member_id()
      and p.status = 'approved'
  )
$$;

/*
 * A member may vote on an applicant only while it is on screen in the live
 * room, the host has voting open, and they've been let in. Admins never vote.
 */
create function public.can_vote(target_application uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not public.is_admin()
    and exists (
      select 1
      from public.review_rooms r
      where r.status = 'live'
        and r.current_application_id = target_application
        and r.voting = 'open'
        and public.is_approved_participant(r.id)
    )
$$;

-- Votes: only from inside the room -------------------------------------------

drop policy "members cast their own vote" on public.votes;
drop policy "members change their own vote" on public.votes;

create policy "members vote in the live room"
  on public.votes for insert
  to authenticated
  with check (
    member_id = public.current_member_id()
    and public.can_vote(application_id)
    and room_id = public.live_room_id()
  );

create policy "members change their vote in the live room"
  on public.votes for update
  to authenticated
  using (member_id = public.current_member_id() and public.can_vote(application_id))
  with check (
    member_id = public.current_member_id()
    and public.can_vote(application_id)
    and room_id = public.live_room_id()
  );

-- Rooms --------------------------------------------------------------------------

alter table public.review_rooms enable row level security;

create policy "rooms are visible to members"
  on public.review_rooms for select
  to authenticated
  using (public.is_member());

create policy "admins open rooms"
  on public.review_rooms for insert
  to authenticated
  with check (public.is_admin());

create policy "admins run rooms"
  on public.review_rooms for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Participants -------------------------------------------------------------------

alter table public.room_participants enable row level security;

create policy "participants see their own request; admins see all"
  on public.room_participants for select
  to authenticated
  using (member_id = public.current_member_id() or public.is_admin());

create policy "members ask to join the live room"
  on public.room_participants for insert
  to authenticated
  with check (
    member_id = public.current_member_id()
    and status = 'pending'
    and decided_by is null
    and not public.is_admin()
    and room_id = public.live_room_id()
  );

-- A denied member may ask again; nothing else about their row is theirs to change.
create policy "members ask again after a denial"
  on public.room_participants for update
  to authenticated
  using (member_id = public.current_member_id() and status = 'denied')
  with check (
    member_id = public.current_member_id()
    and status = 'pending'
    and decided_by is null
    and room_id = public.live_room_id()
  );

create policy "admins decide requests"
  on public.room_participants for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Realtime -----------------------------------------------------------------------

/*
 * Presence runs on the private channel `room:<id>`. Realtime Authorization
 * checks these policies when a client joins and tracks: hosts and approved
 * participants only.
 */
create policy "room channel: hosts and participants listen"
  on realtime.messages for select
  to authenticated
  using (
    realtime.topic() like 'room:%'
    and (
      public.is_admin()
      or public.is_approved_participant(nullif(split_part(realtime.topic(), ':', 2), '')::uuid)
    )
  );

create policy "room channel: hosts and participants share presence"
  on realtime.messages for insert
  to authenticated
  with check (
    realtime.topic() like 'room:%'
    and (
      public.is_admin()
      or public.is_approved_participant(nullif(split_part(realtime.topic(), ':', 2), '')::uuid)
    )
  );

-- Postgres Changes deliver row events subject to each table's RLS above, so
-- members only ever receive their own votes and their own request.
alter publication supabase_realtime add table
  public.review_rooms,
  public.room_participants,
  public.votes;
