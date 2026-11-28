-- Align arcade badge unlocks with the journey's 50-star island scale.
-- Badge n unlocks at 5*n stars (5, 10, ... 50).
-- Legacy rows without level_stats[].stars retain the documented mastered*2 fallback.
-- This file is source-only until explicitly applied in a coordinated release.

begin;

create or replace function public.mej_arcade_action(
 p_student_ref text,
 p_action text,
 p_stage integer,
 p_badge integer,
 p_game text,
 p_run_id uuid default null::uuid,
 p_score integer default null::integer
)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare
 prog record; rec record; rn record; old_best integer:=0; att integer:=0;
 awarded integer:=0; new_best integer:=0; wanted text; codes text[];
 key_lock bigint; result jsonb;
begin
 if p_student_ref is null or length(p_student_ref) not between 32 and 100
  or p_stage not between 0 and 12 or p_badge not between 1 and 10
  then return jsonb_build_object('ok',false,'error','INVALID_ID'); end if;
 key_lock:=hashtextextended('mej-arcade-v1:'||p_student_ref||':'||p_stage||':'||p_badge,0);
 perform pg_advisory_xact_lock(key_lock);
 select * into prog from public.mej_student_progress
  where student_ref=p_student_ref for share;
 if not found then return jsonb_build_object('ok',false,'error','PROGRESS_NOT_SYNCED'); end if;
 if not exists(select 1 from public.mej_licenses where id=prog.license_id and active=true) then
  return jsonb_build_object('ok',false,'error','LICENSE_INACTIVE');
 end if;
 if prog.grade is null or prog.grade not between 1 and 12 then
  return jsonb_build_object('ok',false,'error','INVALID_GRADE');
 end if;
 if prog.grade<=4 then codes:=array['moving','match','memory','word','hidden','falling','sentence','safari','maze','story'];
 elsif prog.grade<=9 then codes:=array['flip','match','word','memory','hidden','falling','vocab','sentence','grammar','mission'];
 else codes:=array['flip','grammar','vocab','sentence','falling','evidence','detective','mission','argument','escape']; end if;
 wanted:=codes[p_badge];
 if p_game is distinct from wanted then return jsonb_build_object('ok',false,'error','INVALID_GAME'); end if;
 if p_game='hidden' then return jsonb_build_object('ok',false,'error','HIDDEN_PRACTICE_ONLY'); end if;

 -- The island now has 50 stars. Prefer the authoritative stars field;
 -- for legacy progress rows, estimate the documented minimum from mastered*2.
 if coalesce((
   select least(50,greatest(0,coalesce((x->>'stars')::integer,coalesce((x->>'mastered')::integer,0)*2)))
   from jsonb_array_elements(
     case when jsonb_typeof(prog.level_stats)='array' then prog.level_stats else '[]'::jsonb end
   ) x where (x->>'level')::integer=p_stage limit 1
 ),0)<p_badge*5
 then return jsonb_build_object('ok',false,'error','BADGE_LOCKED_ON_SERVER'); end if;

 select * into rec from public.mej_arcade_scores where student_ref=p_student_ref
  and stage=p_stage and badge=p_badge and game_code=p_game for update;
 if found then att:=rec.attempts;old_best:=rec.best;end if;
 if p_action='status' then
  return jsonb_build_object('ok',true,'attempts',att,'best',old_best,
   'total',(select coalesce(sum(best),0) from public.mej_arcade_scores where student_ref=p_student_ref));
 elsif p_action='start' then
  if att>=2 then return jsonb_build_object('ok',true,'practiceOnly',true,'attempts',att,'best',old_best);end if;
  update public.mej_arcade_runs set status='expired' where student_ref=p_student_ref
   and stage=p_stage and badge=p_badge and game_code=p_game and status='started';
  insert into public.mej_arcade_runs(student_ref,stage,badge,game_code)
  values(p_student_ref,p_stage,p_badge,p_game) returning * into rn;
  return jsonb_build_object('ok',true,'runId',rn.run_id,'practiceOnly',false,'attempts',att,'best',old_best);
 elsif p_action='finish' then
  if p_run_id is null or p_score is null or p_score not between 0 and 10 then
   return jsonb_build_object('ok',false,'error','INVALID_SCORE');
  end if;
  select * into rn from public.mej_arcade_runs where run_id=p_run_id
   and student_ref=p_student_ref and stage=p_stage and badge=p_badge and game_code=p_game for update;
  if not found then return jsonb_build_object('ok',false,'error','UNKNOWN_RUN');end if;
  if rn.status='finished' then
   return jsonb_build_object('ok',true,'idempotent',true,'delta',rn.delta,'best',old_best,'attempts',att);
  end if;
  if rn.status<>'started' or rn.started_at<now()-interval '25 minutes' then
   return jsonb_build_object('ok',false,'error','EXPIRED_RUN');
  end if;
  if att>=2 then
   update public.mej_arcade_runs set status='practice',score=p_score,delta=0,finished_at=now()
   where run_id=p_run_id;
   return jsonb_build_object('ok',true,'delta',0,'best',old_best,'attempts',att,'practiceOnly',true);
  end if;
  new_best:=greatest(old_best,p_score);
  awarded:=new_best-old_best;
  insert into public.mej_arcade_scores(student_ref,stage,badge,game_code,attempts,best)
   values(p_student_ref,p_stage,p_badge,p_game,1,new_best)
  on conflict(student_ref,stage,badge,game_code)
   do update set attempts=public.mej_arcade_scores.attempts+1,
    best=greatest(public.mej_arcade_scores.best,excluded.best),updated_at=now();
  update public.mej_arcade_runs set status='finished',score=p_score,delta=awarded,finished_at=now()
   where run_id=p_run_id;
  return jsonb_build_object('ok',true,'delta',awarded,'best',new_best,'attempts',att+1,
   'total',(select coalesce(sum(best),0) from public.mej_arcade_scores where student_ref=p_student_ref),
   'verification','CLIENT_REPORTED_UNVERIFIED');
 end if;
 return jsonb_build_object('ok',false,'error','INVALID_ACTION');
end
$function$;

create or replace function public.mej_sailor_award(
 p_student text,
 p_stage integer,
 p_chest uuid,
 p_ceiling integer
)
returns jsonb
language plpgsql
set search_path to ''
as $function$
declare stars integer; cap integer; paid integer; prize integer; prior integer;
begin
 if p_stage not between 0 and 12 or p_ceiling not in (0,50,100,200,300) then
  raise exception 'invalid stage or ceiling';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(p_student||':'||p_stage::text,42));

 select least(50,greatest(0,coalesce((j->>'stars')::int,coalesce((j->>'mastered')::int,0)*2)))
 into stars
 from public.mej_student_progress p
 cross join lateral jsonb_array_elements(p.level_stats::jsonb) j
 where p.student_ref=p_student and j->>'level'=p_stage::text limit 1;

 -- Preserve the existing treasure payout tiers, aligned to journey medals:
 -- badge 2 => 10 stars / 50 baisa; badge 5 => 25 / 100;
 -- badge 7 => 35 / 200; badge 10 => 50 / 300.
 cap:=case
  when coalesce(stars,0)>=50 then 300
  when coalesce(stars,0)>=35 then 200
  when coalesce(stars,0)>=25 then 100
  when coalesce(stars,0)>=10 then 50
  else 0
 end;

 select coalesce(sum(baisa),0) into paid from public.mej_sailor_chests
  where student_ref=p_student and stage=p_stage;
 if p_chest is not null then
  select baisa into prior from public.mej_sailor_chests
   where student_ref=p_student and stage=p_stage and chest_id=p_chest;
  if found then prize:=prior;
  elsif cap=0 or cap<p_ceiling then return jsonb_build_object('pending',true,'cap',cap,'paid',paid);
  else
   prize:=least(greatest(0,least(cap,p_ceiling)-paid),5*(1+floor(random()*4)::int));
   insert into public.mej_sailor_chests(student_ref,stage,chest_id,baisa)
    values(p_student,p_stage,p_chest,prize);
   paid:=paid+prize;
  end if;
 end if;
 return jsonb_build_object('cap',cap,'paid',paid,'baisa',prize);
end
$function$;

commit;
