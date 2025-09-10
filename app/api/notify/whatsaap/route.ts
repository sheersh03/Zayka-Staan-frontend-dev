// app/api/notify/whatsapp/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // optional

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    // very light validation: expects +countrycode + digits
    if (!phone || !/^\+?[1-9]\d{7,14}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
    }

    // TODO: add your real WhatsApp provider call here
    // (e.g., Twilio WhatsApp, Meta Cloud API, MessageBird, etc.)
    // Example (no-op): console.log('Notify via WhatsApp:', phone);
    // await saveToDB({ type: 'whatsapp', value: phone });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
