import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

async function mustExist(path) {
  await access(new URL(path, import.meta.url));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const offers = [
  {
    path: "met-coffee-school",
    title: /MET Coffee School/,
    styles: ["offer.css"],
    scripts: ["script.js"]
  },
  {
    path: "spb-tv-media",
    title: /SPB TV Media/,
    styles: ["../maria-german/offer.css", "spb-tv-media.css"],
    scripts: ["offer.js"]
  }
];

for (const offer of offers) {
  const offerHtml = await readFile(new URL(`../dist/offers/${offer.path}/index.html`, import.meta.url), "utf8");

  assert.match(offerHtml, offer.title);
  assert.doesNotMatch(offerHtml, /<title>Брифы Serenity<\/title>/);

  for (const stylesheet of offer.styles) {
    assert.match(offerHtml, new RegExp(`href="(?:\\./)?${escapeRegExp(stylesheet)}"`));
    await mustExist(`../dist/offers/${offer.path}/${stylesheet}`);
  }

  for (const script of offer.scripts) {
    assert.match(offerHtml, new RegExp(`src="\\./${script.replace(".", "\\.")}"`));
    await mustExist(`../dist/offers/${offer.path}/${script}`);
  }
}

console.log("Static offer tests passed");
