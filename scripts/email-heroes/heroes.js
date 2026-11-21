// Email heroes for The RBC Brand: one calm scene per email, pastel oat ground, gold accents,
// the R monogram where Azalea used flowers. 560x240 canvas. Rendered to PNG by render.js.
const K = '#4A3829';   // soft coffee outline (never the heavy dark brown)
const P = '#D9BE8C';   // warm sand: main object fill
const G = '#C9A34E';   // gold accent
const GL = '#EAD7A6';  // pale gold
const L = '#E2D2BC';   // camel light
const LL = '#EFE6D8';  // oat
const PK = '#EED6C8';  // blush
const BL = '#F2D3C2';  // cheeks
const CR = '#FFFDF8';  // cream
const SG = '#DCE5D3';  // soft sage (ticks, success)
const W = '#FFFFFF';
const S0 = `stroke-linejoin="round" stroke-linecap="round"`;
const S = `stroke="${K}" stroke-width="2.6" ${S0}`;

// the RBC mark: a rounded tile with a serif R
const mono = (x, y, s = 1, fill = CR, ink = G) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-17" y="-17" width="34" height="34" rx="9" fill="${fill}" stroke="${ink}" stroke-width="2"/><text x="0" y="8.5" text-anchor="middle" font-family="Gloock, Georgia, serif" font-size="24" fill="${ink}">R</text></g>`;
const seal = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="15" fill="${G}" ${S} stroke-width="2.2"/><text x="0" y="6.5" text-anchor="middle" font-family="Gloock, Georgia, serif" font-size="18" fill="${CR}">R</text></g>`;
const sparkle = (x, y, s = 1, c = G) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-10 C1-3 3-1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0-10Z" fill="${c}"/>`;
const dot = (x, y, r = 3, c = L) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const gift = (x, y, s = 1, c = PK, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><rect x="-10" y="-8" width="20" height="17" rx="3" fill="${c}"/><rect x="-12" y="-12" width="24" height="6" rx="2" fill="${c}"/><path d="M0 -12 V9" stroke="${G}" stroke-width="2.4"/><path d="M0 -12 c-5 -7 -11 -2 -5 1 M0 -12 c5 -7 11 -2 5 1" fill="none" stroke="${G}" stroke-width="2" ${S0}/></g>`;
const face = (x, y, s = 1, mood = 'happy') => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="-11" cy="0" rx="2.8" ry="3.8" fill="${K}"/><ellipse cx="11" cy="0" rx="2.8" ry="3.8" fill="${K}"/>
  <circle cx="-19" cy="8" r="4.5" fill="${BL}"/><circle cx="19" cy="8" r="4.5" fill="${BL}"/>
  ${mood === 'happy' ? `<path d="M-6 7 Q0 13 6 7" fill="none" ${S} stroke-width="2.4"/>` : mood === 'wow' ? `<ellipse cx="0" cy="9" rx="3.2" ry="3.8" fill="${K}"/>` : `<path d="M-5 9 L5 9" ${S} stroke-width="2.4"/>`}</g>`;
const motion = (x, y, n = 3, len = 26) => Array.from({ length: n }, (_, i) => `<path d="M${x} ${y + i * 12} h-${len - i * 6}" ${S0} stroke="${GL}" stroke-width="4"/>`).join('');

// floating gifts, monograms and sparkles shared by every scene (kept clear of the centre)
const floaters = (seed = 0) => {
  const gifts = [[64, 62, 1.15, PK, -10], [120, 170, .8, GL, 12], [500, 150, 1.2, PK, 8], [442, 198, .7, GL, -14]];
  const monos = [[470, 56, .85], [44, 196, .7]];
  const sp = [[152, 50, .9, G], [416, 112, .7, GL], [484, 212, .6, G], [74, 140, .5, GL], [528, 92, .55, G]];
  const d = [[182, 206, 3, L], [396, 42, 3.5, GL], [140, 92, 2.5, L], [522, 206, 3, PK], [30, 112, 3, GL]];
  return gifts.map((a, i) => gift(a[0], a[1], a[2], a[3], a[4] + ((seed * 7 + i * 5) % 11) - 5)).join('') + monos.map((a) => mono(...a)).join('') + sp.map((a) => sparkle(...a)).join('') + d.map((a) => dot(...a)).join('');
};
const ground = (w = 200) => `<ellipse cx="280" cy="214" rx="${w / 2}" ry="9" fill="${LL}"/>`;
const scene = (body, seed) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 240" width="560" height="240">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FCFAF6"/><stop offset="1" stop-color="#F3ECE1"/></linearGradient></defs>
<rect width="560" height="240" fill="url(#bg)"/>
<circle cx="280" cy="124" r="92" fill="${W}" opacity=".8"/>
${floaters(seed)}${body}</svg>`;

const envelope = (x, y, w, h, fill = W, flap = LL) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" ${S}/><path d="M${x + 4} ${y + 6} L${x + w / 2} ${y + h * .55} L${x + w - 4} ${y + 6}" fill="${flap}" ${S}/>`;
const key = (x, y, r = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M14 0 H62 M48 0 v12 M58 0 v9" ${S} stroke-width="10"/><path d="M14 0 H62 M48 0 v12 M58 0 v9" stroke="${G}" stroke-width="4.5" stroke-linecap="round" fill="none"/><circle r="18" fill="${G}" ${S}/><circle r="6" fill="${CR}" ${S} stroke-width="2.2"/></g>`;
const box = (x, y, w, h, c = P, top = GL) => `<path d="M${x} ${y} h${w} v${h} h-${w}Z" fill="${c}" ${S}/><path d="M${x - 8} ${y - 18} h${w + 16} v18 h-${w + 16}Z" fill="${top}" ${S}/>`;
const bag = (x, y, w = 110, h = 100, c = P) => `<path d="M${x + w * .3} ${y} q0 -34 ${w * .2} -34 q${w * .2} 0 ${w * .2} 34" fill="none" ${S} stroke-width="4.5"/><path d="M${x} ${y} h${w} l8 ${h} h-${w + 16}Z" fill="${c}" ${S}/>`;
const coin = (x, y, r = 40) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${G}" ${S}/><circle cx="${x}" cy="${y}" r="${r * .7}" fill="none" stroke="${GL}" stroke-width="3"/><text x="${x}" y="${y + r * .32}" text-anchor="middle" font-family="Gloock, Georgia, serif" font-size="${r * .9}" fill="${CR}">R</text>`;

const H = {
  signin: scene(`${ground(190)}${envelope(208, 92, 144, 104)}${face(280, 166)}${key(372, 80, 35, 1)}${seal(280, 94, 1.1)}`, 1),
  confirm: scene(`${ground(190)}${envelope(208, 92, 144, 104)}${face(280, 168)}${seal(280, 94, 1)}<circle cx="352" cy="92" r="24" fill="${SG}" ${S}/><path d="M341 92 l8 8 l15 -16" fill="none" ${S} stroke-width="3.6"/>`, 2),
  recovery: scene(`${ground(170)}<circle cx="280" cy="120" r="64" fill="${LL}" ${S}/><path d="M272 104 a12 12 0 1 1 16 0 l6 34 h-28Z" fill="${K}"/>${key(200, 176, -30, .9)}${face(280, 158, .55)}${sparkle(352, 72, 1.1)}`, 3),
  email_change: scene(`${ground(240)}${envelope(170, 104, 100, 76, W, LL)}${envelope(292, 104, 100, 76, GL, P)}${face(220, 160, .7)}${face(342, 160, .7)}<path d="M240 86 q41 -30 82 0" fill="none" ${S} stroke-width="3.2"/><path d="M314 78 l9 8 l-11 4" fill="none" ${S} stroke-width="3.2"/>`, 4),
  invite: scene(`${ground(190)}<path d="M212 104 L280 56 L348 104" fill="${LL}" ${S}/><rect x="226" y="72" width="108" height="80" rx="6" fill="${CR}" ${S}/><path d="M246 96 h68 M246 112 h50" ${S0} stroke="${GL}" stroke-width="4"/>${envelope(208, 104, 144, 92, W, 'none')}${face(280, 172)}${mono(280, 40, 1.1)}${sparkle(196, 70, .9, GL)}${sparkle(366, 64, 1, G)}`, 5),
  reauth: scene(`${ground(170)}<path d="M280 46 L338 66 V118 C338 156 310 180 280 192 C250 180 222 156 222 118 V66Z" fill="${GL}" ${S}/>${face(280, 112, .9)}<g>${[0, 1, 2, 3].map((i) => `<rect x="${243 + i * 20}" y="142" width="14" height="18" rx="4" fill="${W}" ${S} stroke-width="2.2"/>`).join('')}</g>`, 6),
  paid: scene(`${ground(200)}<rect x="330" y="92" width="58" height="84" rx="6" fill="${W}" ${S} transform="rotate(10 359 134)"/><path d="M345 112 h30 M345 126 h22 M345 140 h28" ${S0} stroke="${LL}" stroke-width="4" transform="rotate(10 359 134)"/>${bag(222, 104, 112, 102)}${face(278, 150)}<path d="M278 134 c-8 -12 -24 -4 -12 10 l12 10 l12 -10 c12 -14 -4 -22 -12 -10Z" fill="${PK}" ${S} stroke-width="2.2" transform="translate(0 -18)"/>`, 7),
  transfer: scene(`${ground(240)}<rect x="176" y="62" width="78" height="138" rx="14" fill="${K}"/><rect x="183" y="74" width="64" height="112" rx="8" fill="${W}"/><text x="215" y="130" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="${G}">₦</text>${face(215, 152, .55)}<path d="M266 128 h56" ${S} stroke-width="3.6" stroke-dasharray="2 9"/><path d="M318 118 l12 10 l-12 10" fill="none" ${S} stroke-width="3.6"/>${coin(372, 140)}`, 8),
  delivery_fee: scene(`${ground(180)}<path d="M228 52 h104 v150 l-13 -9 l-13 9 l-13 -9 l-13 9 l-13 -9 l-13 9 l-13 -9 l-13 9Z" fill="${W}" ${S}/><text x="280" y="98" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="${G}">₦</text><path d="M248 118 h64 M248 134 h46" ${S0} stroke="${LL}" stroke-width="4"/>${face(280, 160, .7)}<g transform="rotate(35 360 120)"><rect x="352" y="72" width="16" height="84" rx="3" fill="${G}" ${S}/><path d="M352 156 l8 16 l8 -16Z" fill="${CR}" ${S}/><rect x="352" y="72" width="16" height="12" fill="${PK}" ${S}/></g>`, 9),
  packed: scene(`${ground(210)}${box(220, 110, 120, 92)}<path d="M280 92 v110" ${S0} stroke="${G}" stroke-width="9"/><path d="M280 94 c-22 -26 -44 -6 -22 6Z M280 94 c22 -26 44 -6 22 6Z" fill="${G}" ${S}/><circle cx="280" cy="94" r="7" fill="${GL}" ${S}/>${face(250, 154, .75)}${mono(318, 168, .8)}`, 10),
  shipped: scene(`<path d="M60 206 H500" ${S0} stroke="${LL}" stroke-width="5" stroke-dasharray="20 14"/><path d="M196 96 h132 v100 h-132Z" fill="${W}" ${S}/><path d="M328 120 h44 l28 36 v40 h-72Z" fill="${P}" ${S}/><path d="M340 130 h28 l18 24 h-46Z" fill="${CR}" ${S}/>${mono(262, 146, 1.6)}<circle cx="236" cy="198" r="18" fill="${K}"/><circle cx="236" cy="198" r="7" fill="${LL}"/><circle cx="364" cy="198" r="18" fill="${K}"/><circle cx="364" cy="198" r="7" fill="${LL}"/>${motion(180, 120, 3, 34)}${face(376, 176, .45)}`, 11),
  pickup: scene(`${ground(230)}<rect x="196" y="98" width="168" height="104" fill="${CR}" ${S}/><path d="M188 74 h184 l-8 28 h-168Z" fill="${W}" ${S}/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${196 + i * 28} 102 a14 14 0 0 0 28 0" fill="${i % 2 ? W : GL}" ${S}/>`).join('')}<rect x="300" y="138" width="40" height="64" rx="4" fill="${P}" ${S}/>${bag(214, 160, 56, 42, PK)}<text x="280" y="94" text-anchor="middle" font-family="Gloock, Georgia, serif" font-size="17" fill="${G}">RBC</text>${face(320, 168, .45)}`, 12),
  delivered: scene(`${ground(220)}${box(222, 130, 116, 72)}<path d="M214 112 l-30 -26 l38 -4 Z" fill="${GL}" ${S}/><path d="M346 112 l30 -26 l-38 -4Z" fill="${GL}" ${S}/>${gift(258, 84, 1.6, PK, -12)}${gift(306, 72, 1.8, GL, 10)}${mono(282, 108, .9)}${sparkle(230, 58, 1.1)}${sparkle(336, 42, .9, GL)}${face(280, 166, .9)}`, 13),
  cancelled: scene(`${ground(200)}${box(226, 120, 108, 82, LL, CR)}${face(280, 162, .85, 'flat')}<rect x="320" y="84" width="54" height="34" rx="6" fill="${W}" ${S} transform="rotate(12 347 101)"/><path d="M339 93 l14 14 M353 93 l-14 14" ${S0} stroke="${PK}" stroke-width="4" transform="rotate(12 347 101)"/><path d="M262 82 q8 -16 18 0 q8 -16 18 0" fill="none" ${S0} stroke="${L}" stroke-width="3"/>`, 14),
  team: scene(`${ground(200)}<path d="M240 168 c0 -60 10 -92 40 -92 s40 32 40 92Z" fill="${G}" ${S}/><rect x="226" y="166" width="108" height="16" rx="8" fill="${G}" ${S}/><circle cx="280" cy="192" r="10" fill="${GL}" ${S}/><circle cx="280" cy="70" r="7" fill="${G}" ${S}/>${face(280, 132, .8, 'wow')}<path d="M210 96 q-12 22 0 44 M196 86 q-18 32 0 64 M350 96 q12 22 0 44 M364 86 q18 32 0 64" fill="none" ${S0} stroke="${GL}" stroke-width="3.5"/>`, 15),
  // abandoned bag: a bag with gifts peeking out, waiting, with a little clock
  cart: scene(`${ground(210)}${gift(262, 96, 1.7, PK, -14)}${gift(304, 90, 1.5, GL, 12)}${bag(222, 108, 116, 98)}${mono(280, 176, .85)}${face(280, 140, .85, 'wow')}<circle cx="370" cy="86" r="26" fill="${CR}" ${S}/><path d="M370 72 v14 l10 7" fill="none" ${S} stroke-width="3"/>${sparkle(196, 76, 1, GL)}${sparkle(404, 140, .8)}`, 16),
  // review request: a card with five gold stars and a pencil
  review: scene(`${ground(220)}<rect x="196" y="70" width="168" height="126" rx="16" fill="${W}" ${S}/>${[0, 1, 2, 3, 4].map((i) => `<path transform="translate(${226 + i * 27} 104) scale(.62)" d="M0 -18 L5.3 -6 L18 -5.6 L8.2 3 L11 16 L0 9 L-11 16 L-8.2 3 L-18 -5.6 L-5.3 -6Z" fill="${G}" ${S} stroke-width="3"/>`).join('')}${face(280, 156, .8)}<g transform="rotate(38 376 150)"><rect x="368" y="96" width="16" height="78" rx="3" fill="${GL}" ${S}/><path d="M368 174 l8 16 l8 -16Z" fill="${CR}" ${S}/><rect x="368" y="96" width="16" height="12" fill="${PK}" ${S}/></g>${mono(212, 60, .8)}${sparkle(352, 56, 1)}`, 17),
};
module.exports = H;
