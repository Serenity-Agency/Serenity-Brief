export async function getAdminUser(request, env) {
  if (!request.headers.get("CF-Access-Jwt-Assertion")) {
    return { ok: false, status: 401, message: "Сессия доступа закончилась. Войдите через Google еще раз." };
  }

  const users = parseUsers(env.ADMIN_USERS_JSON);
  if (!users.ok) return users;

  let identity;
  try {
    const identityUrl = new URL("/cdn-cgi/access/get-identity", request.url);
    const cookie = request.headers.get("Cookie") || "";
    const response = await fetch(identityUrl, {
      headers: cookie ? { Cookie: cookie } : {}
    });
    if (!response.ok) {
      return { ok: false, status: 401, message: "Не удалось подтвердить пользователя Cloudflare Access." };
    }
    identity = await response.json();
  } catch {
    return { ok: false, status: 502, message: "Не удалось получить данные пользователя Cloudflare Access." };
  }

  const email = String(identity?.email || "").trim().toLowerCase();
  if (!email) {
    return { ok: false, status: 401, message: "Cloudflare Access не передал email пользователя." };
  }

  const name = users.value[email];
  if (!name) {
    return {
      ok: false,
      status: 403,
      email,
      message: "Ваш email разрешен в Cloudflare Access, но не добавлен в список менеджеров Serenity."
    };
  }

  return { ok: true, email, name };
}

function parseUsers(raw) {
  if (!raw) {
    return { ok: false, status: 503, message: "Список менеджеров не настроен." };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error();

    const value = {};
    for (const [email, name] of Object.entries(parsed)) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const normalizedName = String(name || "").trim();
      if (normalizedEmail && normalizedName) value[normalizedEmail] = normalizedName;
    }

    if (!Object.keys(value).length) throw new Error();
    return { ok: true, value };
  } catch {
    return { ok: false, status: 503, message: "Список менеджеров настроен некорректно." };
  }
}
