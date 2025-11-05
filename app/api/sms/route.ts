// app/api/sms/route.ts
import { NextResponse } from 'next/server';

function toE164FR(input: string) {
  const s = input.replace(/\s+/g, '');
  if (s.startsWith('+')) return s;
  if (s.startsWith('00')) return `+${s.slice(2)}`;
  if (s.startsWith('0')) return `+33${s.slice(1)}`;
  if (s.startsWith('33')) return `+${s}`;
  return s; // on suppose déjà en E.164 si autre pays
}

export async function POST(req: Request) {
  try {
    const { to, text } = await req.json();
    if (!to || !text) {
      return NextResponse.json({ ok: false, error: 'Missing "to" or "text"' }, { status: 400 });
    }

    const apiKey = process.env.SMSMODE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'SMSMODE_API_KEY manquante' }, { status: 500 });
    }

    const toE164 = toE164FR(String(to));

    const res = await fetch('https://rest.smsmode.com/sms/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        recipient: { to: toE164 },         // ✅ numéro normalisé (ex: +336...)
        body: { text: String(text) },      // ✅ message dynamique
        // sender: { from: "MonApp" },     // (optionnel) seulement si autorisé
      }),
      cache: 'no-store',
    });

    const raw = await res.text();
    console.log('smsmode raw:', res.status, raw);

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: raw }, { status: res.status });
    }
    const data = raw ? JSON.parse(raw) : null;

    // renvoie aussi l'URL de suivi/statut
    return NextResponse.json({
      ok: true,
      data: {
        messageId: data?.messageId,
        status: data?.status,
        href: data?.href,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
