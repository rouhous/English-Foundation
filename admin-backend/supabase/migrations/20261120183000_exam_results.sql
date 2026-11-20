create table public.mej_exam_attempts (
  student_ref text not null references public.mej_short_student_links(student_ref) on delete cascade,
  attempt_id uuid not null,
  submitted_at timestamptz not null default now(),
  grade smallint not null check (grade between 5 and 12),
  mode text not null check (mode in ('unit','skill','comprehensive','random')),
  track text not null check (track in ('','core','elective')),
  paper text not null check (length(paper) between 1 and 90),
  skill text not null check (length(skill) <= 32),
  earned numeric(5,2) not null,
  possible numeric(5,2) not null check (possible between 0 and 100),
  writing_pending boolean not null,
  primary key (student_ref, attempt_id),
  check (earned between 0 and possible)
);
create index mej_exam_attempts_student_time on public.mej_exam_attempts (student_ref, submitted_at desc);
alter table public.mej_exam_attempts enable row level security;
revoke all on public.mej_exam_attempts from public, anon, authenticated;
grant select, insert on public.mej_exam_attempts to service_role;
