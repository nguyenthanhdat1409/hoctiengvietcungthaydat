// Netlify Function: Giáo viên quản trị học sinh — ĐỔI PIN & ĐỔI LỚP.
// Dùng SUPABASE_SECRET_KEY (server-only). Bảo mật: chỉ tài khoản role=teacher
// mới được thực hiện (xác thực Bearer token của người gọi trước khi hành động).
// Env cần: SUPABASE_URL, SUPABASE_SECRET_KEY

function json(code, obj){
  return { statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Chỉ hỗ trợ POST" });

  const URL = process.env.SUPABASE_URL;
  const SECRET = process.env.SUPABASE_SECRET_KEY;
  if (!URL || !SECRET) return json(500, { error: "Server chưa cấu hình SUPABASE_URL / SUPABASE_SECRET_KEY" });
  const svc = { apikey: SECRET, Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" };

  try {
    // 1) Xác thực người gọi là giáo viên
    const token = (event.headers.authorization || event.headers.Authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return json(401, { error: "Chưa đăng nhập" });
    const meRes = await fetch(`${URL}/auth/v1/user`, { headers: { apikey: SECRET, Authorization: `Bearer ${token}` } });
    if (!meRes.ok) return json(401, { error: "Phiên đăng nhập không hợp lệ" });
    const me = await meRes.json();
    const prof = (await (await fetch(`${URL}/rest/v1/profiles?id=eq.${me.id}&select=role`, { headers: svc })).json())[0];
    if (!prof || prof.role !== "teacher") return json(403, { error: "Chỉ giáo viên được thực hiện thao tác này" });

    // 2) Kiểm tra dữ liệu vào + học sinh mục tiêu
    const body = JSON.parse(event.body || "{}");
    const action = body.action;
    const sid = (body.student_id || "").trim();
    if (!sid) return json(400, { error: "Thiếu student_id" });
    const target = (await (await fetch(`${URL}/rest/v1/profiles?id=eq.${sid}&select=id,role,username`, { headers: svc })).json())[0];
    if (!target || target.role !== "student") return json(404, { error: "Không tìm thấy học sinh" });

    // 3a) ĐỔI PIN (mật khẩu auth)
    if (action === "set_pin") {
      const pin = (body.pin || "").trim();
      if (!/^\d{4,6}$/.test(pin)) return json(400, { error: "PIN phải là 4–6 chữ số" });
      const r = await fetch(`${URL}/auth/v1/admin/users/${sid}`, {
        method: "PUT", headers: svc, body: JSON.stringify({ password: pin }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); return json(400, { error: e.msg || e.message || "Không đổi được PIN" }); }
      return json(200, { ok: true, action, username: target.username });
    }

    // 3b) ĐỔI LỚP (profiles.class_code — nơi Dashboard đọc)
    if (action === "set_class") {
      const cls = (body.class_code || "").trim() || null;
      const r = await fetch(`${URL}/rest/v1/profiles?id=eq.${sid}`, {
        method: "PATCH", headers: { ...svc, Prefer: "return=minimal" }, body: JSON.stringify({ class_code: cls }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); return json(400, { error: e.message || "Không đổi được lớp" }); }
      return json(200, { ok: true, action, class_code: cls });
    }

    return json(400, { error: "action không hợp lệ" });
  } catch (err) {
    return json(500, { error: "Lỗi máy chủ: " + (err && err.message ? err.message : String(err)) });
  }
};
