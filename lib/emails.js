// RBC emails: one branded layout, the sign-in emails Supabase sends, and the order emails the store sends.
// Everything is table-based with inline styles so it looks right in Gmail, Outlook and Apple Mail.

export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
export const FROM = process.env.EMAIL_FROM || 'The RBC Brand <hello@the store>';
const WA = (process.env.WHATSAPP_NUMBER || '2349067296284').replace(/\D/g, '');

const C = { bg: '#F3ECDF', card: '#FFFFFF', ink: '#27170E', body: '#5B4636', muted: '#8A7B6B', line: '#E3D9C7', purple: '#5B351D', soft: '#F6EFE2', deep: '#27170E' };
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`;
const abs = (u) => (!u ? '' : /^https?:/.test(u) ? u : `${SITE}${u.startsWith('/') ? '' : '/'}${u}`);
const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

// ---------- building blocks ----------
export const button = (href, label) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px"><tr><td style="border-radius:999px;background:${C.purple}">
<a href="${href}" target="_blank" style="display:inline-block;padding:15px 30px;font-family:${SANS};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">${label}</a>
</td></tr></table>`;

const p = (html, extra = '') => `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.body};${extra}">${html}</p>`;
const small = (html) => `<p style="margin:0 0 12px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.muted}">${html}</p>`;

const panel = (html) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 20px"><tr><td style="background:${C.soft};border-radius:12px;padding:16px 18px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.body}">${html}</td></tr></table>`;

const deliveryNotes = panel(`<strong style="color:${C.ink}">How delivery works</strong><br>
Nationwide delivery available.<br>
Interstate delivery takes 1–3 days. Farther locations ship with GIG or DHL.<br>
Delivery fees depend on your location and package weight, and we confirm yours on WhatsApp.`);

const progress = (step, pickup) => {
  const steps = ['Confirmed', 'Packed', pickup ? 'Ready' : 'On its way', pickup ? 'Collected' : 'Delivered'];
  const cells = steps.map((s, i) => `<td width="25%" style="padding:0 3px;vertical-align:top">
    <div style="height:6px;border-radius:999px;background:${i <= step ? C.purple : C.line};font-size:0;line-height:0">&nbsp;</div>
    <div style="padding-top:8px;font-family:${SANS};font-size:12px;font-weight:700;color:${i <= step ? C.ink : C.muted}">${s}</div></td>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 22px"><tr>${cells}</tr></table>`;
};

const items = (o) => {
  const rows = (o.order_items || []).map((l) => `<tr>
    <td width="60" style="padding:10px 0;border-bottom:1px solid ${C.line}">${l.image ? `<img src="${esc(abs(l.image))}" width="52" height="52" alt="" style="display:block;width:52px;height:52px;border-radius:8px;object-fit:cover;background:${C.soft}">` : ''}</td>
    <td style="padding:10px 12px;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${C.ink}"><strong>${esc(l.name)}</strong><br><span style="color:${C.muted};font-size:13px">${esc(l.colour || '')} × ${l.qty}</span>${l.custom ? `<br><span style="color:${C.purple};font-size:13px">Personalise: “${esc(l.custom)}”</span>` : ''}${l.custom_photo ? `<br><a href="${esc(l.custom_photo)}" style="color:${C.purple};font-size:13px">📷 View customer picture</a>` : ''}${l.custom_fee > 0 ? `<br><span style="color:${C.muted};font-size:12px">incl. ${naira(l.custom_fee)} personalisation</span>` : ''}</td>
    <td align="right" style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${C.ink};white-space:nowrap">${naira(l.price * l.qty)}</td></tr>`).join('');
  const line = (label, value, strong) => `<tr><td colspan="2" style="padding:6px 0;font-family:${SANS};font-size:${strong ? 16 : 14}px;color:${strong ? C.ink : C.body};${strong ? 'font-weight:700' : ''}">${label}</td><td align="right" style="padding:6px 0;font-family:${SANS};font-size:${strong ? 16 : 14}px;color:${strong ? C.ink : C.body};${strong ? 'font-weight:700' : ''};white-space:nowrap">${value}</td></tr>`;
  const pickup = o.delivery_mode === 'pickup';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px">${rows}
    ${line('Subtotal', naira(o.subtotal))}
    ${o.discount > 0 ? line(`Discount (${esc(o.discount_code)})`, `−${naira(o.discount)}`) : ''}
    ${pickup ? line('Delivery', 'Pickup, free') : line('Delivery fee', o.delivery_fee != null ? naira(o.delivery_fee) : 'Confirmed on WhatsApp')}
    ${line(pickup || o.delivery_fee == null ? 'Items total' : 'Total', naira(o.total + (pickup ? 0 : o.delivery_fee || 0)), true)}
  </table>`;
};

const details = (o) => {
  const pickup = o.delivery_mode === 'pickup';
  const where = pickup ? 'Pickup at our point. We’ll send you the details.' : [o.address, o.apartment, o.city, o.state].filter(Boolean).map(esc).join(', ');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px"><tr>
    <td width="50%" style="vertical-align:top;padding-right:10px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.body}"><strong style="color:${C.ink};font-size:12px;letter-spacing:.06em;text-transform:uppercase">${pickup ? 'Pickup' : 'Delivering to'}</strong><br>${esc(o.first_name)} ${esc(o.last_name)}<br>${where}</td>
    <td width="50%" style="vertical-align:top;padding-left:10px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.body}"><strong style="color:${C.ink};font-size:12px;letter-spacing:.06em;text-transform:uppercase">Order</strong><br>${esc(o.number)}<br>${esc(o.delivery_name || '')}</td>
  </tr></table>`;
};

// bank details from the TRANSFER_INSTRUCTIONS setting, one "Label: value" per line
export function bankDetails() {
  return String(process.env.TRANSFER_INSTRUCTIONS || '').split(/\n|\\n/).map((l) => l.split(':')).filter((x) => x.length > 1).map(([k, ...v]) => [k.trim(), v.join(':').trim()]);
}

// ---------- the layout every email shares ----------
export function layout({ preheader = '', eyebrow = '', title, body, hero = '', footerNote = 'You’re getting this email because you shopped or signed in at the store.' }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg}">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg}"><tr><td align="center" style="padding:28px 14px 40px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
    <tr><td align="center" style="padding:6px 0 22px">
      <a href="${SITE}" target="_blank" style="text-decoration:none"><span style="display:inline-block;vertical-align:middle;width:30px;height:30px;border-radius:9px;background:${C.purple};color:#fff;font-family:${SERIF};font-size:17px;line-height:30px;text-align:center">R</span><span style="display:inline-block;vertical-align:middle;margin-left:8px;font-family:${SERIF};font-size:30px;line-height:1;color:${C.ink};letter-spacing:-.5px">RBC</span></a>
    </td></tr>
    <tr><td style="background:${C.card};border-radius:18px;padding:0;border:1px solid ${C.line};overflow:hidden">
      ${hero ? `<img src="${SITE}/email/hero/${hero}.png" width="560" alt="" style="display:block;width:100%;max-width:560px;height:auto;border:0;border-radius:17px 17px 0 0;background:${C.soft}">` : ''}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:${hero ? '28px' : '36px'} 32px 30px">
      ${eyebrow ? `<p style="margin:0 0 10px;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.purple}">${eyebrow}</p>` : ''}
      <h1 style="margin:0 0 18px;font-family:${SERIF};font-size:30px;line-height:1.15;font-weight:normal;color:${C.ink}">${title}</h1>
      ${body}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;border-top:1px solid ${C.line}"><tr><td style="padding-top:18px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.body}">
        Warmly,<br><strong style="color:${C.ink}">the RBC team</strong> <span style="color:${C.muted}">from The RBC Brand</span>
      </td></tr></table>
      </td></tr></table>
    </td></tr>
    <tr><td align="center" style="padding:22px 18px 0;font-family:${SANS};font-size:13px;line-height:1.7;color:${C.muted}">
      Questions? <a href="${waLink('Hi, I have a question.')}" style="color:${C.purple};font-weight:700;text-decoration:none">Chat with us on WhatsApp</a><br>
      <a href="${SITE}/shop" style="color:${C.muted}">Shop</a> &nbsp;·&nbsp; <a href="${SITE}/account" style="color:${C.muted}">My account</a> &nbsp;·&nbsp; <a href="${SITE}/policies" style="color:${C.muted}">Delivery &amp; help</a><br>
      <a href="https://instagram.com" style="color:${C.muted}">Instagram</a> &nbsp;·&nbsp; <a href="https://www.tiktok.com" style="color:${C.muted}">TikTok</a><br>
      The RBC Brand · Nigeria<br>
      <span style="font-size:12px">${footerNote}</span>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

// ---------- sign-in emails (pasted into Supabase → Authentication → Emails → Templates) ----------
// Supabase fills in {{ .ConfirmationURL }}, {{ .Token }}, {{ .Email }}, {{ .NewEmail }} itself.
const authNote = 'If you didn’t ask for this, you can ignore this email. Nobody can sign in without this link.';
export const AUTH_TEMPLATES = [
  {
    key: 'magic_link', supabase: 'Magic Link', subject: 'Your RBC sign-in link',
    html: layout({ preheader: 'Tap the button to sign in. The link works once and expires in 1 hour.', hero: 'signin', eyebrow: 'Sign in', title: 'Here’s your sign-in link',
      body: p('Tap the button below to sign in to your RBC account. No password needed.') + button('{{ .ConfirmationURL }}', 'Sign in to RBC') + small('The link works once and expires in 1 hour. Open it on the same device you asked from.') + small(authNote) }),
  },
  {
    key: 'confirmation', supabase: 'Confirm signup', subject: 'Welcome to The RBC Brand — confirm your email',
    html: layout({ preheader: 'One tap to confirm your email and finish signing in.', hero: 'confirm', eyebrow: 'Welcome', title: 'Welcome to The RBC Brand',
      body: p('Thanks for joining us. Confirm your email to finish signing in. Your account keeps your orders in one place and lets you review what you’ve bought.') + button('{{ .ConfirmationURL }}', 'Confirm my email') + small('This link expires in 24 hours.') + small(authNote) }),
  },
  {
    key: 'recovery', supabase: 'Reset Password', subject: 'Reset your RBC password',
    html: layout({ preheader: 'Use this link to choose a new password.', hero: 'recovery', eyebrow: 'Account', title: 'Reset your password',
      body: p('We got a request to reset the password for <strong>{{ .Email }}</strong>. Tap below to choose a new one.') + button('{{ .ConfirmationURL }}', 'Choose a new password') + small('The link expires in 1 hour.') + small('Didn’t ask for this? Your password hasn’t changed, and you can ignore this email.') }),
  },
  {
    key: 'email_change', supabase: 'Change Email Address', subject: 'Confirm your new email for RBC',
    html: layout({ preheader: 'Confirm the new email address on your RBC account.', hero: 'email_change', eyebrow: 'Account', title: 'Confirm your new email',
      body: p('You asked to change your RBC email from <strong>{{ .Email }}</strong> to <strong>{{ .NewEmail }}</strong>. Tap below to confirm.') + button('{{ .ConfirmationURL }}', 'Confirm new email') + small('If this wasn’t you, ignore this email and your account stays as it is.') }),
  },
  {
    key: 'invite', supabase: 'Invite user', subject: 'You’re invited to the RBC team',
    html: layout({ preheader: 'Accept your invitation to the RBC admin.', hero: 'invite', eyebrow: 'Team', title: 'You’re invited to RBC',
      body: p('You’ve been invited to help run the RBC store. Accept below to set up your account, then you’ll find the admin at ${SITE}/admin.') + button('{{ .ConfirmationURL }}', 'Accept invitation') + small('This invitation expires in 24 hours.') }),
  },
  {
    key: 'reauthentication', supabase: 'Reauthentication', subject: 'Your RBC verification code',
    html: layout({ preheader: 'Your one-time code to confirm it’s you.', hero: 'reauth', eyebrow: 'Security', title: 'Confirm it’s you',
      body: p('Enter this code to continue:') + `<p style="margin:6px 0 20px;font-family:${SANS};font-size:32px;font-weight:700;letter-spacing:8px;color:${C.ink}">{{ .Token }}</p>` + small('The code expires in a few minutes. Never share it with anyone, including people who say they’re from The RBC Brand.') }),
  },
];

// ---------- order emails (sent by the store) ----------
const orderLink = (o) => `${SITE}/order/${o.id}`;
const firstName = (o) => esc(o.first_name || 'there');
const waOrder = (o, q) => waLink(`Hi, ${q} My order number is ${o.number}.`);

// which illustration sits at the top of each order email
const heroFor = (kind, o) => ({ paid: 'paid', pod: 'paid', transfer: 'transfer', delivery_fee: 'delivery_fee', packed: 'packed', shipped: o.delivery_mode === 'pickup' ? 'pickup' : 'shipped', delivered: 'delivered', cancelled: 'cancelled', cancelled_by_you: 'cancelled' }[kind] || '');

export function orderEmail(kind, o) {
  const pickup = o.delivery_mode === 'pickup';
  const fee = o.delivery_fee;
  const T = {
    // card / OPay paid, or a bank transfer confirmed by the team
    paid: () => ({
      subject: `Order ${o.number} confirmed — thank you!`,
      eyebrow: 'Order confirmed', title: `Thank you, ${firstName(o)}!`, pre: `We've received your payment for ${o.number} and we're getting it ready.`,
      body: progress(0, pickup) + p(`We’ve received your payment and your order is confirmed. We’ll pack it and ${pickup ? 'let you know when it’s ready to collect' : 'send it out on the next delivery day'}.`)
        + (!pickup && fee == null ? p(`<strong style="color:${C.ink}">Delivery fee:</strong> we’ll message you on WhatsApp with your delivery fee, based on your location and the package weight.`) : '')
        + items(o) + details(o) + deliveryNotes + button(orderLink(o), 'View your order'),
    }),
    // bank transfer chosen at checkout
    transfer: () => {
      const bank = bankDetails();
      const row = (label, value, big) => `<tr><td style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:13px;color:${C.muted};width:42%">${label}</td><td align="right" style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:${big ? 20 : 15}px;font-weight:700;color:${C.ink};letter-spacing:${big ? '1px' : '0'}">${value}</td></tr>`;
      const card = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 22px;background:${C.soft};border-radius:14px"><tr><td style="padding:6px 18px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${row('Amount to pay', naira(o.total), true)}
        ${bank.length ? bank.map(([k, v]) => row(esc(k), esc(v), /account number/i.test(k))).join('') : row('Bank details', 'the RBC team will send them on WhatsApp')}
        <tr><td style="padding:10px 0;font-family:${SANS};font-size:13px;color:${C.muted}">Reference / narration</td><td align="right" style="padding:10px 0;font-family:${SANS};font-size:15px;font-weight:700;color:${C.purple}">${esc(o.number)}</td></tr>
      </table></td></tr></table>`;
      const step = (n, text) => `<tr><td width="34" style="vertical-align:top;padding:0 0 12px"><div style="width:26px;height:26px;border-radius:50%;background:${C.purple};color:#fff;font-family:${SANS};font-size:13px;font-weight:700;line-height:26px;text-align:center">${n}</div></td><td style="vertical-align:top;padding:3px 0 12px;font-family:${SANS};font-size:15px;line-height:1.5;color:${C.body}">${text}</td></tr>`;
      return {
        subject: `Pay ${naira(o.total)} to confirm your RBC order ${o.number}`,
        eyebrow: 'Pay by bank transfer', title: 'Pay in 3 simple steps',
        pre: `Transfer ${naira(o.total)} to ${bank.find(([k]) => /bank/i.test(k))?.[1] || 'our account'} and use ${o.number} as the reference.`,
        body: p(`Thanks, ${firstName(o)}! Your items are reserved for <strong style="color:${C.ink}">24 hours</strong>.`) + card
          + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px">
              ${step(1, `Transfer exactly <strong style="color:${C.ink}">${naira(o.total)}</strong> to the account above.`)}
              ${step(2, `Type <strong style="color:${C.ink}">${esc(o.number)}</strong> as the narration, so we know it’s you.`)}
              ${step(3, 'Send a screenshot of your receipt to the RBC team on WhatsApp.')}
            </table>`
          + button(waOrder(o, `I’ve paid ${naira(o.total)} for my order. Here’s my receipt.`), 'Send my receipt on WhatsApp')
          + small('We’ll confirm your payment and email you straight away. Orders not paid within 24 hours are cancelled automatically.')
          + `<div style="height:10px"></div>` + items(o) + details(o),
      };
    },
    // pay on delivery / at pickup
    pod: () => ({
      subject: `Order ${o.number} confirmed — pay ${pickup ? 'at pickup' : 'on delivery'}`,
      eyebrow: 'Order confirmed', title: `Thank you, ${firstName(o)}!`, pre: `Your order ${o.number} is confirmed. You'll pay when it's handed over.`,
      body: progress(0, pickup) + p(`Your order is confirmed. You’ll pay by card or transfer ${pickup ? 'when you collect it at our pickup point' : 'when it’s delivered'}.`)
        + items(o) + details(o) + deliveryNotes + button(orderLink(o), 'View your order'),
    }),
    delivery_fee: () => ({
      subject: `Delivery fee for order ${o.number}`,
      eyebrow: 'Delivery fee', title: `Delivery to ${esc(o.city || 'you')}: ${naira(fee)}`, pre: `Your delivery fee for ${o.number} is ${naira(fee)}.`,
      body: p(`Hi ${firstName(o)}, we’ve worked out delivery for your order based on your location and the package weight.`)
        + panel(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:${SANS};font-size:14px;color:${C.body}">Delivery fee</td><td align="right" style="font-family:${SANS};font-size:22px;font-weight:700;color:${C.ink}">${naira(fee)}</td></tr></table>`)
        + p('Reply on WhatsApp to confirm, and we’ll share how to pay. Your order goes out once the delivery fee is settled.')
        + button(waOrder(o, `I'm confirming the ${naira(fee)} delivery fee.`), 'Confirm on WhatsApp') + details(o),
    }),
    packed: () => ({
      subject: `Your RBC order ${o.number} is packed`,
      eyebrow: 'Packed', title: 'Your order is packed', pre: pickup ? 'Ready for pickup.' : 'It goes out on the next delivery day.',
      body: progress(1, pickup) + p(pickup ? `Good news, ${firstName(o)}. Your order is packed and will be ready to collect at our pickup point. We’ll send you the details.` : `Good news, ${firstName(o)}. Your order is packed and goes out on the next delivery day. ${'Delivery takes 1–3 days.'}`)
        + items(o) + button(orderLink(o), 'Track your order'),
    }),
    shipped: () => pickup ? ({
      subject: `Order ${o.number} is ready for pickup`,
      eyebrow: 'Ready for pickup', title: 'Ready when you are', pre: 'Collect your order at our pickup point.',
      body: progress(2, true) + p(`Your order is ready to collect at our pickup point, ${firstName(o)}. The RBC team will send you the exact pickup point on WhatsApp.`)
        + (o.payment_method === 'pod' ? p(`Please have <strong style="color:${C.ink}">${naira(o.total)}</strong> ready to pay by card or transfer when you collect.`) : '')
        + button(waOrder(o, 'what’s the pickup point for my order?'), 'Get the pickup point') + items(o),
    }) : ({
      subject: `Order ${o.number} is on its way`,
      eyebrow: 'On its way', title: 'Your order is on its way', pre: o.tracking_number ? `${o.courier || 'Courier'} tracking: ${o.tracking_number}` : 'It’s out for delivery.',
      body: progress(2, false) + p(`Your order has left us, ${firstName(o)}.${o.courier ? ` It’s travelling with <strong style="color:${C.ink}">${esc(o.courier)}</strong>.` : ''}`)
        + (o.tracking_number ? panel(`<strong style="color:${C.ink}">Tracking number</strong><br><span style="font-size:18px;font-weight:700;letter-spacing:1px;color:${C.ink}">${esc(o.tracking_number)}</span><br>Use it on the ${esc(o.courier || 'courier')} website or app to follow your parcel.`) : '')
        + p('Delivery usually takes 1–3 days.')
        + (o.payment_method === 'pod' ? p(`Please have <strong style="color:${C.ink}">${naira(o.total + (fee || 0))}</strong> ready to pay on delivery.`) : '')
        + items(o) + button(orderLink(o), 'Track your order'),
    }),
    delivered: () => ({
      subject: pickup ? `Thanks for collecting order ${o.number}` : `Order ${o.number} delivered`,
      eyebrow: pickup ? 'Collected' : 'Delivered', title: 'We hope you love it', pre: 'Tell us what you think with a quick review.',
      body: progress(3, pickup) + p(`Your order ${pickup ? 'has been collected' : 'has been delivered'}, ${firstName(o)}. Thank you for shopping with RBC!`)
        + p('If you have a minute, a quick review (with a photo or short video) helps other shoppers and means a lot to us.')
        + button(`${SITE}/account`, 'Write a review') + small('Something not right? Just message us on WhatsApp and we’ll sort it out.') + items(o),
    }),
    cancelled: () => ({
      subject: `Order ${o.number} has been cancelled`,
      eyebrow: 'Cancelled', title: 'Your order was cancelled', pre: `Order ${o.number} has been cancelled.`,
      body: p(`Hi ${firstName(o)}, your order <strong>${esc(o.number)}</strong> has been cancelled${o.payment_method === 'transfer' && !o.paid_at ? ' because we didn’t receive the bank transfer in time' : ''}.`)
        + p(o.paid_at ? 'If you paid, your refund goes back to your original payment method within 5 working days.' : 'No money was taken.')
        + p('If this is a mistake or you’d still like the items, message us and we’ll sort it out.')
        + button(waOrder(o, 'my order was cancelled and I have a question.'), 'Chat with us') + items(o),
    }),
    cancelled_by_you: () => ({
      subject: `You cancelled order ${o.number}`,
      eyebrow: 'Cancelled', title: 'Your order is cancelled', pre: `You cancelled order ${o.number}. Nothing to pay.`,
      body: p(`Hi ${firstName(o)}, as you asked, order <strong>${esc(o.number)}</strong> has been cancelled.`)
        + p(o.payment_method === 'transfer' ? 'Please don’t send the bank transfer for this order. If you already sent it, message us with your receipt and we’ll refund you or restore the order.' : 'No money was taken.')
        + p('Changed your mind? The items are back in the store whenever you’re ready.')
        + button(`${SITE}/shop`, 'Back to the store') + items(o),
    }),
  }[kind];
  if (!T) return null;
  const t = T();
  const html = layout({ preheader: t.pre, hero: heroFor(kind, o), eyebrow: t.eyebrow, title: t.title, body: t.body, footerNote: `You’re getting this email about your RBC order ${esc(o.number)}.` });
  const text = `${t.title.replace(/<[^>]+>/g, '')}\n\n${t.pre}\n\nView your order: ${orderLink(o)}\n\nQuestions? WhatsApp us: https://wa.me/${WA}\n\nThe RBC Brand`;
  return { subject: t.subject, html, text };
}

// which email goes with which status change
export const EMAIL_FOR_STATUS = { paid: 'paid', packed: 'packed', shipped: 'shipped', delivered: 'delivered', cancelled: 'cancelled' };

// ---------- emails to the team ----------
const PAY_LABEL = { paystack: 'Paystack (card, transfer or USSD)', opay: 'OPay', transfer: 'Bank transfer', pod: 'Pay on delivery' };

// kind: 'paid' (money received automatically) or 'transfer' (customer will pay by bank transfer, needs confirming)
export function staffOrderEmail(kind, o) {
  const pickup = o.delivery_mode === 'pickup';
  const admin = `${SITE}/admin/orders/${o.id}`;
  const phone = String(o.phone || '').replace(/\D/g, '').replace(/^0/, '234');
  const count = (o.order_items || []).reduce((a, l) => a + l.qty, 0);
  const where = pickup ? 'Pickup' : [o.address, o.apartment, o.city, o.state].filter(Boolean).map(esc).join(', ');
  const transfer = kind === 'transfer';
  const subject = transfer ? `New order ${o.number} · ${naira(o.total)} by bank transfer (check your account)` : `New paid order ${o.number} · ${naira(o.total)}`;
  const row = (k, v) => `<tr><td style="padding:7px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:13px;color:${C.muted};width:110px;vertical-align:top">${k}</td><td style="padding:7px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${C.ink}">${v}</td></tr>`;
  const body = p(transfer
      ? `<strong>${esc(o.first_name)} ${esc(o.last_name)}</strong> placed an order and will pay <strong>${naira(o.total)}</strong> by bank transfer. When the money lands in the account with reference <strong>${esc(o.number)}</strong>, open the order and mark it paid. Unpaid transfer orders cancel themselves after 24 hours.`
      : `<strong>${esc(o.first_name)} ${esc(o.last_name)}</strong> just paid <strong>${naira(o.total)}</strong>. It’s ready to pack.`)
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px">
      ${row('Customer', `${esc(o.first_name)} ${esc(o.last_name)}<br><a href="mailto:${esc(o.email)}" style="color:${C.purple}">${esc(o.email)}</a>`)}
      ${row('WhatsApp', phone ? `<a href="https://wa.me/${phone}" style="color:${C.purple}">${esc(o.phone)}</a>` : '—')}
      ${row(pickup ? 'Pickup' : 'Deliver to', where)}
      ${row('Delivery', `${esc(o.delivery_name || '')}${pickup ? '' : ' · <strong>send the delivery fee</strong>'}`)}
      ${row('Payment', PAY_LABEL[o.payment_method] || esc(o.payment_method))}
      ${o.discount > 0 ? row('Discount', `${esc(o.discount_code)} (−${naira(o.discount)})`) : ''}
    </table>`
    + items(o)
    + button(admin, transfer ? 'Open order to confirm payment' : 'Open order');
  const html = layout({ hero: 'team', preheader: `${count} item${count === 1 ? '' : 's'} · ${naira(o.total)} · ${pickup ? 'pickup' : esc(o.state || 'delivery')}`, eyebrow: transfer ? 'New order · awaiting transfer' : 'New order · paid', title: transfer ? 'Confirm this transfer' : 'You’ve got an order!', body, footerNote: 'Sent to the RBC team because a customer placed an order.' });
  const text = `${subject}\n\n${o.first_name} ${o.last_name} · ${o.phone} · ${o.email}\n${pickup ? 'Pickup' : `Deliver to: ${[o.address, o.city, o.state].filter(Boolean).join(', ')}`}\n\n${(o.order_items || []).map((l) => `${l.qty} × ${l.name} (${l.colour}) ${naira(l.price * l.qty)}`).join('\n')}\nTotal: ${naira(o.total)}\n\nOpen the order: ${admin}`;
  return { subject, html, text };
}
