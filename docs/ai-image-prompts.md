# 🎨 Bộ prompt tạo ảnh minh họa — Học Tiếng Việt Cùng Thầy Đạt

Tài liệu này chứa các prompt sẵn dùng cho skill **ai-image-generation** (qua `belt` CLI / inference.sh).
Ảnh dành cho web học tiếng Việt của **trẻ tiểu học** → phong cách phải **vui tươi, dễ thương, an toàn**.

## 0) Chuẩn bị (bạn tự làm 1 lần)
```bash
belt login          # đăng nhập inference.sh (cần tài khoản + credit)
belt app list --category image   # xem các model
```
Model gợi ý:
- `pruna/p-image` — nhanh, rẻ (khởi động, gen thử)
- `falai/flux-dev-lora` — chất lượng cao hơn (bản cuối)

## 1) PHONG CÁCH CHUNG (dán vào cuối MỌI prompt)
> `children's book illustration, flat vector cartoon style, bright cheerful colors, soft rounded shapes, thick clean outlines, plain white background, friendly and cute, safe for young children, centered, no text, high quality`

Gọi tắt bên dưới là **[STYLE]**.

## 2) Lệnh mẫu
```bash
belt app run pruna/p-image --input '{"prompt": "<PROMPT> , [STYLE]", "aspect_ratio": "1:1"}'
# ảnh trả về là URL/tệp → tải về thư mục images/ rồi gắn vào bài học
```

---

## 3) DANH SÁCH PROMPT

### A. Nhân vật / Mascot (dùng lại nhiều nơi)
1. **Thầy Đạt** (avatar 😎): `a friendly young Vietnamese male teacher cartoon mascot wearing cool sunglasses, warm big smile, casual shirt, waving hello, upper body`
2. **Bé An** (Hội thoại): `a cute Vietnamese primary school girl, short ponytail, tidy school uniform, cheerful smile, waving, full body`
3. **Bé Bảo** (Hội thoại): `a cute Vietnamese primary school boy, neat short hair, tidy school uniform, happy smile, thumbs up, full body`
4. **Thú cưng dẫn dắt** (linh vật app): `a cute round mascot cat holding a pencil, big friendly eyes, encouraging pose`

### B. Minh họa bài Đọc hiểu (khớp nội dung đã có)
5. **Cây bàng trước sân trường**: `a big leafy green tree with a wide shady canopy in a Vietnamese school yard, a few happy kids playing underneath, sunny sky`
6. **Chú chó Đốm**: `a small cute brown puppy with two big ears and a wagging tail, running happily to greet a child at a house gate`
7. **Rùa và Thỏ** (truyện ngụ ngôn): `a slow smiling turtle and a fast rabbit racing on a green forest path, the rabbit napping under a tree, storybook scene`
8. **Giờ ra chơi**: `Vietnamese primary school children playing during recess in a schoolyard, some kicking a ball, some jumping rope, joyful and lively`
9. **Con ong chăm chỉ**: `a cute smiling honey bee flying between colorful flowers collecting nectar in a sunny garden`
10. **Bảo vệ rừng**: `a lush green forest full of happy animals, tall healthy trees, clean fresh air, a gentle protective feeling`

### C. Thẻ từ vựng có hình (thay/đẹp hơn emoji)
> Nền trắng, 1 vật/con ở giữa, rõ ràng để bé nhận diện.
11. **Con hươu cao cổ**: `a single cute giraffe standing, centered`
12. **Con nhím**: `a single cute hedgehog, centered`
13. **Quả dứa**: `a single ripe pineapple, centered`
14. **Cái ô (dù)**: `a single colorful umbrella, open, centered`
15. *(nhân bản mẫu này cho từ vựng khác: thay chủ thể, giữ [STYLE])*

### D. Huy hiệu / Sticker phần thưởng (Nhiệm vụ & Thành tích)
16. **Cúp vàng**: `a shiny golden trophy with a star, cute glossy reward badge sticker`
17. **Ngôi sao cười**: `a smiling golden star with sparkles, cute reward sticker`
18. **Huy chương**: `a gold medal with a colorful ribbon, cute reward sticker`
19. **Streak lửa**: `a cute friendly flame character with a happy face, streak reward sticker`

---

## 4) Sau khi gen
- Tải ảnh về `images/` (vd `images/doc/cay-bang.png`, `images/mascot/an.png`…).
- Gắn vào bài: thêm `<img src="images/...">` trong đoạn đọc hiểu / thẻ từ vựng / phần thưởng.
- **Luôn để bạn (Thầy Đạt) duyệt** trước khi đưa lên web (nội dung phù hợp thiếu nhi).

## 5) Muốn VIDEO?
Cần skill khác: `npx skills add inference-sh/skills@ai-video-generation` (phí cao hơn). Gợi ý: video intro ngắn 5–10s cho mỗi nhóm bài — làm sau khi bộ ảnh ổn.
