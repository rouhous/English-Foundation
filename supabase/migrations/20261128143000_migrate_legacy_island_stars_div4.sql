-- One-time conversion of historical island stars from the 0–200 scale to 0–50.
-- Conversion preserves every previously earned 20-star badge:
-- floor(floor(old_stars / 4) / 5) = floor(old_stars / 20).
-- If stars is absent/null, use the existing legacy estimate mastered * 2
-- as the old-scale star value before dividing by four.
-- Source-only in this PR: do not apply to the live database without approval.

begin;

update public.mej_student_progress as progress
set level_stats = coalesce((
  select jsonb_agg(
    case
      when jsonb_typeof(item.value) = 'object' then
        jsonb_set(
          item.value,
          '{stars}',
          to_jsonb(
            least(
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
            )
          ),
          true
        )
      else item.value
    end
    order by item.ordinality
  )
  from jsonb_array_elements(progress.level_stats) with ordinality as item(value, ordinality)
), '[]'::jsonb)
where jsonb_typeof(progress.level_stats) = 'array';

commit;
