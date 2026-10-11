-- Run AFTER schema.sql. Needed by the main app's subject-selection screen.
-- Returns which sessions / classes / topics exist for each subject (and how many
-- questions), without exposing any question content, so free users can still
-- see what is available before they activate.

create or replace function public.available_filters()
returns table (subject_id int, kind text, value text, total bigint)
language sql stable security definer set search_path = public as $$
  select subject_id, 'session', session, count(*) from public.questions where session is not null and session <> '' group by 1, 3
  union all
  select subject_id, 'class',   class_level, count(*) from public.questions where class_level is not null and class_level <> '' group by 1, 3
  union all
  select subject_id, 'topic',   topic, count(*) from public.questions where topic is not null and topic <> '' group by 1, 3;
$$;

revoke all on function public.available_filters() from public;
grant execute on function public.available_filters() to authenticated;
