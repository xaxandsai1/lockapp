-- Create locks table for time-based locks
-- Core feature of the application

create type lock_status as enum ('active', 'paused', 'completed', 'cancelled');

create table if not exists public.locks (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  name text not null,
  description text,
  status lock_status default 'active' not null,
  
  -- Time tracking
  initial_duration_seconds bigint not null check (initial_duration_seconds > 0),
  remaining_seconds bigint not null check (remaining_seconds >= 0),
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  completed_at timestamptz,
  
  -- Lock rules
  allow_keyholder_add_time boolean default true,
  allow_keyholder_remove_time boolean default false,
  allow_sub_request_time boolean default true,
  max_time_addition_seconds bigint,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.locks enable row level security;

-- RLS Policies for locks
create policy "locks_select_participants"
  on public.locks for select
  using (
    exists (
      select 1 from public.relationships r
      where r.id = locks.relationship_id
      and (r.sub_id = auth.uid() or r.keyholder_id = auth.uid())
    )
  );

create policy "locks_insert_keyholder"
  on public.locks for insert
  with check (
    exists (
      select 1 from public.relationships r
      where r.id = relationship_id
      and r.keyholder_id = auth.uid()
      and r.status = 'active'
    )
  );

create policy "locks_update_participants"
  on public.locks for update
  using (
    exists (
      select 1 from public.relationships r
      where r.id = locks.relationship_id
      and (r.sub_id = auth.uid() or r.keyholder_id = auth.uid())
    )
  );

create policy "locks_delete_keyholder"
  on public.locks for delete
  using (
    exists (
      select 1 from public.relationships r
      where r.id = locks.relationship_id
      and r.keyholder_id = auth.uid()
    )
  );

-- Create indexes
create index if not exists locks_relationship_id_idx on public.locks(relationship_id);
create index if not exists locks_status_idx on public.locks(status);
create index if not exists locks_started_at_idx on public.locks(started_at);

-- Add updated_at trigger
create trigger locks_updated_at
  before update on public.locks
  for each row
  execute function public.handle_updated_at();
