import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const offerDir = resolve(root, 'offers/trc-premier-rebrand');
const distOfferDir = resolve(root, 'dist/offers/trc-premier-rebrand');
const html = await readFile(resolve(offerDir, 'index.html'), 'utf8');
const css = await readFile(resolve(offerDir, 'offer.css'), 'utf8');
const js = await readFile(resolve(offerDir, 'offer.js'), 'utf8');

// Commercial facts: this version headlines the rebrand cost only, never the combined figure
assert.ok(html.includes('955 000 ₽'), 'Должна быть указана стоимость ребрендинга 955 000 ₽');
assert.equal((html.match(/994 000 ₽/g) || []).length, 2, 'Стоимость сайта 994 000 ₽ должна упоминаться как отдельное направление (контекст + стоимость)');
assert.ok(!html.includes('1 949 000 ₽'), 'В защитной версии по ребрендингу не должно быть комплексной суммы 1 949 000 ₽');
assert.ok(html.includes('14 недель') && html.includes('17 недель'), 'Должна быть объяснена логика 17 → 14 недель');

for (const required of [
  'Пять принципиально разных направлений на первой итерации',
  'систему из восьми версий',
  'Наружные конструкции: 5 типов',
  'по четырём уровням',
  'Что делаем:', 'Показываем и согласовываем:', 'Результат:',
  'Schäfer Fliesen',
  'Рекомендательное письмо',
]) assert.ok(html.includes(required), `Не найден обязательный контент: ${required}`);

// Site must not be re-litigated in depth here — only referenced as a separate track
assert.ok(!html.includes('id="site"'), 'В защитной версии не должно быть полного раздела про сайт');
assert.ok(!html.includes('class="scope-list"'), 'Детализация разработки сайта не должна дублироваться в защитной версии');
assert.ok(!html.includes('class="cms-grid"'), 'Технический разбор CMS сайта не относится к защите ребрендинга');

// Section order: context -> rebrand -> environment -> process -> budget -> cases -> awards -> cta
const order = ['id="context"', 'id="rebrand"', 'id="environment"', 'id="process"', 'id="budget"', 'id="cases"', 'id="awards"', 'id="contact"'];
for (let i = 0; i < order.length - 1; i++) {
  assert.ok(html.indexOf(order[i]) < html.indexOf(order[i + 1]), `${order[i]} должен идти перед ${order[i + 1]}`);
}

assert.equal((html.match(/class="award-card(?: |")/g) || []).length, 14, 'В исходном наборе должно быть 14 подтверждённых наград');
assert.equal((html.match(/class="award-mark"/g) || []).length, 14, 'Все награды должны использовать единый фирменный знак — венок с номером места');
assert.ok(css.includes('@media (prefers-reduced-motion:reduce)'), 'Нет reduced-motion режима');
assert.ok(js.includes("awardMarquee.addEventListener('pointerdown'"), 'Нет drag-управления лентой наград');

const casesSection = html.slice(html.indexOf('<section class="cases'), html.indexOf('<section class="trust'));
const canonicalCaseUrls = [
  'https://serenity.agency/case/cromi',
  'https://serenity.agency/case/jistory',
  'https://serenity.agency/case/all/skladno-internet-magazin-mebeli',
  'https://serenity.agency/case/all/schaeferfliesen'
];
for (const url of canonicalCaseUrls) {
  assert.ok(casesSection.includes(`href="${url}" target="_blank" rel="noopener noreferrer"`), `Нет безопасной канонической ссылки кейса: ${url}`);
}
assert.equal((casesSection.match(/<article class="case /g) || []).length, 4, 'В разделе должны остаться только четыре подтверждённых кейса');
assert.ok(casesSection.includes('«В рамках фирменного стиля мы получили несколько вариантов логотипа'), 'Рекомендация Schäfer Fliesen должна быть точной цитатой');

// Contrast fix must be present in this version too
assert.ok(css.includes('#rebrand .annotation-grid span{color:var(--violet-soft)}'), 'Контраст меток annotation-grid должен быть переопределён');
assert.ok(css.includes('#rebrand .annotation-grid p{color:#d7d7da}'), 'Контраст текста annotation-grid должен быть переопределён');
assert.ok(css.includes('#budget .budget-directions{grid-template-columns:1fr'), 'Единственная карточка стоимости не должна сиротеть в двухколоночной сетке');

const localRefs = [...html.matchAll(/(?:src|href)="(assets\/[^"#]+)"/g)].map((match) => match[1]);
assert.ok(localRefs.length >= 5, 'Ожидались реальные локальные изображения и логотипы');
await Promise.all(localRefs.map((ref) => access(resolve(offerDir, ref))));
assert.ok(localRefs.includes('assets/award-wreath.svg'), 'Венок наград должен быть локальным ассетом оффера');

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'ID в документе не должны повторяться');
assert.ok(html.includes('<main id="content">') && html.includes('<h1'), 'Нужны семантические main и h1');

for (const file of ['index.html', 'offer.css', 'offer.js']) {
  assert.equal(
    await readFile(resolve(distOfferDir, file), 'utf8'),
    await readFile(resolve(offerDir, file), 'utf8'),
    `Собранный ${file} должен совпадать с исходником`
  );
}

console.log(`ТРЦ Премьер (V2, защита ребрендинга): ${localRefs.length} локальных assets, коммерческие условия и структура проверены`);
