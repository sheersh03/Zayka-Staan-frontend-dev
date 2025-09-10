'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label, Switch } from '@/components/ui/Forms';
import {
  AlertCircle, Eye, EyeOff, Loader2, Mail,
  ShieldCheck, Sparkles, Star, Flame, Utensils, Bell, Phone,
} from 'lucide-react';

// ✅ call your gateway helpers
import { notifyByEmail, notifyByWhatsApp } from '@/lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// Validation (login form only)
// ─────────────────────────────────────────────────────────────────────────────
const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

// simple client validators for notify inputs
const isValidEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
const isValidPhone = (v: string) => /^\+?[1-9]\d{7,14}$/.test(v); // e.g. +9198XXXXXXXX

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();

  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // notify state
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null);
  const [notifyErr, setNotifyErr] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [waLoading, setWaLoading] = useState(false);

  const {
    register, handleSubmit, formState: { errors, isSubmitting }, setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { remember: true },
  });

  // ── login submit (unchanged)
  const onSubmit = async (data: FormData) => {
    setServerError(null);
    await new Promise((r) => setTimeout(r, 600)); // mock
    if (data.password !== 'demo123') {
      setError('password', { message: 'Incorrect email or password.' });
      setServerError('Invalid credentials. Try password: demo123 (mock).');
      return;
    }
    router.replace(search.get('next') || '/');
  };

  // ── notify via Email
  async function onNotifyEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotifyMsg(null); setNotifyErr(null);
    setEmailLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('notifyEmail') || '').trim();

    try {
      if (!isValidEmail(email)) throw new Error('invalid-email');
      await notifyByEmail(email);
      setNotifyMsg(`🎉 You’re on the list via Email: ${email}`);
      (e.target as HTMLFormElement).reset();
    } catch {
      setNotifyErr('Please enter a valid email address.');
    } finally {
      setEmailLoading(false);
    }
  }

  // ── notify via WhatsApp
  async function onNotifyWhatsApp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotifyMsg(null); setNotifyErr(null);
    setWaLoading(true);

    const fd = new FormData(e.currentTarget);
    const phone = String(fd.get('notifyPhone') || '').trim();
    const consent = !!fd.get('waConsent');

    try {
      if (!consent) throw new Error('consent');
      if (!isValidPhone(phone)) throw new Error('invalid-phone');
      await notifyByWhatsApp(phone);
      setNotifyMsg(`🎉 You’ll get WhatsApp updates at ${phone}`);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setNotifyErr(
        err?.message === 'consent'
          ? 'Please agree to receive WhatsApp updates.'
          : 'Please enter a valid WhatsApp number with country code (e.g., +91XXXXXXXXXX).'
      );
    } finally {
      setWaLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* brand gradient + dotted pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-lime-300/50 to-emerald-400/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-emerald-300/40 to-lime-200/40 blur-3xl" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.08] [background:radial-gradient(1px_1px_at_12px_12px,#14532d_75%,transparent_75%)_0_0/28px_28px]" />

      {/* header */}
      <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="h-9 w-9 overflow-hidden rounded-2xl bg-white shadow ring-1 ring-emerald-300/60 grid place-items-center">
                <Image src="/LunchbuddyInitial2-removebg-preview.png" alt="LunchBuddy logo" width={28} height={28} priority />
              </div>
            </motion.div>
            <div className="truncate">
              <div className="text-lg font-semibold tracking-tight truncate">LunchBuddy</div>
              <div className="text-xs text-slate-500 truncate">Smart lunchboxes for happy kids</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" className="gap-2"><Utensils className="h-4 w-4" /> Menu</Button>
            <Button className="gap-2"><Sparkles className="h-4 w-4" /> Start Trial</Button>
          </div>
        </div>
      </header>

      {/* content grid */}
      <main className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* left: login */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="order-2 lg:order-1"
        >
          <Card className="overflow-hidden shadow-lg">
            <CardHeader>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-xs w-fit">
                <Sparkles className="h-3.5 w-3.5" /> welcome back
              </div>
              <CardTitle className="mt-3">Sign in to LunchBuddy</CardTitle>
              <CardDescription>Manage menus, deliveries, and subscriptions.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {serverError && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <div className="text-sm">{serverError}</div>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="email" type="email" placeholder="you@school.edu" className="pl-9" {...register('email')} aria-invalid={!!errors.email} />
                  </div>
                  {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" {...register('password')} aria-invalid={!!errors.password} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPw((s) => !s)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-xs text-rose-600">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Switch id="remember" defaultChecked {...register('remember')} />
                    <Label htmlFor="remember">Remember me</Label>
                  </div>
                  <Button variant="ghost" className="text-sm px-2">Forgot password?</Button>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isSubmitting} aria-label="Sign in">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-slate-500">or continue with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full">Google</Button>
                  <Button variant="outline" className="w-full">Apple</Button>
                </div>
              </form>
            </CardContent>

            <CardFooter>
              New here? <a href="/signup" className="ml-1 underline">Create account</a>
            </CardFooter>
          </Card>
        </motion.section>

        {/* right: hero + coming soon (responsive) */}
        <motion.aside
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="order-1 lg:order-2"
        >
          <Card className="relative overflow-hidden border-emerald-200/70">
            {/* hero logo large */}
            <div className="p-6 pb-0 flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0 rounded-2xl ring-1 ring-emerald-300/60 bg-white shadow">
                <Image src="/LunchbuddyInitial2-removebg-preview.png" alt="LunchBuddy Logo" fill sizes="96px" className="object-contain p-3" priority />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold truncate">LunchBuddy Hustle</h2>
                <p className="text-sm text-slate-600 truncate">Perks, drops and parent-powered goodies.</p>
              </div>
            </div>

            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Tile icon={<Star className="h-4 w-4" />} title="Early-bird Menus">First dibs on new seasonal menus & tasting boxes.</Tile>
                <Tile icon={<Flame className="h-4 w-4" />} title="Spice Points">Earn points for feedback & referrals. Redeem for treats.</Tile>
                <Tile icon={<Utensils className="h-4 w-4" />} title="Chef Collabs">Limited-run specials for school events.</Tile>
                <Tile icon={<Bell className="h-4 w-4" />} title="Drops & Alerts">Be the first to know when Hustle goes live.</Tile>
              </div>

              {/* Email notify */}
              <form onSubmit={onNotifyEmail} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="notifyEmail">Get updates via Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="notifyEmail" name="notifyEmail" placeholder="you@school.edu" className="pl-9" />
                  </div>
                </div>
                <Button type="submit" className="gap-2" disabled={emailLoading}>
                  {emailLoading ? 'Adding…' : <> <Sparkles className="h-4 w-4" /> Notify me</>}
                </Button>
              </form>

              {/* WhatsApp notify */}
              <form onSubmit={onNotifyWhatsApp} className="grid gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="notifyPhone">Or via WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="notifyPhone"
                      name="notifyPhone"
                      placeholder="+91 98XXXXXXXX"
                      className="pl-9"
                      inputMode="tel"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" name="waConsent" className="h-3.5 w-3.5" />
                  I agree to receive WhatsApp updates about LunchBuddy launches & offers.
                </label>
                <div>
                  <Button type="submit" className="gap-2 w-full sm:w-auto" disabled={waLoading}>
                    {waLoading ? 'Opting in…' : <> <Sparkles className="h-4 w-4" /> Opt-in on WhatsApp</>}
                  </Button>
                </div>
              </form>

              {/* unified feedback messages */}
              {notifyMsg && <p className="text-xs text-emerald-700">{notifyMsg}</p>}
              {notifyErr && <p className="text-xs text-rose-600">{notifyErr}</p>}

              <div className="rounded-xl bg-white/60 backdrop-blur p-3 text-xs text-slate-600">
                Psst… sign in and keep those lunchboxes happy while we prep the Hustle launch. 🥗
              </div>
            </CardContent>
          </Card>
        </motion.aside>
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
