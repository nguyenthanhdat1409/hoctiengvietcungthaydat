-- ============================================================
--  FIX: RLS đệ quy vô hạn (lỗi 54001 "stack depth limit exceeded")
--  Triệu chứng: dashboard giáo viên KHÔNG đọc được điểm/lịch sử học sinh;
--  các bảng profiles / student_progress / study_sessions / quiz_results trả 500.
--
--  Nguyên nhân: is_teacher() đọc bảng profiles, mà policy của profiles lại
--  gọi is_teacher() → gọi lại chính nó vô hạn.
--
--  Cách sửa: cho is_teacher() chạy SECURITY DEFINER để bỏ qua RLS khi đọc
--  profiles (không còn kích hoạt lại policy → hết đệ quy).
--
--  Chạy trong: Supabase → SQL Editor → New query → Run
-- ============================================================
create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'teacher'
  );
$$;
