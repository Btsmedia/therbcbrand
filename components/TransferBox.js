'use client';
import { useState } from 'react';

// Bank transfer instructions on the order page: the details to copy, then three short steps.
export default function TransferBox({ amount, amountLabel, reference, bank, whatsapp }) {
  const [copied, setCopied] = useState('');
  const copy = async (key, text) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 1800); } catch {}
  };
  const Row = ({ label, value, copyValue, big, accent }) => (
    <div className="tb-row">
      <span className="tb-l">{label}</span>
      <span className={`tb-v ${big ? 'big' : ''} ${accent ? 'accent' : ''}`}>{value}</span>
      {copyValue ? <button type="button" className="tb-copy" onClick={() => copy(label, copyValue)} aria-label={`Copy ${label}`}>{copied === label ? 'Copied' : 'Copy'}</button> : <span />}
    </div>
  );
  return (
    <div className="tb">
      <div className="tb-head"><b>Pay by bank transfer</b><span>Your items are reserved for 24 hours.</span></div>
      <div className="tb-card">
        <Row label="Amount to pay" value={amountLabel} copyValue={String(amount)} big />
        {bank.length ? bank.map(([k, v]) => <Row key={k} label={k} value={v} copyValue={/account number/i.test(k) ? v.replace(/\s/g, '') : null} big={/account number/i.test(k)} />) : <Row label="Bank details" value="the RBC team will send them on WhatsApp" />}
        <Row label="Reference" value={reference} copyValue={reference} accent />
      </div>
      <ol className="tb-steps">
        <li><span>Transfer exactly <b>{amountLabel}</b> to the account above.</span></li>
        <li><span>Type <b>{reference}</b> as the narration, so we know it&apos;s you.</span></li>
        <li><span>Send a screenshot of your receipt to the RBC team on WhatsApp.</span></li>
      </ol>
      <a className="btn btn-solid tb-btn" href={whatsapp} target="_blank" rel="noopener noreferrer">Send my receipt on WhatsApp</a>
      <p className="tb-note">We&apos;ll confirm your payment and email you. Orders not paid within 24 hours are cancelled automatically.</p>
    </div>
  );
}
