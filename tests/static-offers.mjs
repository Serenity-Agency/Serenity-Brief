import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

async function mustExist(path) {
  await access(new URL(path, import.meta.url));
}

const metOfferHtml = await readFile(new URL("../dist/offers/met-coffee-school/index.html", import.meta.url), "utf8");

assert.match(metOfferHtml, /MET Coffee School/);
assert.doesNotMatch(metOfferHtml, /<title>Брифы Serenity<\/title>/);
assert.match(metOfferHtml, /href="\.\/offer\.css"/);
assert.match(metOfferHtml, /src="\.\/script\.js"/);

await mustExist("../dist/offers/met-coffee-school/offer.css");
await mustExist("../dist/offers/met-coffee-school/script.js");

console.log("Static offer tests passed");
