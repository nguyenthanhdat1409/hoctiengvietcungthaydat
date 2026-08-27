// Netlify Function: proxy giọng đọc Google (server-side lấy được, browser gọi thẳng bị chặn).
// Trình duyệt gọi: /.netlify/functions/tts?tl=vi&q=Xin%20chào
// Trả về audio/mpeg (giọng nữ người Việt của Google).

exports.handler = async (event) => {
  const p = event.queryStringParameters || {};
  const q = (p.q || "").slice(0, 200);
  const tl = p.tl || "vi";
  if (!q) return { statusCode: 400, body: "missing q" };

  const url = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" +
    encodeURIComponent(tl) + "&q=" + encodeURIComponent(q);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
    });
    if (!res.ok) return { statusCode: 502, body: "upstream " + res.status };
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=604800",
        "Access-Control-Allow-Origin": "*",
      },
      body: buf.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (e) {
    return { statusCode: 500, body: "err " + (e && e.message ? e.message : String(e)) };
  }
};
