// Netlify Function: Đăng nhập GIÁO VIÊN (1 tài khoản duy nhất).
// Kiểm tra email + PIN cố định, tự tạo/cấp tài khoản Thầy (role=teacher) nếu chưa có,
// rồi để frontend signInWithPassword lấy phiên thật.
//
// Env cần đặt ở Netlify:
//   SUPABASE_URL, SUPABASE_SECRET_KEY
//   TEACHER_PIN         = (mã PIN đăng nhập của Thầy, vd: 6 chữ số)
//   TEACHER_EMAIL       = (tùy chọn; mặc định email dưới đây)

const DEFAULT_TEACHER_EMAIL = "nguyenthanhdat1491@gmail.com";

function json(code, obj){
  return { statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Chỉ hỗ trợ POST" });

  const URL = process.env.SUPABASE_URL;
  const SECRET = process.env.SUPABASE_SECRET_KEY;
  const TEACHER_EMAIL = (process.env.TEACHER_EMAIL || DEFAULT_TEACHER_EMAIL).trim().toLowerCase();
  const TEACHER_PIN = process.env.TEACHER_PIN;
  if (!URL || !SECRET) return json(500, { error: "Server chưa cấu hình SUPABASE_URL / SUPABASE_SECRET_KEY" });
  if (!TEACHER_PIN) return json(500, { error: "Server chưa cấu hình TEACHER_PIN" });

  const svc = { apikey: SECRET, Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" };

  try {
    const body = JSON.parse(event.body || "{}");
    const email = (body.email || "").trim().toLowerCase();
    const pin = (body.pin || "").trim();

    // Chỉ đúng email + PIN của Thầy mới được cấp quyền
    if (email !== TEACHER_EMAIL || pin !== TEACHER_PIN) {
      return json(401, { error: "Sai email hoặc mã PIN giáo viên" });
    }

    const meta = { role: "teacher", display_name: "Thầy Đạt" };

    // Tìm tài khoản Thầy đã tồn tại chưa
    const listRes = await fetch(`${URL}/auth/v1/admin/users?per_page=200`, { headers: svc });
    const listData = await listRes.json();
    const users = Array.isArray(listData) ? listData : (listData.users || []);
    const existing = users.find(u => (u.email || "").toLowerCase() === TEACHER_EMAIL);

    let teacherId;
    if (existing) {
      teacherId = existing.id;
      // Bảo đảm PIN & xác nhận & role đúng
      await fetch(`${URL}/auth/v1/admin/users/${teacherId}`, {
        method: "PUT", headers: svc,
        body: JSON.stringify({ password: pin, email_confirm: true, user_metadata: meta }),
      });
    } else {
      const cr = await fetch(`${URL}/auth/v1/admin/users`, {
        method: "POST", headers: svc,
        body: JSON.stringify({ email: TEACHER_EMAIL, password: pin, email_confirm: true, user_metadata: meta }),
      });
      const created = await cr.json();
      if (!cr.ok) return json(500, { error: created.msg || created.message || "Không tạo được tài khoản giáo viên" });
      teacherId = created.id;
    }

    // Bảo đảm hồ sơ role=teacher
    await fetch(`${URL}/rest/v1/profiles`, {
      method: "POST",
      headers: { ...svc, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: teacherId, role: "teacher", display_name: "Thầy Đạt" }),
    });

    return json(200, { ok: true });
  } catch (err) {
    return json(500, { error: "Lỗi máy chủ: " + (err && err.message ? err.message : String(err)) });
  }
};
