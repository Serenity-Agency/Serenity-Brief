import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const offerDir = resolve(root, 'offers/trc-premier');
const distOfferDir = resolve(root, 'dist/offers/trc-premier');
const html = await readFile(resolve(offerDir, 'index.html'), 'utf8');
const css = await readFile(resolve(offerDir, 'offer.css'), 'utf8');
const js = await readFile(resolve(offerDir, 'offer.js'), 'utf8');

for (const required of [
  '994 000 ₽', '67 рабочих дней — суммарная трудоёмкость специалистов', '497 000 ₽',
  '160 000 ₽', '75 000 ₽', '415 000 ₽', '344 000 ₽', '93 000 ₽',
  'Рейтинг Рунета · 2022', 'Workspace Digital Awards', 'Ruward · 2025',
  'Макет демонстрирует принцип организации интерфейса',
  'календарный срок — около трёх месяцев',
  '<b>В базовой стоимости:</b> подключение готовых SVG‑схем и предоставленных данных.',
  '<b>Отдельная оценка:</b>'
]) assert.ok(html.includes(required), `Не найден обязательный контент: ${required}`);

assert.equal((html.match(/497 000 ₽/g) || []).length, 2, 'Обе части оплаты должны быть по 497 000 ₽');
assert.ok(!html.includes('127 рабочих'), 'Опечатка 127 рабочих дней не должна попасть в HTML');
assert.ok(!html.includes('90% брифов'), 'Неподтверждённое сравнение брифов должно быть удалено');
for (const obsolete of ['982 632 ₽', '491 316 ₽', '159 975 ₽', '75 600 ₽', '414 750 ₽', '343 707 ₽', '93 450 ₽', '74 865 ₽']) {
  assert.ok(!html.includes(obsolete), `Старая неокруглённая сумма осталась в HTML: ${obsolete}`);
}
const baseLines = [160_000, 75_000, 415_000, 344_000];
assert.equal(baseLines.reduce((sum, value) => sum + value, 0), 994_000, 'Базовые строки должны составлять ровно 994 000 ₽');
assert.ok(html.indexOf('id="cases"') < html.indexOf('class="awards'), 'Награды должны идти после кейсов');
assert.ok(html.indexOf('class="awards') < html.indexOf('class="final-cta'), 'Финальный CTA должен идти после наград');
assert.ok(css.includes('@media (prefers-reduced-motion:reduce)'), 'Нет reduced-motion режима');
assert.ok(js.includes("awardMarquee.addEventListener('mouseenter'"), 'Нет паузы marquee при hover');
assert.ok(js.includes("clone.setAttribute('aria-hidden', 'true')"), 'Клон marquee должен быть скрыт от скринридера');
assert.ok(js.includes("awardMarquee.addEventListener('pointerdown'"), 'Нет drag-управления лентой наград');
assert.ok(html.includes('data-awards-prev') && html.includes('data-awards-next'), 'Нет стрелок ленты наград');
assert.equal((html.match(/class="award-card(?: |")/g) || []).length, 14, 'В исходном наборе должно быть 14 подтверждённых наград');
assert.equal((html.match(/class="award-mark"/g) || []).length, 14, 'Все награды должны использовать единый фирменный знак — венок с номером места');
assert.ok(!html.includes('award-card-proof') && !html.includes('award-proof'), 'В ленте не должно остаться карточек с оригинальным фото диплома — только унифицированный венок');
assert.ok(!html.includes('class="laurel"'), 'Буквенные заглушки наград должны быть удалены');
assert.ok(css.includes('.award-set{display:grid;grid-template-rows:1fr'), 'Лента наград должна быть однорядной');
assert.ok(!css.includes('grid-template-rows:repeat(2'), 'В ленте наград не должно оставаться второго ряда');
assert.ok(css.includes('grid-template-columns:34px minmax(0,1fr) 24px'), 'Мобильная сетка процесса не должна создавать неявную колонку');

const casesSection = html.slice(html.indexOf('<section class="cases'), html.indexOf('<section class="trust'));
const canonicalCaseUrls = [
  'https://serenity.agency/case/cromi',
  'https://serenity.agency/case/darkrain-store',
  'https://serenity.agency/case/all/skladno-internet-magazin-mebeli',
  'https://serenity.agency/case/all/schaeferfliesen'
];
for (const url of canonicalCaseUrls) {
  assert.ok(casesSection.includes(`href="${url}" target="_blank" rel="noopener noreferrer"`), `Нет безопасной канонической ссылки кейса: ${url}`);
}
assert.equal((casesSection.match(/class="case-link"/g) || []).length, 4, 'Ссылки должны быть только у четырёх подтверждённых кейсов');
assert.equal((casesSection.match(/<article class="case /g) || []).length, 4, 'В разделе должны остаться только четыре подтверждённых кейса');
assert.equal((casesSection.match(/class="case-action"/g) || []).length, 4, 'Каждый кликабельный кейс должен иметь явный CTA «Смотреть кейс»');
assert.equal((casesSection.match(/Смотреть кейс/g) || []).length, 4, 'Текст ссылки должен быть видимым у всех подтверждённых кейсов');
assert.ok(!casesSection.includes('Апарт‑отели YES'), 'Кейс YES без подтверждённой ссылки должен быть удалён');
assert.ok(!casesSection.includes('СК ГОРОД'), 'Кейс СК ГОРОД без подтверждённой ссылки должен быть удалён');
for (const highQualityPreview of ['case-cromi-hq.jpg', 'case-darkrain-hq.jpg', 'case-skladno-hq.webp', 'case-fliesen-hq.webp']) {
  assert.ok(casesSection.includes(`src="assets/${highQualityPreview}"`), `Не подключено качественное официальное превью: ${highQualityPreview}`);
}

for (const forbidden of ['Georgia', 'font-style:italic', '#f3efe7', '#9c3f30']) {
  assert.ok(!css.includes(forbidden), `В новой visual system остался запрещённый editorial/старый токен: ${forbidden}`);
}
for (const token of ['--ink:#151516', '--surface:#1d1d1f', '--violet:#6846e6', '--client:#9d201a']) {
  assert.ok(css.includes(token), `Нет согласованного токена Serenity: ${token}`);
}
assert.ok(css.includes('.hero h1{max-width:1120px') && css.includes('font-size:clamp(56px,6.2vw,92px)'), 'Hero должен иметь спокойный согласованный масштаб');
assert.ok(css.includes('.final-cta h2{max-width:980px') && css.includes('font-size:clamp(44px,4.45vw,64px)'), 'Финальный CTA не должен быть чрезмерно крупным');
assert.ok(css.includes('.cta-bottom a{display:flex') && css.includes('background:transparent') && !css.includes('.cta-bottom a{display:flex;align-items:center;justify-content:space-between;gap:44px'), 'CTA должен быть спокойной текстовой ссылкой без крупной белой плашки');
assert.ok(css.includes('.ds-display{position:relative;min-height:520px') && css.includes('border-radius:20px'), 'Демонстрационный UI-блок должен быть компактным и аккуратным');
assert.ok(css.includes('.award-mark strong{position:absolute;z-index:1;top:36px') && css.includes('.award-mark small{position:absolute;z-index:1;top:75px'), 'Число и подпись места в наградах должны иметь раздельные уровни');
assert.ok(html.includes('Serenity × ТРЦ «Премьер»') && html.includes('Рязань · 2026'), 'Hero должен явно связывать Serenity, Премьер и Рязань');
assert.ok(html.includes('<span>20 лет</span><strong>Делаем маркетинг лучше</strong>'), 'В финале нужна согласованная подпись с прописной буквы');
const finalSection = html.slice(html.indexOf('<section class="final-cta'));
assert.ok(!finalSection.includes('serenity-logo.svg'), 'В финальном footer логотип Serenity должен быть заменён новой подписью');
assert.ok(!/<em\b/.test(html), 'Serif/italic акцентные обёртки должны быть удалены');

const localRefs = [...html.matchAll(/(?:src|href)="(assets\/[^"#]+)"/g)].map((match) => match[1]);
assert.ok(localRefs.length >= 10, 'Ожидались реальные локальные изображения и логотипы');
await Promise.all(localRefs.map((ref) => access(resolve(offerDir, ref))));
assert.ok(localRefs.includes('assets/award-wreath.svg'), 'Венок наград должен быть локальным ассетом оффера, а не ссылкой на другой клиентский проект');

const caseImages = ['case-cromi-hq.jpg', 'case-darkrain-hq.jpg', 'case-skladno-hq.webp', 'case-fliesen-hq.webp'];
const caseBuffers = await Promise.all(caseImages.map((name) => readFile(resolve(offerDir, 'assets', name))));
assert.equal(new Set(caseBuffers.map((buffer) => buffer.toString('base64'))).size, caseImages.length, 'Превью кейсов не должны дублировать одну заглушку');

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

console.log(`ТРЦ Премьер: ${localRefs.length} локальных assets, коммерческие условия и структура проверены`);
