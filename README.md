# Лабораторна робота 2. npm, Sass, Node.js

| | |
|---|---|
| **Прізвище** | Лавришин |
| **Група** | ІСТ |
| **Варіант** | 10 — Робочі місця для коворкінгу, акцентний колір `#2E8B94` |
| **Опублікована сторінка** | https://maksymlavryshyn.github.io/lab-2-Lavryshyn/ |

Сайт «WorkNest» з лабораторної роботи 1. Зовнішній вигляд не змінився, змінився спосіб збирання: стилі пишуться на Sass, а картки в `index.html` генерує скрипт на Node.js із файлу `data/products.json`.

## Середовище

Потрібен Node.js LTS.

| | |
|---|---|
| Node.js | v24.21.0 |
| npm | 11.19.0 |

## Команди

```
npm install            встановити залежності (sass) з package-lock.json
npm run scss:build     одноразово зібрати src/scss/main.scss у css/style.css (стиснутий, без source map)
npm run scss:watch     перезбирати стилі при кожному збереженні, зупинка Ctrl+C
npm run build:cards    згенерувати картки з data/products.json і вставити в index.html
npm run build          повний цикл: build:cards, потім scss:build
```

Збирання з нуля в чистій копії репозиторію: `npm install`, потім `npm run build`.

Пакети встановлюються локально (`devDependencies`), глобальних установок не потрібно. Команди запускаються через `npm run`, бо npm сам підставляє шлях до `node_modules/.bin`.

## Що робить кожен скрипт

- **scss:build** компілює `src/scss/main.scss` (з усіма partials) в один `css/style.css`. Цей файл підключає `index.html`, вручну його не правлять.
- **scss:watch** робить те саме, але стежить за змінами файлів у `src/scss`.
- **build:cards** (`scripts/build-cards.js`) читає `data/products.json` через `fs`, формує розмітку карток із тими самими класами, що й у лабораторній 1, і замінює все між `<!-- cards:start -->` та `<!-- cards:end -->` в `index.html`. Заміна повна, тому повторний запуск не дублює картки. У консоль виводиться кількість карток. Якщо JSON відсутній, пошкоджений, порожній або в елементі бракує поля, скрипт друкує зрозуміле повідомлення й завершується з кодом 1, без стека. Те саме при відсутніх маркерах.
- **build** запускає обидва кроки послідовно.

## Структура

```
lab2/
├── index.html              картки між маркерами генеруються скриптом
├── css/
│   └── style.css           зібраний, у репозиторії
├── src/
│   └── scss/
│       ├── main.scss       точка входу, лише @use
│       ├── _variables.scss CSS custom properties, точки переходу
│       ├── _mixins.scss    міксин mq() для медіазапитів
│       ├── _base.scss      скидання стилів, типографіка
│       ├── _components.scss .btn, .link-arrow, .pager, контейнер
│       ├── _header.scss
│       ├── _hero.scss
│       ├── _sections.scss  цифри, блоки «картинка + текст», New Spaces
│       ├── _products.scss  сітка й картка
│       ├── _testimonial.scss
│       ├── _cta.scss
│       └── _footer.scss
├── data/
│   └── products.json       6 позицій: id, title, price, oldPrice, image, description, link
├── scripts/
│   └── build-cards.js
├── img/
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Sass

- Підключення тільки через `@use`, `@import` не використовується.
- Змінні теми — CSS custom properties в окремому `_variables.scss`; там же карта точок переходу `$breakpoints`.
- Міксин `mq($name)` у `_mixins.scss`: `@include mq(md) { ... }` замість повторюваних `@media (min-width: 48rem)`.
- Вкладеність у BEM-стилі (`&__title`, `&--glass`), а також `&:hover`, `&::after` і конструкції на кшталт `.nav-toggle:checked ~ &`.

## Вибір модульної системи

Скрипт написаний на **CommonJS** (`require`). Це найпростіший варіант для невеликого скрипта без залежностей: не потрібен `"type": "module"` у `package.json`, а `__dirname` доступний одразу. ESM тут не дає переваг.

## Зміни порівняно з лабораторною 1

- У `hero` шлях до фону змінено з `/img/hero-bg.jpg` на відносний `../img/hero-bg.jpg` (відносно `css/style.css`), щоб фон працював і на GitHub Pages у підпапці репозиторію.
- Назва картки в `index.html` тепер посилання (`<a>` усередині `h3`), що веде на `link` з JSON. Колір і підкреслення успадковуються, вигляд той самий.
- `aria-label` кнопки «+» тепер будується з повної назви позиції (наприклад, «Add Meeting Room, 4 seats to booking»).
