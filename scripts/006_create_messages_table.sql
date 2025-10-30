-- Create messages table for 1:1 chat between SUB and KEYHOLDER
-- Supports real-time messaging via Supabase Realtime

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- RLS Policies for messages
create policy "messages_select_participants"
  on public.messages for select
  using (
    exists (
      select 1 from public.relationships r
      where r.id = messages.relationship_id
      and (r.sub_id = auth.uid() or r.keyholder_id = auth.uid())
    )
  );

create policy "messages_insert_participants"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.relationships r
      where r.id = relationship_id
      and (r.sub_id = auth.uid() or r.keyholder_id = auth.uid())
    )
    and sender_id = auth.uid()
  );

create policy "messages_update_own"
  on public.messages for update
  using (
    exists (
      select 1 from public.relationships r
      where r.id = messages.relationship_id
      and (r.sub_id = auth.uid() or r.keyholder_id = auth.uid())
    )
  );

-- Create indexes
create index if not exists messages_relationship_id_idx on public.messages(relationship_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_created_at_idx on public.messages(created_at);
create index if not exists messages_is_read_idx on public.messages(is_read);
