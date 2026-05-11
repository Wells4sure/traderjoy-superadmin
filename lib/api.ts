const API_BASE = process.env.API_BASE_URL ?? "https://api.zambeziworks.com/api/v1";
const SA_KEY   = process.env.SUPER_ADMIN_PASSWORD ?? "";

const headers = () => ({
  "Content-Type": "application/json",
  "x-super-admin-key": SA_KEY,
});

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/super-admin/analytics`, {
    headers: headers(),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export async function fetchBusinessDetails(id: string | number) {
  const res = await fetch(`${API_BASE}/super-admin/business/${id}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch business");
  return res.json();
}

export async function fetchAddons() {
  const res = await fetch(`${API_BASE}/super-admin/addons`, {
    headers: headers(),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch addons");
  return res.json();
}

async function apiCall(method: string, path: string, body?: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: headers(),
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? "Request failed");
  return json;
}

export const updateUser = (id: number, body: object) =>
  apiCall("PATCH", `/super-admin/users/${id}`, body);

export const resetUserPassword = (id: number) =>
  apiCall("POST", `/super-admin/users/${id}/reset-password`);

export const updateBusiness = (id: number, body: object) =>
  apiCall("PATCH", `/super-admin/businesses/${id}`, body);

export const addSubscription = (bizId: number, body: object) =>
  apiCall("POST", `/super-admin/businesses/${bizId}/subscriptions`, body);

export const updateSubscription = (bizId: number, subId: number, body: object) =>
  apiCall("PATCH", `/super-admin/businesses/${bizId}/subscriptions/${subId}`, body);

export const removeSubscription = (bizId: number, subId: number) =>
  apiCall("DELETE", `/super-admin/businesses/${bizId}/subscriptions/${subId}`);
