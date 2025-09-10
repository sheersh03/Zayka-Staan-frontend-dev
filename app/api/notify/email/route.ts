// app/api/notify/email/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // optional, fast & simple

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // basic validation
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // TODO: add your real persistence / ESP call here (e.g., Mailchimp, Sendgrid)
    // Example (no-op): console.log('Notify via Email:', email);
    // await saveToDB({ type: 'email', value: email });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
