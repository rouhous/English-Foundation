-- One-time conversion of historical island stats from the 0–200 scale to 0–50.
-- The historical client (before the 2026-11-28 50-star progress payload)
-- wrote level/mastered/total/masteryPercent/completed, but no stars or starTarget.
-- The current client writes starTarget: 50. Any object whose starTarget
-- is distinct from 50 (including a missing marker) is legacy, regardless
-- of its effective star count. Missing/null stars use mastered * 2.
-- Items already marked starTarget: 50 are never converted, even in mixed arrays.
-- Source-only in this PR: never apply to the live database without explicit approval.

begin;

update public.mej_student_progress as progress
set level_stats = coalesce((
  select jsonb_agg(
    case
      when jsonb_typeof(item.value) = 'object'
       and item.value->>'starTarget' is distinct from '50'
             then
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                item.value,
                '{stars}',
                to_jsonb(converted.new_stars),
                true
              ),
              '{starTarget}',
              '50'::jsonb,
              true
            ),
            '{masteryPercent}',
            to_jsonb(round(converted.new_stars::numeric / 50 * 100)::integer),
            true
          ),
          '{completed}',
          to_jsonb(
            coalesce(
              case
                when item.value->>'completed' in ('true', 'false')
                  then (item.value->>'completed')::boolean
              end,
              false
            ) or converted.new_stars >= 50
          ),
          true
        )
      else item.value
    end
    order by item.ordinality
  )
  from jsonb_array_elements(
    case
      when jsonb_typeof(progress.level_stats) = 'array'
        then progress.level_stats
      else '[]'::jsonb
    end
  ) with ordinality as item(value, ordinality)
  cross join lateral (
    select coalesce(
      case
        when (item.value->>'stars') ~ '^-?[0-9]+([.][0-9]+)?$'
          then (item.value->>'stars')::numeric
      end,
      case
        when (item.value->>'mastered') ~ '^-?[0-9]+([.][0-9]+)?$'
          then (item.value->>'mastered')::numeric * 2
      end,
      0
    ) as effective_stars
  ) as effective
  cross join lateral (
    select least(
      50,
      greatest(0, ceiling(effective.effective_stars / 4)::integer)
    ) as new_stars
  ) as converted
), '[]'::jsonb)
where jsonb_typeof(progress.level_stats) = 'array'
  and exists (
    select 1
    from jsonb_array_elements(
      case
        when jsonb_typeof(progress.level_stats) = 'array'
          then progress.level_stats
        else '[]'::jsonb
      end
    ) as legacy_item(value)
    where jsonb_typeof(legacy_item.value) = 'object'
      and legacy_item.value->>'starTarget' is distinct from '50'
  );

commit;
