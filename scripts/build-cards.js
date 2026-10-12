'use strict';

// Генерує розмітку карток із data/products.json і вставляє її в index.html
// між маркерами <!-- cards:start --> і <!-- cards:end -->.
// Модульна система: CommonJS (require).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'products.json');
const HTML_FILE = path.join(ROOT, 'index.html');

const START_MARKER = '<!-- cards:start -->';
const END_MARKER = '<!-- cards:end -->';
const REQUIRED_FIELDS = ['id', 'title', 'price', 'image', 'description', 'link'];

function fail(message) {
  console.error(`Помилка: ${message}`);
  process.exit(1);
}

function readFile(file, label) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      fail(`файл ${label} не знайдено (${path.relative(ROOT, file)})`);
    }
    fail(`не вдалося прочитати ${label}: ${err.message}`);
  }
}

function loadProducts() {
  const raw = readFile(DATA_FILE, 'з даними');

  let products;
  try {
    products = JSON.parse(raw);
  } catch (err) {
    fail(`data/products.json містить некоректний JSON (${err.message})`);
  }

  if (!Array.isArray(products) || products.length === 0) {
    fail('data/products.json має бути непорожнім масивом об’єктів');
  }

  products.forEach((item, index) => {
    if (item === null || typeof item !== 'object') {
      fail(`елемент №${index + 1} не є об’єктом`);
    }
    const missing = REQUIRED_FIELDS.filter((field) => item[field] === undefined || item[field] === '');
    if (missing.length > 0) {
      fail(`у елемента №${index + 1} немає полів: ${missing.join(', ')}`);
    }
    if (typeof item.price !== 'number' || Number.isNaN(item.price)) {
      fail(`у елемента №${index + 1} поле price має бути числом`);
    }
    if (item.oldPrice !== undefined && (typeof item.oldPrice !== 'number' || Number.isNaN(item.oldPrice))) {
      fail(`у елемента №${index + 1} поле oldPrice має бути числом`);
    }
  });

  return products;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function renderCard(product, indent) {
  const title = escapeHtml(product.title);
  const oldPrice =
    product.oldPrice === undefined
      ? ''
      : ` <s class="card__price-old">${formatPrice(product.oldPrice)}</s>`;

  const lines = [
    '<article class="card">',
    '  <figure class="card__media">',
    `    <img class="card__img" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.description)}" width="290" height="300" loading="lazy">`,
    `    <button class="card__add" type="button" aria-label="Add ${title} to booking">`,
    '      <img src="img/icon-plus.svg" alt="" width="30" height="30">',
    '    </button>',
    '  </figure>',
    `  <h3 class="card__title"><a href="${escapeHtml(product.link)}">${title}</a></h3>`,
    `  <p class="card__price"><span class="card__price-now">${formatPrice(product.price)}</span>${oldPrice}</p>`,
    '</article>',
  ];

  return lines.map((line) => indent + line).join('\n');
}

function main() {
  const products = loadProducts();
  const html = readFile(HTML_FILE, 'index.html');

  const startIndex = html.indexOf(START_MARKER);
  const endIndex = html.indexOf(END_MARKER);

  if (startIndex === -1 || endIndex === -1) {
    fail(`в index.html не знайдено маркери ${START_MARKER} і ${END_MARKER}`);
  }
  if (endIndex < startIndex) {
    fail('маркер cards:end стоїть раніше за cards:start');
  }

  // Відступ рядка з маркером, щоб згенерована розмітка стояла рівно.
  const lineStart = html.lastIndexOf('\n', startIndex) + 1;
  const markerIndent = html.slice(lineStart, startIndex);
  const cardIndent = `${markerIndent}`;

  const cards = products.map((product) => renderCard(product, cardIndent)).join('\n\n');

  // Усе між маркерами замінюється повністю, тому повторний запуск не дублює картки.
  const updated =
    html.slice(0, startIndex + START_MARKER.length) +
    `\n${cards}\n${markerIndent}` +
    html.slice(endIndex);

  try {
    fs.writeFileSync(HTML_FILE, updated, 'utf8');
  } catch (err) {
    fail(`не вдалося записати index.html: ${err.message}`);
  }

  console.log(`Згенеровано карток: ${products.length}`);
}

main();
