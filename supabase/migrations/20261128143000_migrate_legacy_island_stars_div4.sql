-- One-time conversion of historical island stats from the 0–200 scale to 0–50.
-- Only rows containing at least one effective legacy value above 50 are touched.
-- Missing/null stars use mastered * 2 as the old-scale estimate.
-- Once converted, every stars value is <= 50, so rerunning this migration is a no-op.
-- Source-only in this PR: never apply to the live database without explicit approval.

begin;

update public.mej_student_progress as progress
set level_stats = coalesce((
  select jsonb_agg(converted.value order by item.ordinality)
  from jsonb_array_elements(progress.level_stats)
       with ordinality as item(value, ordinality)
  cross join lateral (
    select least(
      50,
      greatest(
        0,
        floor(
          coalesce(
            case
              when (item.value->>'stars') ~ '^-?[0-9]+([.][0-9]+)?$'
                then (item.value->>'stars')::numeric
            end,
            case
              when (item.value->>'mastered') ~ '^-?[0-9]+([.][0-9]+)?$'
                then (item.value->>'mastered')::numeric * 2
            end,
            0
          ) / 4
        )::integer
      )
    ) as new_stars
  ) as converted_stars
  cross join lateral (
    select case
      when jsonb_typeof(item.value) = 'object' then
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                item.value,
                '{stars}',
                to_jsonb(converted_stars.new_stars),
                true
              ),
              '{starTarget}',
              '50'::jsonb,
              true
            ),
            '{masteryPercent}',
            to_jsonb(round(converted_stars.new_stars::numeric / 50 * 100)::integer),
            true
          ),
          '{completed}',
          to_jsonb(
            coalesce((item.value->>'completed')::boolean, false)
            or converted_stars.new_stars >= 50
          ),
          true
        )
      else item.value
    end as value
  ) as converted
), '[]'::jsonb)
where jsonb_typeof(progress.level_stats) = 'array'
  and exists (
    select 1
    from jsonb_array_elements(progress.level_stats) as legacy_item(value)
    where jsonb_typeof(legacy_item.value) = 'object'
      and coalesce(
        case
          when (legacy_item.value->>'stars') ~ '^-?[0-9]+([.][0-9]+)?$'
            then (legacy_item.value->>'stars')::numeric
        end,
        case
          when (legacy_item.value->>'mastered') ~ '^-?[0-9]+([.][0-9]+)?$'
            then (legacy_item.value->>'mastered')::numeric * 2
        end,
        0
      ) > 50
  );

commit;
