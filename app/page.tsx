'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Flame, Utensils, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Label } from '@/components/ui/Forms';
import BlurVideoLoader from '@/components/branding/BlurVideoLoader';

export default function LandingPage() {
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // ---- Loader ready state: replace this with real data-ready condition if you have one
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Simulate minimal boot (API, fonts, etc.)
    const t = setTimeout(() => setReady(true), 800);
    return () => clearTimeout(t);
  }, []);

  async function onJoin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOkMsg(null); setErrMsg(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    try {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Invalid email');
      const res = await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error('Failed');
      setOkMsg('🎉 You’re on the list! We’ll email your invite.');
      (e.target as HTMLFormElement).reset();
    } catch {
      setErrMsg('Please enter a valid email.');
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Blurred video loader overlay */}
      <BlurVideoLoader
        isReady={ready}
        src="/lunchbuddy.mp4"
        minDurationMs={700}
        // poster="/lunchbuddy-poster.jpg"
      />

      {/* header */}
      <header className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/LunchbuddyInitial2-removebg-preview.png" alt="LunchBuddy" width={36} height={36} />
          <div>
            <div className="text-lg font-semibold">LunchBuddy</div>
            <div className="text-xs text-slate-500">Smart lunchboxes for happy kids</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" asChild><a href="#why">Why</a></Button>
          <Button asChild><a href="#waitlist"><Sparkles className="h-4 w-4" /> Get Early Access</a></Button>
        </div>
      </header>

      {/* hero */}
      <main className="mx-auto max-w-6xl px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-xs w-fit">
            <Sparkles className="h-3.5 w-3.5" /> Coming Soon
          </div>
          <h1 className="mt-3 text-4xl font-bold leading-tight">
            Healthy, happy lunchboxes <br /> <span className="text-emerald-600">on autopilot</span>.
          </h1>
          <p className="mt-3 text-slate-600 text-lg">
            Nutritionist menus, allergy-aware prep, and on-time delivery — built for busy parents & schools.
          </p>

          <form id="waitlist" onSubmit={onJoin} className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <div className="grid gap-1">
              <Label htmlFor="email">Join the waitlist</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="email" name="email" placeholder="you@school.edu" className="pl-9" />
              </div>
            </div>
            <Button type="submit" className="h-10 gap-2"><Sparkles className="h-4 w-4" /> Notify me</Button>
          </form>
          {okMsg && <p className="mt-2 text-sm text-emerald-700">{okMsg}</p>}
          {errMsg && <p className="mt-2 text-sm text-rose-600">{errMsg}</p>}
        </motion.div>

        <motion.div id="why" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Why LunchBuddy?</CardTitle>
              <CardDescription>What you get on launch</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Tile icon={<Star className="h-4 w-4" />} title="Founders Perks">Locked price for 12 months.</Tile>
              <Tile icon={<Flame className="h-4 w-4" />} title="Spice Points">Rewards for feedback & referrals.</Tile>
              <Tile icon={<Utensils className="h-4 w-4" />} title="Chef Collabs">Seasonal specials & tasting boxes.</Tile>
              <Tile icon={<ShieldCheck className="h-4 w-4" />} title="Allergy-Aware">Personalized labels & prep.</Tile>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function Tile({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-gradient-to-b from-white to-emerald-50/30 p-3">
      <div className="flex items-center gap-2 font-medium">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-100 text-emerald-800">{icon}</span>
        {title}
      </div>
      <p className="mt-1 text-xs text-slate-600">{children}</p>
    </div>
  );
}
