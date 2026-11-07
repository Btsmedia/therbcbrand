import Link from 'next/link';
import HeroSlider from '@/components/home/HeroSlider';
import Rail from '@/components/home/Rail';
import VanitySet from '@/components/home/VanitySet';
import { Arrow } from '@/components/Icons';
import Stars from '@/components/Stars';
import { getProducts, getDealSettings, getSpotlight, getHomeTiles } from '@/lib/catalog';
import { dealPicks } from '@/lib/deals';
import { getLatestReviews } from '@/lib/reviews';
import { naira } from '@/lib/format';

export const revalidate = 60;

const DEPTS = [['Bath & beauty', '7278', 'beauty', 't3'], ['Gadgets', '7242', 'gadgets', 't4'], ['Kitchen', '7248', 'kitchen', 't2'], ['Lighting', '7236', 'lighting', 't1'], ['Storage', '7259', 'storage', 't5'], ['Decor', '7289', 'decor', 't3']];
const CHIPS = [['New arrivals', '/shop?sort=new'], ['Bestsellers', '/shop?sort=best'], ['Deals', '/shop?sale=1'], ['Under ₦10,000', '/shop?max=9999'], ['Gifts under ₦25,000', '/shop?max=25000'], ['For creators', '/shop?cat=gadgets'], ['For the kitchen', '/shop?cat=kitchen'], ['Small spaces', '/shop?cat=storage']];
const WORDS = ['Personalised gifts', 'Event souvenirs', 'Keepsakes', 'Home pieces', 'Nationwide delivery', 'Gift-ready'];

function Tile({ href, img, title, cta, big }) {
  return (
    <Link className={`tile ptile ${big ? 'big' : ''}`} href={href}>
      <img src={img} alt="" loading="lazy" />
      <div className="cap"><h3>{title}</h3><span className="link-arrow">{cta} <Arrow /></span></div>
    </Link>
  );
}

export default async function Home() {
  const [products, reviews, ds, ss, tiles] = await Promise.all([getProducts(), getLatestReviews(3), getDealSettings(), getSpotlight(), getHomeTiles()]);
  const deals = products.filter((p) => p.compare_at && p.compare_at > p.price);
  const maxOff = deals.reduce((m, p) => Math.max(m, Math.round((1 - p.price / p.compare_at) * 100)), 0);
  // chosen in admin; hidden if switched off or the product isn't live any more
  const spot = ss.on ? products.find((p) => p.slug === ss.slug && p.images?.length) : null;
  const vanity = ['heated-straightening-brush', 'foldable-1000w-hair-dryer', 'refillable-perfume-atomizer', 'travel-jewellery-box'].map((s) => products.find((p) => p.slug === s)).filter(Boolean);
  const dealPics = dealPicks(deals, ds.picks);

  return (
    <>
      <HeroSlider />

      <div className="trustbar" aria-label="Why shop with RBC"><div className="wrap trustbar-in">
        <span><b>Nationwide delivery</b> in 1 to 3 days</span>
        <span><b>Personalised</b> with a name or photo</span>
        <span><b>Pay your way</b> with card, transfer or USSD</span>
        <span><b>Help on WhatsApp</b> before and after you buy</span>
      </div></div>

      <section aria-labelledby="dep-h"><div className="wrap">
        <div className="sec-head"><div><h2 id="dep-h">Shop by category</h2></div><Link className="link-arrow" href="/shop">View all <Arrow /></Link></div>
        <div className="depts">
          {DEPTS.map(([n, img, f, t]) => { const c = products.filter((p) => p.categories.includes(f)).length; return (
            <Link key={f} className="dept" href={`/shop?cat=${f}`}><span className="disc" style={{ background: `var(--${t})` }}><img className="pimg" src={`/img/${img}.jpg`} alt="" loading="lazy" /></span><h3>{n}</h3><small>{c} piece{c === 1 ? '' : 's'}</small></Link>
          ); })}
        </div>
      </div></section>

      <section style={{ paddingTop: 0 }} aria-label="Collections"><div className="wrap collage">
        {tiles.collage.map((t, i) => <Tile key={i} big={i === 0} {...t} />)}
      </div></section>

      <Rail id="edit" eyebrow="New in" title="The RBC Edit" products={products} tabs={[['new', 'New in'], ['beauty', 'Bath & beauty'], ['gadgets', 'Gadgets'], ['kitchen', 'Kitchen']]} />
      <div className="wrap" style={{ marginTop: -16, marginBottom: 56 }}><Link className="link-arrow" href="/shop">Browse every piece <Arrow /></Link></div>

      {deals.length > 0 && (
        <section id="sale" style={{ paddingTop: 0 }} aria-labelledby="sale-h"><div className="wrap"><div className="split">
          <div className={`pic deal-pics n${dealPics.length}`}>{dealPics.map((p) => <Link key={p.id} className="dp" href={`/product/${p.slug}`}><img src={p.images[0]} alt={p.name} loading="lazy" /><span className="badge sale">−{Math.round((1 - p.price / p.compare_at) * 100)}%</span></Link>)}</div>
          <div className="txt">
            <h2 id="sale-h">{ds.title} <span>{ds.highlight}</span></h2><hr />
            <p>{ds.blurb}</p>
            <div className="codes"><div><strong>Up to {maxOff}%</strong><span>off selected items</span></div><div><strong>{deals.length}</strong><span>pieces on offer</span></div></div><hr />
            <div><Link className="btn btn-solid" href="/shop?sale=1">{ds.cta}</Link></div>
          </div>
        </div></div></section>
      )}

      <Rail id="essentials" eyebrow="Bestsellers" title="Customer favourites" products={products} tabs={[['bestseller', 'Bestsellers'], ['storage', 'Storage'], ['lighting', 'Lighting']]} />

      {spot && (
        <section className="story" aria-labelledby="story-h"><div className="wrap">
          <div className="story-top">
            <div>
              <h2 id="story-h">{spot.name}</h2>
              <p>{ss.blurb || spot.description}</p>
              <div className="spec"><span><b>{naira(spot.price)}</b></span>{spot.reviewCount > 0 && <span><b>{spot.rating.toFixed(1)}</b> from {spot.reviewCount} reviews</span>}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><Link className="btn btn-solid" href={`/product/${spot.slug}`}>{ss.cta}</Link></div>
            </div>
            <div className="story-art"><div className="ring" /><img src={spot.images[0]} alt={spot.name} loading="lazy" /></div>
          </div>
        </div></section>
      )}

      <VanitySet items={vanity} />

      <div className="marquee" aria-hidden="true"><div className="track">{[...WORDS, ...WORDS].map((w, i) => <span key={i}>{w}</span>)}</div></div>

      {tiles.editsOn && <section aria-label="Edits"><div className="wrap">
        <div className="sec-head"><div><h2>{tiles.editsHeading}</h2></div></div>
        <div className="two">{tiles.edits.map((t, i) => <Tile key={i} {...t} />)}</div>
      </div></section>}

      <section style={{ paddingTop: 0 }} aria-labelledby="fit-h"><div className="wrap fit">
        <div><h2 id="fit-h">Find the right gift sooner</h2></div>
        <div className="chips">{CHIPS.map(([n, h]) => <Link key={n} className="chip" href={h}>{n} <small>→</small></Link>)}</div>
      </div></section>

      {reviews.length > 0 && (
        <section style={{ paddingTop: 0 }} aria-labelledby="rev-h"><div className="wrap">
          <div className="sec-head"><div><h2 id="rev-h">Notes from customers</h2></div></div>
          <div className="reviews">{reviews.map((r) => { const img = (r.products?.product_images || []).sort((a, b) => a.position - b.position)[0]?.url; return (
            <article className="review" key={r.id}><Stars value={r.rating} /><h3>{r.title || r.products?.name}</h3><p>{r.body}</p>
              <footer><Link className="th tone-1" href={`/product/${r.products?.slug}`}>{img && <img className="pimg" src={img} alt="" />}</Link><span>{r.author_name}{r.city ? `, ${r.city}` : ''} · <b>{r.products?.name}</b></span></footer></article>
          ); })}</div>
        </div></section>
      )}

      <section style={{ paddingTop: 0 }} aria-label="Why shop with us"><div className="wrap perks">
        <div className="perk"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9h17v13H3zM20 13h5l4 5v4h-9z" /><circle cx="8" cy="24" r="2.5" /><circle cx="24" cy="24" r="2.5" /></svg><b>Delivery or pickup</b><p>Nationwide delivery, or collect your order from our pickup point.</p></div>
        <div className="perk"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="16" cy="16" r="12" /><path d="M4 16h24M16 4c4 4 5 8 5 12s-1 8-5 12c-4-4-5-8-5-12s1-8 5-12z" /></svg><b>Made personal</b><p>Add a name, a message or a photo to any gift marked Personalise.</p></div>
        <div className="perk"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 25l1.6-5A10 10 0 1 1 11 23.5z" /></svg><b>Help on WhatsApp</b><p>Ask about sizes, bulk orders or delivery before you buy, or after.</p></div>
        <div className="perk"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="26" height="18" rx="2" /><path d="M3 12h26M8 20h6" /></svg><b>Pay your way</b><p>Card, bank transfer or USSD at checkout.</p></div>
      </div></section>
    </>
  );
}
