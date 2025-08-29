
'use client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Display';
import { Checkbox, Input, Label, Switch, Textarea } from '@/components/ui/Forms';
import { Select, SelectItem } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { motion } from 'framer-motion';
import { ChefHat, CreditCard, Gift, LayoutDashboard, Percent, PieChart, School, ShoppingCart, Smile, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as api from './lib/api';

type PlanId = 'WEEKLY'|'MONTHLY';
type Cohort = 'KG'|'I-III'|'IV-VIII';
type Subscription = { id:number; childId:number; planId:PlanId; status:string; startDate:string; nextRenewal:string; price:number; currency:string };
type Child = { id:number; guardianId:string; name:string; cohort:Cohort; classLabel:string; dietaryPrefs:string[]; allergens:string[] };
type MenuItem = { id:number; date:string; cohort:Cohort; title:string; items:string; kcal:number; protein:number; carbs:number; fat:number; allergens:string; theme?:string };
type Selection = { id:number; childId:number; date:string; status:string; };
type Delivery = { id:number; childId:number; date:string; routeName:string; status:string; deliveredAt?:string };
type Invoice = { id:number; subscriptionId:number; periodStart:string; periodEnd:string; amount:number; status:string; method?:string };

const formatINR = (n:number)=> new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(n);
const addDays=(d:string,n:number)=>{const dt=new Date(d);dt.setDate(dt.getDate()+n);return dt.toISOString().slice(0,10)};

export default function App(){
  const [activeTab, setActiveTab] = useState('parent');
  const [children, setChildren] = useState<Child[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const todayISO = new Date().toISOString().slice(0,10);

  useEffect(()=>{
    (async()=>{
      const ch = await api.getChildren();
      setChildren(ch);
      if (ch[0]){
        const s = await api.getSubs(ch[0].id);
        setSubs(s);
        if (s[0]){
          const inv = await api.getInvoices(s[0].id);
          setInvoices(inv);
        }
      }
      const men = await api.getMenus(todayISO, addDays(todayISO, 7));
      setMenus(men);
      const del = await api.getDeliveries(todayISO);
      setDeliveries(del);
    })().catch(console.error);
  },[]);

  const child = children[0];
  const sub = subs[0];
  const upcoming = menus[0];

  const activeSubs = subs.filter(s=>s.status==='ACTIVE');
  const mrr = useMemo(()=> activeSubs.reduce((sum,s)=> sum + (s.planId==='WEEKLY'? 499*4 : 1799), 0),[activeSubs]);
  const avgRating = useMemo(()=> feedback.length? feedback.reduce((s,f)=>s+f.rating,0)/feedback.length : 0,[feedback]);
  const onTimeRate = useMemo(()=>{
    const delivered = deliveries.filter(d=>d.status==='DELIVERED').length;
    const total = deliveries.filter(d=>['DELIVERED','EXCEPTION'].includes(d.status)).length || 1;
    return Math.round((delivered/total)*100);
  },[deliveries]);

  const toggleSkipDay = async (childId:number, date:string)=>{
    await api.toggleSelection({ childId, date, status:'skip' });
    setSelections(prev=>{
      const exists = prev.find(s=>s.childId===childId && s.date===date);
      return exists ? prev.filter(s=> !(s.childId===childId && s.date===date)) : [...prev, { id: Date.now(), childId, date, status:'skip'} as any];
    });
  };

  const markDelivered = async (id:number)=>{
    const d = await api.markDelivered(id);
    setDeliveries(prev=> prev.map(x=> x.id===id? d: x));
  };

  const payInvoice = async (id:number, method:'UPI'|'CARD')=>{
    const inv = await api.payInvoice(id, method);
    setInvoices(prev=> prev.map(i=> i.id===id? inv: i));
  };

  const createOrChangeSubscription = async (childId:number, planId:PlanId, coupon?:{code:string; value:number})=>{
    const s = await api.changePlan({ childId, planId, couponCode: coupon?.code, useReferral: true });
    const list = await api.getSubs(childId);
    setSubs(list);
    const inv = await api.getInvoices(s.id);
    setInvoices(inv);
  };

  return (
    <div className='bg-gradient-to-b from-white to-slate-50 text-slate-900 min-h-screen'>
      <header className='sticky top-0 z-30 border-b bg-white/70 backdrop-blur'>
        <div className='mx-auto max-w-7xl px-4 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <img
            src="/LunchbuddyInitial2-removebg-preview.png"
            alt="LunchBuddy logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            loading="eager"
            decoding="async"
          />
            </motion.div>
            <div>
              <div className='text-lg font-semibold'>LunchBuddy</div>
              <div className='text-xs text-slate-500'>Healthy Happiness in Every Box</div>
            </div>
          </div>
          <div className='hidden md:flex items-center gap-2'>
            <Button variant='ghost' className='gap-2'><ChefHat className='h-4 w-4'/>Menu</Button>
            <Button variant='ghost' className='gap-2'><CreditCard className='h-4 w-4'/>Plans</Button>
            <Button className='gap-2'><Smile className='h-4 w-4'/>Start Trial</Button>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-7xl px-4 pb-24 mt-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid grid-cols-5 lg:grid-cols-6 gap-2'>
            <TabsTrigger value='parent' className='flex items-center gap-2'><LayoutDashboard className='h-4 w-4'/> Parent</TabsTrigger>
            <TabsTrigger value='menu' className='flex items-center gap-2'><ChefHat className='h-4 w-4'/> Menu</TabsTrigger>
            <TabsTrigger value='admin' className='flex items-center gap-2'><School className='h-4 w-4'/> Admin</TabsTrigger>
            <TabsTrigger value='delivery' className='flex items-center gap-2'><Truck className='h-4 w-4'/> Delivery</TabsTrigger>
            <TabsTrigger value='analytics' className='flex items-center gap-2'><PieChart className='h-4 w-4'/> Analytics</TabsTrigger>
            <TabsTrigger value='pricing' className='hidden lg:flex items-center gap-2'><CreditCard className='h-4 w-4'/> Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value='parent' className='mt-6'>
            {child && sub && upcoming ? (
              <ParentDashboard
                child={child}
                sub={sub}
                menus={menus}
                selections={selections}
                onToggleSkip={(date)=>toggleSkipDay(child.id, date)}
                onFeedback={async (f:any)=>{ await api.sendFeedback(f); setFeedback(p=>[f,...p]) }}
                invoices={invoices}
                onPay={payInvoice}
                onManagePlan={(plan, coupon)=> createOrChangeSubscription(child.id, plan, coupon)}
              />
            ) : <div className='text-sm text-slate-500'>Loading…</div>}
          </TabsContent>

          <TabsContent value='menu' className='mt-6'>
            {child ? <MenuExplorer menus={menus as any} child={child as any}/> : null}
          </TabsContent>

          <TabsContent value='admin' className='mt-6'>
            {child ? <AdminPanel date={new Date().toISOString().slice(0,10)} menus={menus as any} children={[child as any]} selections={selections as any}/> : null}
          </TabsContent>

          <TabsContent value='delivery' className='mt-6'>
            <DeliveryPanel deliveries={deliveries as any} onMarkDelivered={(id)=>markDelivered(id)} />
          </TabsContent>

          <TabsContent value='analytics' className='mt-6'>
            <AnalyticsPanel mrr={mrr} subs={activeSubs.length} avgRating={avgRating} onTimeRate={onTimeRate} invoices={invoices as any} />
          </TabsContent>

          <TabsContent value='pricing' className='mt-6'>
            <PricingShowcase />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ParentDashboard(props: {
  child: Child;
  sub: Subscription;
  menus: MenuItem[];
  selections: Selection[];
  invoices: Invoice[];
  onToggleSkip: (date:string)=>void;
  onFeedback: (f:any)=>void;
  onPay: (invoiceId:number, method:'UPI'|'CARD')=>void;
  onManagePlan: (planId:PlanId, coupon?:{code:string; value:number})=>void;
}){
  const { child, sub, menus, selections, invoices, onToggleSkip, onFeedback, onPay, onManagePlan } = props;
  const upcoming = menus[0];
  const skippedDates = new Set(selections.filter(s=>s.childId===child.id && s.status==='skip').map(s=>s.date));
  const [openPayment, setOpenPayment] = useState(false);
  const dueInvoice = invoices.find(i=>i.status==='DUE');

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      <Card className='lg:col-span-2'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'><LayoutDashboard className='h-5 w-5'/> Parent Dashboard</CardTitle>
          <CardDescription>Manage child profile, subscription, and daily selections.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex flex-wrap items-center gap-3'>
            <Badge className='text-xs'>{child.name} • {child.classLabel}</Badge>
            {child.dietaryPrefs?.map((p,i)=> <Badge key={i} className='bg-emerald-100 text-emerald-900 border-emerald-300'>{p}</Badge>)}
            {child.allergens?.length>0 && <Badge className='bg-rose-100 text-rose-900 border-rose-300'>Allergens: {child.allergens.join(', ')}</Badge>}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Next Meal • {upcoming?.date}</CardTitle>
                <CardDescription className='flex items-center gap-2'><ChefHat className='h-4 w-4'/> {upcoming?.title} {upcoming?.theme ? <span className='ml-2 text-xs rounded bg-lime-100 text-lime-900 px-2 py-0.5'>{upcoming.theme}</span> : null}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-sm text-slate-600'>Macros: {upcoming?.kcal} kcal • P {upcoming?.protein}g • C {upcoming?.carbs}g • F {upcoming?.fat}g</div>
                <div className='mt-2 flex flex-wrap gap-2 text-xs'>{upcoming?.allergens?.split(',').filter(Boolean).map((a:string,i:number)=> <Badge key={i}>{a}</Badge>)}</div>
              </CardContent>
              <CardFooter>
                <div className='flex items-center gap-3'>
                  <Checkbox checked={skippedDates.has(upcoming?.date||'')} onChange={()=> upcoming?.date && onToggleSkip(upcoming.date)} />
                  <Label>Skip this day</Label>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Subscription</CardTitle>
                <CardDescription>Status: <span className={sub.status==='ACTIVE' ? 'text-emerald-600 font-medium':'text-slate-600'}>{sub.status}</span></CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='text-sm'>Plan: {sub.planId}</div>
                <div className='text-sm'>Next renewal: {sub.nextRenewal}</div>
                <div className='text-sm'>Last amount: {formatINR(sub.price)}</div>
              </CardContent>
              <CardFooter className='flex gap-2'>
                <ManagePlan onConfirm={onManagePlan} current={sub.planId as PlanId} />
                {dueInvoice && (
                  <>
                    <Button className='gap-2' onClick={()=> setOpenPayment(true)}><CreditCard className='h-4 w-4'/> Pay {formatINR(dueInvoice.amount)}</Button>
                    <Dialog open={openPayment}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Pay Invoice</DialogTitle>
                          <DialogDescription>Complete payment for current cycle.</DialogDescription>
                        </DialogHeader>
                        <div className='p-4 space-y-3'>
                          <div><Label>Amount</Label><Input readOnly value={formatINR(dueInvoice.amount)} /></div>
                          <div className='flex gap-2'>
                            <Button onClick={()=>{onPay(dueInvoice.id,'UPI'); setOpenPayment(false)}}>Pay UPI</Button>
                            <Button variant='secondary' onClick={()=>{onPay(dueInvoice.id,'CARD'); setOpenPayment(false)}}>Pay Card</Button>
                          </div>
                        </div>
                        <DialogFooter><Button onClick={()=> setOpenPayment(false)}>Close</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </CardFooter>
            </Card>
          </div>

          <CalendarSkips menus={menus as any} skippedDates={skippedDates} onToggleSkip={onToggleSkip} />
          <FeedbackQuick childId={child.id} date={menus[0]?.date} onSubmit={onFeedback} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'><CreditCard className='h-5 w-5'/> Billing History</CardTitle>
          <CardDescription>Invoices & statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Invoice</TableHead><TableHead>Period</TableHead><TableHead className='text-right'>Amount</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map(i=> (
                <TableRow key={i.id}>
                  <TableCell>{i.id}</TableCell>
                  <TableCell>{i.periodStart} → {i.periodEnd}</TableCell>
                  <TableCell className='text-right'>{formatINR(i.amount)}</TableCell>
                  <TableCell><Badge className={i.status==='PAID'?'bg-emerald-100 text-emerald-900 border-emerald-300': i.status==='DUE'?'bg-amber-100 text-amber-900 border-amber-300':'bg-rose-100 text-rose-900 border-rose-300'}>{i.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ManagePlan({current, onConfirm}:{current:PlanId; onConfirm:(planId:PlanId, coupon?:{code:string; value:number})=>void}){
  const [plan, setPlan] = useState<PlanId>(current);
  const [code, setCode] = useState('');
  const [useReferral, setUseReferral] = useState(true);
  const planPrice = (p:PlanId)=> p==='WEEKLY'? 499 : 1799;
  const finalAmount = Math.max(0, planPrice(plan) - (code?100:0) - (useReferral?50:0));

  return (
    <div className='flex items-center gap-2'>
      <Select defaultValue={plan} onValueChange={(v)=> setPlan(v as PlanId)}>
        <SelectItem value='WEEKLY'>Weekly — {formatINR(499)}</SelectItem>
        <SelectItem value='MONTHLY'>Monthly — {formatINR(1799)}</SelectItem>
      </Select>
      <Input placeholder='Coupon (e.g., WELCOME100)' value={code} onChange={(e)=> setCode(e.target.value)} />
      <div className='flex items-center gap-2 text-sm'><Switch checked={useReferral} onChange={(v)=> setUseReferral(v)} /> Referral ₹50</div>
      <Button className='gap-2' onClick={()=> onConfirm(plan, code?{code, value:100}: undefined)}><Percent className='h-4 w-4'/> Pay {formatINR(finalAmount)}</Button>
    </div>
  );
}

function CalendarSkips({menus, skippedDates, onToggleSkip}:{menus:MenuItem[]; skippedDates:Set<string>; onToggleSkip:(date:string)=>void}){
  return (
    <Card>
      <CardHeader><CardTitle className='flex items-center gap-2'>Calendar</CardTitle><CardDescription>Select/skip upcoming days.</CardDescription></CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3'>
          {menus.map((m:any)=> (
            <div key={m.id} className={`rounded-2xl border p-4 ${skippedDates.has(m.date) ? 'opacity-60':''}`}>
              <div className='text-sm text-slate-500'>{m.date}</div>
              <div className='font-medium'>{m.title}</div>
              <div className='mt-2 flex items-center justify-between'>
                <div className='text-xs flex flex-wrap gap-1'>{m.allergens?.split(',').filter(Boolean).map((a:string,i:number)=> <Badge key={i}>{a}</Badge>)}</div>
                <Switch checked={skippedDates.has(m.date)} onChange={()=> onToggleSkip(m.date)} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackQuick({childId, date, onSubmit}:{childId:number; date:string; onSubmit:(f:any)=>void}){
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  return (
    <Card>
      <CardHeader><CardTitle className='flex items-center gap-2'>Rate Today’s Lunch</CardTitle><CardDescription>1‑tap feedback to improve tomorrow.</CardDescription></CardHeader>
      <CardContent className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-1'>
          {[1,2,3,4,5].map(r=> <Button key={r} variant={rating===r? 'default':'outline'} size='icon' onClick={()=> setRating(r)}><Smile className='h-4 w-4'/></Button>)}
        </div>
        <div className='flex-1'><Label>Comment</Label><Textarea placeholder='Any notes for our chef?' value={comment} onChange={(e)=> setComment(e.target.value)} /></div>
        <Button onClick={()=> onSubmit({ childId, date, rating, tags:'', comment })}>Submit</Button>
      </CardContent>
    </Card>
  );
}

function MenuExplorer({menus, child}:{menus:MenuItem[]; child:Child}){
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {menus.map((m:any)=> (
        <Card key={m.id}>
          <CardHeader>
            <CardTitle className='text-base flex items-center gap-2'><ChefHat className='h-4 w-4'/> {m.title}</CardTitle>
            <CardDescription>{m.date} • Cohort {m.cohort} {m.theme ? `• ${m.theme}` : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-sm text-slate-600'>Includes: {m.items}</div>
            <div className='mt-2 text-xs'>Macros: {m.kcal} kcal • P{m.protein} • C{m.carbs} • F{m.fat}</div>
            <div className='mt-2 flex flex-wrap gap-2'>{m.allergens?.split(',').filter(Boolean).map((a:string,i:number)=> <Badge key={i}>{a}</Badge>)}</div>
          </CardContent>
          <CardFooter><Button variant='secondary' className='gap-2'><Gift className='h-4 w-4'/> Add yogurt add‑on</Button></CardFooter>
        </Card>
      ))}
    </div>
  );
}

function AdminPanel({date:initialDate, menus, children, selections}:{date:string; menus:MenuItem[]; children:Child[]; selections:Selection[]}){
  const [date, setDate] = useState(initialDate);
  const menu = menus.find(m=>m.date===date) || menus[0];
  const total = useMemo(()=>{
    const skippedIds = new Set(selections.filter(s=> s.date===date && s.status==='skip').map(s=>s.childId));
    return children.filter(c=> !skippedIds.has(c.id)).length;
  },[children, selections, date]);

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      <Card className='lg:col-span-2'>
        <CardHeader><CardTitle className='flex items-center gap-2'>Kitchen Packlist</CardTitle><CardDescription>Totals and allergen warnings for the selected date.</CardDescription></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <div className='grid gap-2'><Label>Date</Label><Input type='date' value={date} onChange={(e)=> setDate(e.target.value)} /></div>
            <div className='grid gap-2'><Label>Menu Title</Label><Input readOnly value={menu?.title || '—'} /></div>
            <div className='grid gap-2'><Label>Total Boxes</Label><Input readOnly value={total} /></div>
          </div>
          <div className='rounded-xl border p-4'>
            <div className='font-medium mb-2'>Allergen Alerts</div>
            <div className='flex flex-wrap gap-2 text-xs'>{menu?.allergens?.split(',').filter(Boolean).map((a:string,i:number)=> <Badge key={i} className='bg-rose-100 text-rose-900 border-rose-300'>{a}</Badge>)}</div>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Child</TableHead><TableHead>Cohort</TableHead><TableHead>Class</TableHead><TableHead>Diet</TableHead><TableHead>Allergens</TableHead></TableRow></TableHeader>
            <TableBody>
              {children.map(c=> (
                <TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell>{c.cohort}</TableCell><TableCell>{c.classLabel}</TableCell><TableCell>{(c.dietaryPrefs||[]).join(', ')}</TableCell><TableCell>{(c.allergens||[]).join(', ') || '—'}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className='flex items-center gap-2'>School Calendar</CardTitle><CardDescription>Add holidays to auto‑exclude billing.</CardDescription></CardHeader>
        <CardContent className='space-y-3'><div className='grid gap-2'><Label>Holiday (demo)</Label><Input type='date' defaultValue={addDays(new Date().toISOString().slice(0,10),3)} /></div><Button variant='secondary'>Add Holiday</Button><div className='text-xs text-slate-500'>In production, this syncs with the school’s official calendar.</div></CardContent>
      </Card>
    </div>
  );
}

function DeliveryPanel({deliveries, onMarkDelivered}:{deliveries:Delivery[]; onMarkDelivered:(id:number)=>void}){
  const routes = useMemo(()=>{
    const map = new Map<string, Delivery[]>();
    deliveries.forEach(d=>{ if(!map.has(d.routeName)) map.set(d.routeName, []); map.get(d.routeName)!.push(d as any); });
    return Array.from(map.entries());
  },[deliveries]);

  return (
    <div className='space-y-6'>
      {routes.map(([route, stops])=> (
        <Card key={route}>
          <CardHeader><CardTitle className='flex items-center gap-2'><Truck className='h-5 w-5'/> Route {route}</CardTitle><CardDescription>{stops.length} stops today</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>ChildId</TableHead><TableHead>Status</TableHead><TableHead className='text-right'>Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {stops.map((s:any)=> (
                  <TableRow key={s.id}>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.childId}</TableCell>
                    <TableCell><Badge className={s.status==='DELIVERED'?'bg-emerald-100 text-emerald-900 border-emerald-300': s.status==='EXCEPTION'?'bg-rose-100 text-rose-900 border-rose-300':'bg-amber-100 text-amber-900 border-amber-300'}>{s.status}</Badge></TableCell>
                    <TableCell className='text-right'><Button size='sm' onClick={()=> onMarkDelivered(s.id)} disabled={s.status==='DELIVERED'}>Mark Delivered</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnalyticsPanel({mrr, subs, avgRating, onTimeRate, invoices}:{mrr:number; subs:number; avgRating:number; onTimeRate:number; invoices:Invoice[]}){
  const due = invoices.filter(i=>i.status==='DUE').length;
  const paid = invoices.filter(i=>i.status==='PAID').length;
  const paidRate = Math.round((paid / (due+paid || 1))*100);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      <KpiCard title='MRR' value={formatINR(mrr)} subtitle='Monthly Recurring Revenue' />
      <KpiCard title='Active Subs' value={subs} subtitle='Children with active plans' />
      <KpiCard title='On‑time Delivery' value={`${onTimeRate}%`} subtitle='Delivered vs completed' />
      <KpiCard title='Avg Rating' value={avgRating? avgRating.toFixed(1): '—'} subtitle='Last 7 days' />

      <Card className='md:col-span-2 lg:col-span-4'>
        <CardHeader><CardTitle>Collections</CardTitle><CardDescription>Payment success & dues</CardDescription></CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='rounded-xl bg-slate-50 p-4'><div className='text-sm text-slate-600'>Payment Success</div><div className='text-2xl font-semibold'>{paidRate}%</div></div>
          <div className='rounded-xl bg-slate-50 p-4'><div className='text-sm text-slate-600'>Invoices Paid</div><div className='text-2xl font-semibold'>{paid}</div></div>
          <div className='rounded-xl bg-slate-50 p-4'><div className='text-sm text-slate-600'>Dues Outstanding</div><div className='text-2xl font-semibold'>{due}</div></div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({title, value, subtitle}:{title:string; value:string|number; subtitle?:string}){
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {subtitle && <p className='text-xs text-slate-500 mt-1'>{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function PricingShowcase(){
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {[{id:'WEEKLY',price:499,name:'Weekly (5 school days)'},{id:'MONTHLY',price:1799,name:'Monthly (20 school days)'}].map((p:any)=> (
        <Card key={p.id} className='relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-tr from-emerald-50 to-lime-50' />
          <CardHeader><CardTitle>{p.name}</CardTitle><CardDescription>Portion size: Medium</CardDescription></CardHeader>
          <CardContent>
            <div className='text-3xl font-semibold'>{formatINR(p.price)} <span className='text-sm font-normal text-slate-500'>per cycle</span></div>
            <ul className='mt-4 space-y-2 text-sm'>
              <li>✔ Nutritionist-designed menus</li>
              <li>✔ Allergy-aware prep & labels</li>
              <li>✔ Delivery before recess</li>
              <li>✔ 1-tap feedback</li>
            </ul>
          </CardContent>
          <CardFooter><Button className='gap-2'><ShoppingCart className='h-4 w-4'/> Choose {p.id==='WEEKLY'? 'Weekly':'Monthly'}</Button></CardFooter>
        </Card>
      ))}
    </div>
  );
}