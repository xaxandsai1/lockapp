-- Create helper functions for common operations

-- Function to get active lock for a relationship
create or replace function public.get_active_lock(rel_id uuid)
returns uuid
language sql
stable
as $$
  select id from public.locks
  where relationship_id = rel_id
  and status = 'active'
  order by created_at desc
  limit 1;
$$;

-- Function to calculate remaining time for active locks
create or replace function public.calculate_remaining_time(lock_id uuid)
returns bigint
language plpgsql
stable
as $$
declare
  lock_record record;
  elapsed_seconds bigint;
begin
  select * into lock_record from public.locks where id = lock_id;
  
  if lock_record.status = 'completed' or lock_record.status = 'cancelled' then
    return 0;
  end if;
  
  if lock_record.status = 'paused' then
    return lock_record.remaining_seconds;
  end if;
  
  -- Calculate elapsed time since start or last resume
  elapsed_seconds := extract(epoch from (now() - lock_record.started_at))::bigint;
  
  return greatest(0, lock_record.remaining_seconds - elapsed_seconds);
end;
$$;

-- Function to get unread message count for a relationship
create or replace function public.get_unread_message_count(rel_id uuid, for_user_id uuid)
returns bigint
language sql
stable
as $$
  select count(*)
  from public.messages
  where relationship_id = rel_id
  and sender_id != for_user_id
  and is_read = false;
$$;

-- Function to get unread notification count
create or replace function public.get_unread_notification_count(for_user_id uuid)
returns bigint
language sql
stable
as $$
  select count(*)
  from public.notifications
  where user_id = for_user_id
  and is_read = false;
$$;
