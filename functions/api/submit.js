export async function onRequestPost({ request, env }) {
  if (!env.APPS_SCRIPT_URL || !env.FORM_API_SECRET) {
    return json({ ok: false, message: "Форма временно недоступна." }, 503);
  }

  try {
    const payload = await request.json();
    const response = await fetch(env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, apiSecret: env.FORM_API_SECRET }),
      redirect: "follow"
    });
    const result = await response.json();
    return json(result, result?.ok ? 200 : 400);
  } catch (error) {
    console.error("Submission proxy failed", error);
    return json({ ok: false, message: "Не удалось отправить бриф. Попробуйте еще раз." }, 502);
  }
}

export function onRequestGet() {
  return json({ ok: false, message: "Метод не поддерживается." }, 405);
}

function json(value, status) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
