-- ============================================================
--  HỌC TIẾNG VIỆT CÙNG THẦY ĐẠT — Schema Supabase (Postgres)
--  Chạy trong: Supabase → SQL Editor → New query → Run
--  Auth "cả hai": Thầy tạo HS bằng username/PIN, phụ huynh liên kết email sau.
-- ============================================================

-- 1) HỒ SƠ NGƯỜI DÙNG (gắn 1-1 với auth.users của Supabase)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null default 'student'          -- 'student' | 'parent' | 'teacher'
                check (role in ('student','parent','teacher')),
  username      text unique,                              -- HS đăng nhập bằng username (Thầy đặt)
  display_name  text not null,                            -- biệt danh hiển thị
  class_code    text,                                     -- mã lớp (gom HS theo lớp)
  parent_email  text,                                     -- email phụ huynh (nếu đã liên kết)
  created_at    timestamptz not null default now()
);

-- 2) PHIÊN HỌC (mỗi lần vào học = 1 session)
create table if not exists public.study_sessions (
  id            bigint generated always as identity primary key,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  duration_sec  int,                                      -- thời lượng (giây), tính khi kết thúc
  day           date not null default (now() at time zone 'Asia/Ho_Chi_Minh')::date
);
create index if not exists idx_sessions_student_day on public.study_sessions(student_id, day);

-- 3) SỰ KIỆN HOẠT ĐỘNG (mở bài học nào, chơi trò gì...)
create table if not exists public.activity_events (
  id            bigint generated always as identity primary key,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  type          text not null,                            -- 'lesson_open' | 'game_play' | 'practice' ...
  ref           text,                                     -- vd: 'lesson:5', 'game:quiz', 'flashcard'
  meta          jsonb,                                    -- dữ liệu thêm (tùy loại)
  created_at    timestamptz not null default now(),
  day           date not null default (now() at time zone 'Asia/Ho_Chi_Minh')::date
);
create index if not exists idx_events_student_day on public.activity_events(student_id, day);

-- 4) KẾT QUẢ BÀI KIỂM TRA / LUYỆN TẬP
create table if not exists public.quiz_results (
  id            bigint generated always as identity primary key,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  mode          text not null,                            -- 'test' | 'practice'
  score         numeric not null,                         -- điểm (có thể lẻ .5)
  total         int not null,
  percent       int not null,
  stars         int,                                      -- số sao cao nhất đạt trong lượt
  created_at    timestamptz not null default now(),
  day           date not null default (now() at time zone 'Asia/Ho_Chi_Minh')::date
);
create index if not exists idx_quiz_student_day on public.quiz_results(student_id, day);

-- ============================================================
--  BẢO MẬT HÀNG (RLS) — mỗi HS chỉ thấy dữ liệu của mình,
--  Thầy (role='teacher') thấy tất cả.
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.study_sessions  enable row level security;
alter table public.activity_events enable row level security;
alter table public.quiz_results    enable row level security;

-- Hàm tiện ích: người đang đăng nhập có phải teacher?
create or replace function public.is_teacher()
returns boolean language sql stable as $$
  select exists(select 1 from public.profiles p
                where p.id = auth.uid() and p.role = 'teacher');
$$;

-- profiles: tự đọc/sửa hồ sơ mình; teacher đọc tất cả
create policy "profiles_self_read"  on public.profiles for select using (id = auth.uid() or public.is_teacher());
create policy "profiles_self_write" on public.profiles for update using (id = auth.uid());

-- Dữ liệu hoạt động: HS ghi/đọc của mình; teacher đọc tất cả
create policy "sessions_own"  on public.study_sessions  for all using (student_id = auth.uid() or public.is_teacher()) with check (student_id = auth.uid());
create policy "events_own"    on public.activity_events for all using (student_id = auth.uid() or public.is_teacher()) with check (student_id = auth.uid());
create policy "quiz_own"      on public.quiz_results    for all using (student_id = auth.uid() or public.is_teacher()) with check (student_id = auth.uid());

-- ============================================================
--  VIEW cho DASHBOARD: tổng hợp theo ngày cho mỗi HS
-- ============================================================
create or replace view public.daily_summary as
select
  p.id                     as student_id,
  p.display_name,
  p.class_code,
  d.day,
  d.logins,
  d.study_min,
  d.lessons,
  d.games,
  q.quizzes,
  q.best_percent,
  q.best_stars
from public.profiles p
left join (
  select student_id, day, count(*) filter (where true) as logins,
         round(sum(coalesce(duration_sec,0))/60.0) as study_min,
         0 as lessons, 0 as games
  from public.study_sessions group by student_id, day
) d on d.student_id = p.id
left join (
  select student_id, day, count(*) as quizzes,
         max(percent) as best_percent, max(stars) as best_stars
  from public.quiz_results group by student_id, day
) q on q.student_id = p.id and q.day = d.day
where p.role = 'student';

-- ============================================================
--  TRIGGER: tự tạo hồ sơ profiles khi có tài khoản mới
--  (đọc metadata: display_name, role, username)
--  CHẠY THÊM đoạn này sau phần trên.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'username'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  TIẾN TRÌNH THEO TÀI KHOẢN (XP, streak, bài học, thành tích...)
--  Đồng bộ giữa trang chủ của HS và Dashboard của Thầy.
--  CHẠY THÊM đoạn này.
-- ============================================================
create table if not exists public.student_progress (
  student_id  uuid primary key references public.profiles(id) on delete cascade,
  data        jsonb not null default '{}',   -- toàn bộ object progress
  updated_at  timestamptz not null default now()
);
alter table public.student_progress enable row level security;
create policy "sp_own" on public.student_progress for all
  using (student_id = auth.uid() or public.is_teacher())
  with check (student_id = auth.uid());
