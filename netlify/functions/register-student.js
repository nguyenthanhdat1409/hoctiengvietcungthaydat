// Netlify Function: Học sinh TỰ đăng ký (username + PIN)
// Tạo tài khoản qua Auth Admin API (secret key ở server) → xác nhận sẵn,
// KHÔNG gửi email → không dính lỗi xác nhận/429.
// Cần env: SUPABASE_URL, SUPABASE_SECRET_KEY

const STUDENT_EMAIL_DOMAIN = "hs.thaydat.app";

function json(code, obj){
  return { statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Chỉ hỗ trợ POST" });

  const URL = process.env.SUPABASE_URL;
  const SECRET = process.env.SUPABASE_SECRET_KEY;
  if (!URL || !SECRET) return json(500, { error: "Server chưa cấu hình SUPABASE_URL / SUPABASE_SECRET_KEY" });

  const svcHeaders = { apikey: SECRET, Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" };

  try {
    const body = JSON.parse(event.body || "{}");
    let username = (body.username || "").trim().toLowerCase();
    let displayName = (body.display_name || "").trim();
    const pin = (body.pin || "").trim();
    const classCode = (body.class_code || "").trim() || null;

    if (!/^[a-z0-9_]{3,20}$/.test(username)) return json(400, { error: "Tên đăng nhập 3–20 ký tự (a–z, 0–9, _)" });
    if (!/^\d{4,6}$/.test(pin)) return json(400, { error: "PIN phải là 4–6 chữ số" });
    if (!displayName) displayName = username;

    const email = `${username}@${STUDENT_EMAIL_DOMAIN}`;

    // Tạo tài khoản (admin) — xác nhận sẵn, không gửi mail
    const createRes = await fetch(`${URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: svcHeaders,
      body: JSON.stringify({
        email, password: pin, email_confirm: true,
        user_metadata: { display_name: displayName, role: "student", username, class_code: classCode },
      }),
    });
    const created = await createRes.json();
    if (!createRes.ok) {
      const msg = created.msg || created.message || created.error_description || "";
      const dup = /already|exists|registered/i.test(msg);
      return json(400, { error: dup ? "Tên đăng nhập đã có người dùng — chọn tên khác nhé" : (msg || "Không tạo được tài khoản") });
    }

    // Bảo đảm hồ sơ đầy đủ (phòng khi trigger chưa chạy)
    await fetch(`${URL}/rest/v1/profiles`, {
      method: "POST",
      headers: { ...svcHeaders, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: created.id, role: "student", username, display_name: displayName, class_code: classCode }),
    });

    return json(200, { ok: true, id: created.id, username, display_name: displayName });
  } catch (err) {
    return json(500, { error: "Lỗi máy chủ: " + (err && err.message ? err.message : String(err)) });
  }
};
