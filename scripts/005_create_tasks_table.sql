-- Create tasks table for SUB tasks assigned by KEYHOLDER
-- Supports check-in, quiz, and proof types

create type task_type as enum ('check_in', 'quiz', 'proof');
create type task_status as enum ('pending', 'submitted', 'approved', 'rejected');

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  lock_id uuid references public.locks(id) on delete set null,
  
  title text not null,
  description text,
  task_type task_type not null,
  status task_status default 'pending' not null,
  
  -- Task configuration
  time_reward_seconds bigint default 0 check (time_reward_seconds >= 0),
  time_penalty_seconds bigint default 0 check (time_penalty_seconds >= 0),
  
  -- Quiz specific fields (JSON for flexibility)
  quiz_data jsonb, -- { question: string, options: string[], correctAnswer: number }
  
  -- Proof specific fields
  requires_photo boolean default false,
  requires_text boolean default false,
  
  -- Submission data
  submitted_at timestamptz,
  submission_text text,
  submission_photo_url text,
  quiz_answer integer,
  
  -- Review data
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_notes text,
  
  due_date timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.tasks enable row level security;

-- RLS Policies for tasks
create policy "tasks_select_participants"
  on public.tasks for select
  using (
    exists (
      select 1 from public.relationships r
      where r.id = tasks.relationship_id
      and (r.sub_id = auth.uid() or r.keyholder_id = auth.uid())
    )
  );

create policy "tasks_insert_keyholder"
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.relationships r
      where r.id = relationship_id
      and r.keyholder_id = auth.uid()
    )
  );

create policy "tasks_update_participants"
  on public.tasks for update
  using (
    exists (
      select 1 from public.relationships r
      where r.id = tasks.relationship_id
      and (r.sub_id = auth.uid() or r.keyholder_id = auth.uid())
    )
  );

create policy "tasks_delete_keyholder"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.relationships r
      where r.id = tasks.relationship_id
      and r.keyholder_id = auth.uid()
    )
  );

-- Create indexes
create index if not exists tasks_relationship_id_idx on public.tasks(relationship_id);
create index if not exists tasks_lock_id_idx on public.tasks(lock_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_date_idx on public.tasks(due_date);

-- Add updated_at trigger
create trigger tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();
