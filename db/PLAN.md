# Kế hoạch: Login/Register + Database + Dashboard (Supabase)

Auth **"cả hai"**: Thầy tạo tài khoản HS bằng **username/PIN**, phụ huynh có thể **liên kết email** sau.

## Kiến trúc
- **Frontend** (trang tĩnh Netlify hiện tại) dùng `@supabase/supabase-js` với **anon key** (công khai, an toàn).
- **Netlify Function** dùng **service_role key** (BÍ MẬT, chỉ đặt trong biến môi trường Netlify) để **tạo tài khoản HS** (thao tác admin không được làm ở client).
- **Postgres (Supabase)** lưu dữ liệu, bảo vệ bằng RLS (xem `schema.sql`).

## Cách đăng nhập (auth "cả hai")
1. **HS do Thầy tạo (username + PIN):**
   - Function `create-student` tạo auth user với email tổng hợp `"<username>@hs.thaydat.app"`, mật khẩu = PIN, rồi thêm dòng `profiles` (role=student, username, class_code).
   - HS đăng nhập: nhập **username + PIN** → app tự ghép thành email tổng hợp → `signInWithPassword`.
2. **Phụ huynh (email):** `signUp` bằng email/mật khẩu (role=parent), rồi liên kết với HS qua mã lớp/mã HS.
3. **Thầy:** 1 tài khoản, set `role='teacher'` bằng SQL (thấy toàn bộ dữ liệu để làm dashboard).

## Ghi nhận hoạt động (thay/nâng cấp localStorage hiện có)
- **Đăng nhập** → tạo `study_sessions` (started_at); khi rời trang → cập nhật `ended_at`, `duration_sec`.
- **Mở bài học / chơi trò** → thêm `activity_events`.
- **Làm kiểm tra/luyện tập** (hàm `recordQuiz` sẵn có) → thêm `quiz_results`.
- Vẫn giữ localStorage làm **cache offline**, đồng bộ lên DB khi có mạng.

## Dashboard (bước cuối)
- Trang cho Thầy: đọc `daily_summary` → hôm nay mỗi HS **vào mấy lần, học bao lâu, làm mấy bài, điểm/sao cao nhất**; lọc theo ngày/lớp; xem chi tiết từng HS.

## Thứ tự làm
1. Tạo project Supabase → chạy `db/schema.sql` → đặt biến môi trường.
2. Thêm supabase-js + màn Đăng nhập/Đăng ký (username-PIN & email).
3. Netlify Function `create-student` (Thầy tạo tài khoản HS).
4. Nối ghi nhận hoạt động (sessions/events/quiz_results).
5. Trang Dashboard cho Thầy.

## Việc BẠN cần làm để mình bắt đầu
1. Tạo project trên https://supabase.com (miễn phí).
2. Vào **SQL Editor** chạy nội dung `db/schema.sql`.
3. Lấy 2 giá trị ở **Project Settings → API**:
   - `Project URL` và `anon public key` → gửi cho mình (nhúng vào frontend, an toàn).
   - `service_role key` → **KHÔNG gửi công khai**; bạn tự đặt vào Netlify:
     **Site settings → Environment variables** với tên `SUPABASE_SERVICE_ROLE` (và `SUPABASE_URL`).
4. Tạo tài khoản Thầy (đăng ký email 1 lần), rồi báo mình để set `role='teacher'`.

> ⚠️ Dữ liệu trẻ em: chỉ lưu biệt danh + lớp, không lưu thông tin nhạy cảm; nên có đồng ý của phụ huynh.
