import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const output = new URL("./dist/", import.meta.url);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await mkdir(new URL("./admin/", output), { recursive: true });
await mkdir(new URL("./materials/", output), { recursive: true });

await Promise.all([
  cp(new URL("./index.html", import.meta.url), new URL("./index.html", output)),
  cp(new URL("./styles.css", import.meta.url), new URL("./styles.css", output)),
  cp(new URL("./app.js", import.meta.url), new URL("./app.js", output)),
  cp(new URL("./admin/index.html", import.meta.url), new URL("./admin/index.html", output)),
  cp(new URL("./admin/admin.js", import.meta.url),   new URL("./admin/admin.js", output)),
  cp(new URL("./admin/admin.css", import.meta.url),  new URL("./admin/admin.css", output)),
  cp(new URL("./materials/", import.meta.url), new URL("./materials/", output), { recursive: true }),
  writeFile(new URL("./_routes.json", output), JSON.stringify({
    version: 1,
    include: ["/api/*"],
    exclude: []
  }, null, 2)),
  writeFile(new URL("./_headers", output), buildHeadersFile())
]);

// Cloudflare Pages _headers does NOT let a more specific rule override a
// broader one for the same header name — when multiple rules match a path,
// ALL matching rules' headers are sent (verified against the live deploy:
// /materials/* was getting two separate Content-Security-Policy headers,
// and per the CSP spec the browser then enforces their intersection, which
// silently cancelled out the Google Fonts allowance meant only for
// /materials/*). The only reliable fix is to never let a single request
// match two rules — so instead of a `/*` catch-all, every existing static
// path is enumerated explicitly, and /materials/* gets its own, disjoint
// rule with a different policy. If a new top-level static file is added
// to the form/admin in the future, add its path to FORM_PATHS below.
function buildHeadersFile() {
  const formHeaders = `  Cache-Control: no-store
  Content-Security-Policy: default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY`;

  const FORM_PATHS = ["/", "/styles.css", "/app.js", "/admin/", "/admin/*", "/api/*"];

  const formBlocks = FORM_PATHS.map((path) => `${path}\n${formHeaders}`).join("\n\n");

  const materialsBlock = `/materials/*
  Content-Security-Policy: default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-Robots-Tag: noindex, nofollow
  Cache-Control: public, max-age=3600, must-revalidate`;

  return `${formBlocks}\n\n${materialsBlock}\n`;
}

console.log("Built Cloudflare Pages frontend");
