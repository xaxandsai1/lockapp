-- Create audit_logs table for comprehensive activity tracking
-- Required for GDPR compliance and security monitoring

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- RLS Policies for audit_logs
-- Only admins can view audit logs (we'll add admin role later)
create policy "audit_logs_select_own"
  on public.audit_logs for select
  using (auth.uid() = user_id);

create policy "audit_logs_insert_system"
  on public.audit_logs for insert
  with check (true); -- System can create audit logs

-- Create indexes
create index if not exists audit_logs_user_id_idx on public.audit_logs(user_id);
create index if not exists audit_logs_action_idx on public.audit_logs(action);
create index if not exists audit_logs_resource_type_idx on public.audit_logs(resource_type);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at);
