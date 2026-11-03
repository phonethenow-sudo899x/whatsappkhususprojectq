/**
 * Cloudflare Pages Function proxy.
 * Set GAS_EXEC_URL as a Pages environment variable to the Apps Script /exec URL.
 * Browser requests POST /api; this function forwards JSON to Apps Script.
 */
export async function onRequestPost({ request, env }) {
  if (!env.GAS_EXEC_URL) {
    return Response.json({ success:false, error:"GAS_EXEC_URL belum diatur." }, { status:500 });
  }
  try {
    const body = await request.text();
    const upstream = await fetch(env.GAS_EXEC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });
    const text = await upstream.text();
    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (e) {
    return Response.json({ success:false, error:"Backend tidak dapat dihubungi." }, { status:502 });
  }
      }
