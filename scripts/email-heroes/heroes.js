// Whimsical email heroes: one scene per email, RBC flowers floating around. 560x240 canvas.
const K = '#27170E', P = '#5B351D', L = '#BD8D65', LL = '#E7D3B6', PK = '#D8A579', BL = '#E7C9A6', CR = '#FBF6EC', Y = '#E0A456', M = '#CBBfa0', W = '#FFFFFF';
const S0 = `stroke-linejoin="round" stroke-linecap="round"`;
const S = `stroke="${K}" stroke-width="3" ${S0}`;

const flower = (x, y, s = 1, c = P, r = 0, core = W) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-9" rx="5.6" ry="8.6" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="3.6" fill="${core}"/></g>`;
const sparkle = (x, y, s = 1, c = Y) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-10 C1-3 3-1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0-10Z" fill="${c}"/>`;
const dot = (x, y, r = 3, c = L) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const face = (x, y, s = 1, mood = 'happy') => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="-11" cy="0" rx="3" ry="4" fill="${K}"/><ellipse cx="11" cy="0" rx="3" ry="4" fill="${K}"/>
  <circle cx="-19" cy="8" r="4.5" fill="${BL}" opacity=".9"/><circle cx="19" cy="8" r="4.5" fill="${BL}" opacity=".9"/>
  ${mood === 'happy' ? `<path d="M-6 7 Q0 13 6 7" fill="none" ${S} stroke-width="2.6"/>` : mood === 'wow' ? `<ellipse cx="0" cy="9" rx="3.4" ry="4" fill="${K}"/>` : mood === 'sad' ? `<path d="M-6 11 Q0 6 6 11" fill="none" ${S} stroke-width="2.6"/>` : `<path d="M-5 9 L5 9" ${S} stroke-width="2.6"/>`}</g>`;
const motion = (x, y, n = 3, len = 26) => Array.from({ length: n }, (_, i) => `<path d="M${x} ${y + i * 12} h-${len - i * 6}" ${S0} stroke="${L}" stroke-width="4"/>`).join('');

// floating flowers + confetti shared by every scene (positions avoid the centre)
const floaters = (seed = 0) => {
  const f = [[60, 60, 1.5, P, 12], [118, 168, .9, PK, -20], [92, 112, .6, L, 30], [470, 52, 1.2, L, -8], [505, 150, 1.6, P, 25], [440, 196, .7, PK, 10], [34, 196, .8, L, 0], [530, 84, .55, PK, 40]];
  const sp = [[150, 48, .9, Y], [415, 112, .7, Y], [480, 210, .6, PK], [70, 150, .5, Y]];
  const d = [[180, 205, 3, L], [395, 40, 4, PK], [140, 90, 2.5, P], [520, 205, 3, Y], [30, 110, 3, PK]];
  return f.map((a, i) => flower(a[0], a[1], a[2], a[3], a[4] + seed * 17 + i * 3, i % 3 ? W : Y)).join('') + sp.map((a) => sparkle(...a)).join('') + d.map((a) => dot(...a)).join('');
};
const ground = (w = 200) => `<ellipse cx="280" cy="214" rx="${w / 2}" ry="10" fill="${LL}" opacity=".85"/>`;
const scene = (body, seed) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 240" width="560" height="240">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBF6EC"/><stop offset="1" stop-color="#EFE2CE"/></linearGradient></defs>
<rect width="560" height="240" fill="url(#bg)"/>
<circle cx="280" cy="124" r="92" fill="${W}" opacity=".75"/>
${floaters(seed)}${body}</svg>`;

const envelope = (x, y, w, h, fill = W, flap = LL) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" ${S}/><path d="M${x + 4} ${y + 6} L${x + w / 2} ${y + h * .55} L${x + w - 4} ${y + 6}" fill="${flap}" ${S}/>`;
const key = (x, y, r = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M14 0 H62 M48 0 v12 M58 0 v9" ${S} stroke-width="11"/><path d="M14 0 H62 M48 0 v12 M58 0 v9" stroke="${Y}" stroke-width="5" stroke-linecap="round" fill="none"/><circle r="18" fill="${Y}" ${S}/><circle r="6" fill="${CR}" ${S} stroke-width="2.4"/></g>`;
const box = (x, y, w, h, c = '#E8C79A', top = '#F2D7AE') => `<path d="M${x} ${y} h${w} v${h} h-${w}Z" fill="${c}" ${S}/><path d="M${x - 8} ${y - 18} h${w + 16} v18 h-${w + 16}Z" fill="${top}" ${S}/>`;
const bag = (x, y, w = 110, h = 100, c = P) => `<path d="M${x + w * .3} ${y} q0 -34 ${w * .2} -34 q${w * .2} 0 ${w * .2} 34" fill="none" ${S} stroke-width="5"/><path d="M${x} ${y} h${w} l8 ${h} h-${w + 16}Z" fill="${c}" ${S}/>`;

const H = {
  signin: scene(`${ground(190)}${envelope(208, 92, 144, 104)}${face(280, 166)}${key(372, 80, 35, 1)}${flower(280, 92, 1.1, P, 0, Y)}`, 1),
  confirm: scene(`${ground(190)}${envelope(208, 92, 144, 104)}${face(280, 168)}<circle cx="352" cy="92" r="24" fill="${M}" ${S}/><path d="M341 92 l8 8 l15 -16" fill="none" ${S} stroke-width="4"/>`, 2),
  recovery: scene(`${ground(170)}<circle cx="280" cy="120" r="64" fill="${LL}" ${S}/><path d="M272 104 a12 12 0 1 1 16 0 l6 34 h-28Z" fill="${K}"/>${key(200, 176, -30, .9)}${face(280, 158, .55)}${sparkle(352, 72, 1.1)}`, 3),
  email_change: scene(`${ground(240)}${envelope(170, 104, 100, 76, W, LL)}${envelope(292, 104, 100, 76, LL, L)}${face(220, 160, .7)}${face(342, 160, .7)}<path d="M240 86 q41 -30 82 0" fill="none" ${S} stroke-width="3.5"/><path d="M314 78 l9 8 l-11 4" fill="none" ${S} stroke-width="3.5"/>`, 4),
  invite: scene(`${ground(190)}<path d="M212 104 L280 56 L348 104" fill="${LL}" ${S}/><rect x="226" y="72" width="108" height="80" rx="6" fill="${CR}" ${S}/><path d="M246 96 h68 M246 112 h50" ${S0} stroke="${L}" stroke-width="4"/>${envelope(208, 104, 144, 92, W, 'none')}${face(280, 172)}<path d="M268 52 L280 18 L292 52Z" fill="${PK}" ${S}/>${dot(280, 16, 5, Y)}${sparkle(196, 70, .9, PK)}${sparkle(366, 64, 1, Y)}`, 5),
  reauth: scene(`${ground(170)}<path d="M280 46 L338 66 V118 C338 156 310 180 280 192 C250 180 222 156 222 118 V66Z" fill="${L}" ${S}/>${face(280, 112, .9)}<g>${[0, 1, 2, 3].map((i) => `<rect x="${243 + i * 20}" y="142" width="14" height="18" rx="4" fill="${W}" ${S} stroke-width="2.4"/>`).join('')}</g>`, 6),
  paid: scene(`${ground(200)}<rect x="330" y="92" width="58" height="84" rx="6" fill="${W}" ${S} transform="rotate(10 359 134)"/><path d="M345 112 h30 M345 126 h22 M345 140 h28" ${S0} stroke="${LL}" stroke-width="4" transform="rotate(10 359 134)"/>${bag(222, 104, 112, 102)}${face(278, 150)}<path d="M278 134 c-8 -12 -24 -4 -12 10 l12 10 l12 -10 c12 -14 -4 -22 -12 -10Z" fill="${PK}" ${S} stroke-width="2.4" transform="translate(0 -18)"/>`, 7),
  transfer: scene(`${ground(240)}<rect x="176" y="62" width="78" height="138" rx="14" fill="${K}"/><rect x="183" y="74" width="64" height="112" rx="8" fill="${W}"/><text x="215" y="130" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="${P}">₦</text>${face(215, 152, .55)}<path d="M266 128 h56" ${S} stroke-width="4" stroke-dasharray="2 9"/><path d="M318 118 l12 10 l-12 10" fill="none" ${S} stroke-width="4"/><circle cx="372" cy="140" r="40" fill="${Y}" ${S}/><circle cx="372" cy="140" r="28" fill="none" ${S0} stroke="#E8B53E" stroke-width="3"/>${flower(372, 140, 1.4, P, 10, Y)}`, 8),
  delivery_fee: scene(`${ground(180)}<path d="M228 52 h104 v150 l-13 -9 l-13 9 l-13 -9 l-13 9 l-13 -9 l-13 9 l-13 -9 l-13 9Z" fill="${W}" ${S}/><text x="280" y="98" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="${P}">₦</text><path d="M248 118 h64 M248 134 h46" ${S0} stroke="${LL}" stroke-width="4"/>${face(280, 160, .7)}<g transform="rotate(35 360 120)"><rect x="352" y="72" width="16" height="84" rx="3" fill="${Y}" ${S}/><path d="M352 156 l8 16 l8 -16Z" fill="${CR}" ${S}/><rect x="352" y="72" width="16" height="12" fill="${PK}" ${S}/></g>`, 9),
  packed: scene(`${ground(210)}${box(220, 110, 120, 92)}<path d="M280 92 v110" ${S0} stroke="${P}" stroke-width="10"/><path d="M280 94 c-22 -26 -44 -6 -22 6Z M280 94 c22 -26 44 -6 22 6Z" fill="${P}" ${S}/><circle cx="280" cy="94" r="7" fill="${PK}" ${S}/>${face(250, 154, .75)}${flower(318, 168, .9, P, 0, Y)}`, 10),
  shipped: scene(`<path d="M60 206 H500" ${S0} stroke="${LL}" stroke-width="5" stroke-dasharray="20 14"/><path d="M196 96 h132 v100 h-132Z" fill="${W}" ${S}/><path d="M328 120 h44 l28 36 v40 h-72Z" fill="${L}" ${S}/><path d="M340 130 h28 l18 24 h-46Z" fill="${CR}" ${S}/>${flower(262, 146, 2.4, P, 0, W)}<circle cx="236" cy="198" r="18" fill="${K}"/><circle cx="236" cy="198" r="7" fill="${LL}"/><circle cx="364" cy="198" r="18" fill="${K}"/><circle cx="364" cy="198" r="7" fill="${LL}"/>${motion(180, 120, 3, 34)}${face(376, 176, .45)}`, 11),
  pickup: scene(`${ground(230)}<rect x="196" y="98" width="168" height="104" fill="${CR}" ${S}/><path d="M188 74 h184 l-8 28 h-168Z" fill="${W}" ${S}/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${196 + i * 28} 102 a14 14 0 0 0 28 0" fill="${i % 2 ? W : PK}" ${S}/>`).join('')}<rect x="300" y="138" width="40" height="64" rx="4" fill="${L}" ${S}/>${bag(214, 160, 56, 42, P)}${flower(242, 180, .7, W, 0, Y)}<text x="280" y="94" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="${P}">azalea</text>${face(320, 168, .45)}`, 12),
  delivered: scene(`${ground(220)}${box(222, 130, 116, 72)}<path d="M214 112 l-30 -26 l38 -4 Z" fill="#F2D7AE" ${S}/><path d="M346 112 l30 -26 l-38 -4Z" fill="#F2D7AE" ${S}/>${flower(258, 82, 1.5, P, 10, Y)}${flower(304, 70, 1.8, PK, -10, W)}${flower(282, 108, 1.2, L, 20, Y)}${sparkle(230, 60, 1.1)}${sparkle(334, 44, .9, PK)}${face(280, 166, .9)}`, 13),
  cancelled: scene(`${ground(200)}${box(226, 120, 108, 82, '#E6DCEF', '#F1EAF7')}${face(280, 162, .85, 'flat')}<rect x="320" y="84" width="54" height="34" rx="6" fill="${W}" ${S} transform="rotate(12 347 101)"/><path d="M339 93 l14 14 M353 93 l-14 14" ${S0} stroke="${PK}" stroke-width="4" transform="rotate(12 347 101)"/><path d="M262 82 q8 -16 18 0 q8 -16 18 0" fill="none" ${S0} stroke="${L}" stroke-width="3"/>`, 14),
  team: scene(`${ground(200)}<path d="M240 168 c0 -60 10 -92 40 -92 s40 32 40 92Z" fill="${Y}" ${S}/><rect x="226" y="166" width="108" height="16" rx="8" fill="${Y}" ${S}/><circle cx="280" cy="192" r="10" fill="${P}" ${S}/><circle cx="280" cy="70" r="7" fill="${Y}" ${S}/>${face(280, 132, .8, 'wow')}<path d="M210 96 q-12 22 0 44 M196 86 q-18 32 0 64 M350 96 q12 22 0 44 M364 86 q18 32 0 64" fill="none" ${S0} stroke="${P}" stroke-width="3.5"/>`, 15),
};
module.exports = H;
