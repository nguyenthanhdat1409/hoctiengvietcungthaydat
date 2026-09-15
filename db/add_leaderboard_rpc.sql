-- ============================================================
--  BẢNG XẾP HẠNG LỚP cho học sinh
--  Học sinh chỉ đọc được dữ liệu của mình (RLS), nên cần 1 hàm
--  SECURITY DEFINER để trả về danh sách xếp hạng của CÙNG LỚP.
--  Chạy trong: Supabase → SQL Editor → New query → Run
-- ============================================================
create or replace function public.class_leaderboard()
returns table(display_name text, xp int, is_me boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.display_name,
    coalesce((sp.data->>'xp')::int, 0) as xp,
    (p.id = auth.uid())                as is_me
  from public.profiles p
  left join public.student_progress sp on sp.student_id = p.id
  where p.role = 'student'
    and p.class_code is not null
    and p.class_code = (select class_code from public.profiles where id = auth.uid())
  order by xp desc, p.display_name asc
  limit 20;
$$;

grant execute on function public.class_leaderboard() to authenticated;
