
/**
 * WhatsApp ProjectQ
 * Cloudflare Pages Function
 * Proxy ke Google Apps Script
 */

export async function onRequestPost({ request, env }) {
  if (!env.GAS_EXEC_URL) {
    return Response.json({
      success: false,
      error: "GAS_EXEC_URL belum diatur di Cloudflare."
    }, { status: 500 });
  }

  try {
    const body = await request.text();

    if (!body) {
      return Response.json({
        success: false,
        error: "Request body kosong."
      }, { status: 400 });
    }

    const upstream = await fetch(env.GAS_EXEC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: body,
      redirect: "follow"
    });

    const raw = await upstream.text();

    if (!raw || !raw.trim()) {
      return Response.json({
        success: false,
        error: "Google Apps Script mengirim respons kosong.",
        upstreamStatus: upstream.status
      }, { status: 502 });
    }

    let result;

    try {
      result = JSON.parse(raw);
    } catch (err) {
      return Response.json({
        success: false,
        error: "Respons Google Apps Script bukan JSON.",
        upstreamStatus: upstream.status,
        responsePreview: raw.slice(0, 500)
      }, { status: 502 });
    }

    return Response.json(result, {
      status: upstream.ok ? 200 : 502,
      headers: {
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: "Cloudflare gagal menghubungi Google Apps Script.",
      detail: String(error.message || error)
    }, { status: 502 });
  }
}
