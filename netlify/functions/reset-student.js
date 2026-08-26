// Netlify Function: ĐẶT LẠI tiến trình 1 học sinh về 0 (cho Thầy).
// Xoá study_sessions / quiz_results / activity_events và zero-out student_progress.
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
    const auth = event.headers.authorization || event.headers.Authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return json(401, { error: "Chưa đăng nhập" });
    const meRes = await fetch(`${URL}/auth/v1/user`, { headers: { apikey: SECRET, Authorization: `Bearer ${token}` } });
    if (!meRes.ok) return json(401, { error: "Phiên không hợp lệ" });
    const me = await meRes.json();
    const profRes = await fetch(`${URL}/rest/v1/profiles?id=eq.${me.id}&select=role`, { headers: svc });
    const prof = (await profRes.json())[0];
    if (!prof || prof.role !== "teacher") return json(403, { error: "Chỉ giáo viên được đặt lại" });

    // 2) student_id hợp lệ (uuid)
    const body = JSON.parse(event.body || "{}");
    const sid = (body.student_id || "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(sid)) return json(400, { error: "student_id không hợp lệ" });

    // 3) Xoá lịch sử + zero-out tiến trình
    const del = (table) => fetch(`${URL}/rest/v1/${table}?student_id=eq.${sid}`, { method: "DELETE", headers: { ...svc, Prefer: "return=minimal" } });
    await Promise.all([ del("study_sessions"), del("quiz_results"), del("activity_events") ]);
    await fetch(`${URL}/rest/v1/student_progress`, {
      method: "POST",
      headers: { ...svc, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ student_id: sid, data: {}, updated_at: new Date().toISOString() }),
    });

    return json(200, { ok: true });
  } catch (err) {
    return json(500, { error: "Lỗi máy chủ: " + (err && err.message ? err.message : String(err)) });
  }
};
