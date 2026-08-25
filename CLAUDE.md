# Học Tiếng Việt Cùng Thầy Đạt

Web quiz/kiểm tra tiếng Việt, giao diện vui nhộn nhiều màu, dành cho học sinh.
Toàn bộ nằm trong **file `index.html`** (HTML + CSS + JS gộp chung).

## Quy tắc nội dung / ngôn từ
- KHÔNG dùng từ ngữ nhạy cảm, tục tĩu, bạo lực hay chính trị trong bất kỳ nội dung nào hiển thị trên web.
- Giọng văn thân thiện, vui vẻ, phù hợp với học sinh và phụ huynh.
- Luôn dùng tiếng Việt có dấu đầy đủ, đúng chính tả.
- Câu hỏi và ví dụ nên gần gũi, tích cực, mang tính giáo dục.

## Quy tắc kỹ thuật
- Giữ mọi thứ trong **file `index.html`** để dễ deploy — không tách nhiều file, không thêm framework nặng (React, Vue...) trừ khi mình yêu cầu rõ.
- Giữ nguyên bảng màu và font đang dùng (biến CSS trong `:root`, font Baloo 2 + Be Vietnam Pro) để đồng bộ giao diện.
- Web phải chạy tốt trên điện thoại (đã có `viewport` responsive) — kiểm tra bố cục trên màn hình nhỏ.
- Không thêm thư viện ngoài / link CDN mới nếu không cần thiết.
- `claude.exe` trong thư mục là file công cụ, KHÔNG chỉnh sửa hay đụng tới.

## Deploy
- Site này deploy được lên **Netlify** qua GitHub.
- File `netlify.toml` đã có sẵn trong repo.
- Push code lên GitHub → kết nối Netlify → chọn repo → Deploy.

## Cách làm việc mình mong muốn
- Giải thích ngắn gọn bằng tiếng Việt những gì đã thay đổi.
- Chỉ commit hoặc push khi mình yêu cầu.
- Khi thêm câu hỏi/tính năng mới, giữ đúng phong cách code và cấu trúc sẵn có.

## Phương pháp làm task
- Mỗi lần code cái gì tính năng mới hay chức năng mới, thì phải tạo branch theo 1 cấu trúc chuẩn, sau khi code xong thì merge vào main.

### ra lệnh gì thì làm cái đó
- Ra lệnh gì thì làm đúng chỗ đó, tránh sửa cái không liên quan