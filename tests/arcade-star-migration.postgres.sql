\set ON_ERROR_STOP on

-- This file runs only against the disposable PostgreSQL service in CI.
drop table if exists public.mej_student_progress;
create table public.mej_student_progress (
  student_ref text primary key,
  level_stats jsonb
);

insert into public.mej_student_progress(student_ref, level_stats) values
  ('legacy-200', '[{"level":1,"stars":200,"mastered":100,"completed":true,"note":"preserve"}]'::jsonb),
  ('legacy-50', '[{"level":1,"stars":50,"completed":false}]'::jsonb),
  ('legacy-30', '[{"level":1,"stars":30,"completed":false}]'::jsonb),
  ('new-40', '[{"level":1,"stars":40,"starTarget":50,"masteryPercent":80,"completed":false,"note":"new"}]'::jsonb),
  ('fallback-30', '[{"level":1,"mastered":15,"completed":false}]'::jsonb),
  ('fallback-over-50', '[{"level":1,"mastered":60,"completed":false}]'::jsonb),
  ('mixed', '[{"level":1,"stars":30,"mastered":15,"completed":false,"note":"legacy"},{"level":2,"stars":40,"starTarget":50,"masteryPercent":80,"completed":false,"note":"current"}]'::jsonb),
  ('empty-array', '[]'::jsonb),
  ('non-array', '{"level":1,"stars":200,"mastered":100}'::jsonb),
  ('stars-as-text', '[{"level":1,"stars":"50","mastered":100,"completed":false}]'::jsonb),
  ('current-marker-wins', '[{"level":1,"stars":200,"starTarget":50,"masteryPercent":400,"completed":false}]'::jsonb),
  ('missing-stars', '[{"level":1,"mastered":null,"completed":false}]'::jsonb);

\ir ../supabase/migrations/20261128143000_migrate_legacy_island_stars_div4.sql

do $$
declare
  v jsonb;
begin
  select level_stats into v from public.mej_student_progress where student_ref='legacy-200';
  if v->0->>'stars' <> '50' or v->0->>'starTarget' <> '50'
     or v->0->>'masteryPercent' <> '100' or v->0->>'completed' <> 'true'
     or v->0->>'note' <> 'preserve' then
    raise exception 'legacy-200 must convert to capped 50: %', v;
  end if;

  select level_stats into v from public.mej_student_progress where student_ref='legacy-50';
  if v->0->>'stars' <> '13' or v->0->>'starTarget' <> '50'
     or v->0->>'masteryPercent' <> '26' then
    raise exception 'legacy 50 must ceil to 13: %', v;
  end if;

  select level_stats into v from public.mej_student_progress where student_ref='legacy-30';
  if v->0->>'stars' <> '8' or v->0->>'starTarget' <> '50'
     or v->0->>'masteryPercent' <> '16' then
    raise exception 'legacy 30 must ceil to 8: %', v;
  end if;

  select level_stats into v from public.mej_student_progress where student_ref='new-40';
  if v <> '[{"level":1,"stars":40,"starTarget":50,"masteryPercent":80,"completed":false,"note":"new"}]'::jsonb then
    raise exception 'new-40 must remain unchanged: %', v;
  end if;

  select level_stats into v from public.mej_student_progress where student_ref='fallback-30';
  if v->0->>'stars' <> '8' or v->0->>'starTarget' <> '50'
     or v->0->>'masteryPercent' <> '16' then
    raise exception 'fallback effective 30 must ceil to 8: %', v;
  end if;

  select level_stats into v from public.mej_student_progress where student_ref='fallback-over-50';
  if v->0->>'stars' <> '30' or v->0->>'starTarget' <> '50'
     or v->0->>'masteryPercent' <> '60' then
    raise exception 'fallback mastered*2 conversion failed: %', v;
  end if;

  select level_stats into v from public.mej_student_progress where student_ref='mixed';
  if v->0->>'stars' <> '8' or v->0->>'starTarget' <> '50'
     or v->0->>'completed' <> 'false'
     or v->1 <> '{"level":2,"stars":40,"starTarget":50,"masteryPercent":80,"completed":false,"note":"current"}'::jsonb then
    raise exception 'mixed-scale array must convert only the legacy item: %', v;
  end if;

  select level_stats into v from public.mej_student_progress where student_ref='empty-array';
  if v <> '[]'::jsonb then raise exception 'empty array changed: %', v; end if;

  select level_stats into v from public.mej_student_progress where student_ref='non-array';
  if v <> '{"level":1,"stars":200,"mastered":100}'::jsonb then
    raise exception 'non-array JSON changed: %', v;
  end if;

  select level_stats into v from public.mej_student_progress where student_ref='stars-as-text';
  if v->0->>'stars' <> '13' or jsonb_typeof(v->0->'stars') <> 'number'
     or v->0->>'starTarget' <> '50' then
    raise exception 'numeric text stars must ceil to 13: %', v;
  end if;

  select level_stats into v from public.mej_student_progress where student_ref='current-marker-wins';
  if v <> '[{"level":1,"stars":200,"starTarget":50,"masteryPercent":400,"completed":false}]'::jsonb then
    raise exception 'starTarget=50 must never be converted: %', v;
  end if;

  select level_stats into v from public.mej_student_progress where student_ref='missing-stars';
  if v->0->>'stars' <> '0' or v->0->>'starTarget' <> '50'
     or v->0->>'masteryPercent' <> '0' then
    raise exception 'missing stars should use zero fallback and still be marked: %', v;
  end if;
end
$$;

-- Capture the first result, rerun the exact migration, and require a no-op.
create temporary table first_pass as
select student_ref, level_stats from public.mej_student_progress;

\ir ../supabase/migrations/20261128143000_migrate_legacy_island_stars_div4.sql

do $$
begin
  if exists (
    select 1
    from public.mej_student_progress actual
    full join first_pass prior using (student_ref)
    where actual.level_stats is distinct from prior.level_stats
       or actual.student_ref is null
       or prior.student_ref is null
  ) then
    raise exception 'second migration execution changed results';
  end if;
end
$$;
