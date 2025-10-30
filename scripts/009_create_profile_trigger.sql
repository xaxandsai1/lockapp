-- Create trigger to automatically create profile on user signup
-- This ensures every auth.users entry has a corresponding profile

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    role,
    date_of_birth,
    country
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', 'User'),
    coalesce(new.raw_user_meta_data ->> 'role', 'SUB'),
    coalesce((new.raw_user_meta_data ->> 'date_of_birth')::date, '2000-01-01'::date),
    coalesce(new.raw_user_meta_data ->> 'country', 'PL')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
