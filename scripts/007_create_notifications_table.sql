-- Create notifications table for in-app notifications
-- Tracks all important events for users

create type notification_type as enum (
  'relationship_request',
  'relationship_accepted',
  'relationship_ended',
  'lock_created',
  'lock_time_changed',
  'lock_completed',
  'task_assigned',
  'task_submitted',
  'task_reviewed',
  'message_received'
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.notifications enable row level security;

-- RLS Policies for notifications
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_insert_system"
  on public.notifications for insert
  with check (true); -- System can create notifications for any user

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications_delete_own"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);
create index if not exists notifications_created_at_idx on public.notifications(created_at);
