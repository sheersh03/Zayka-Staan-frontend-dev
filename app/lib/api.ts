export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

async function api(path: string, init?: RequestInit) {
  const headers: any = { "Content-Type":"application/json", ...(init?.headers||{}) };
  if (API_KEY) headers["X-Api-Key"] = API_KEY;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const getChildren = () => api(`/children`);
export const getMenus = (from: string, to: string) => api(`/menus?from=${from}&to=${to}`);
export const getSubs = (childId: number) => api(`/subscriptions?childId=${childId}`);
export const changePlan = (body: any) => api(`/subscriptions`, { method:"POST", body: JSON.stringify(body) });
export const getInvoices = (subscriptionId: number) => api(`/invoices?subscriptionId=${subscriptionId}`);
export const payInvoice = (id: number, method: string) => api(`/invoices/${id}/pay`, { method:"POST", body: JSON.stringify({ method }) });
export const toggleSelection = (body: any) => api(`/selections`, { method:"POST", body: JSON.stringify(body) });
export const getDeliveries = (date: string) => api(`/deliveries?date=${date}`);
export const markDelivered = (id: number) => api(`/deliveries/${id}/mark-delivered`, { method:"POST" });
export const sendFeedback = (body: any) => api(`/feedback`, { method:"POST", body: JSON.stringify(body) });
