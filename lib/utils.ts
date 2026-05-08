import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function fmt(n: number): string {
  return new Intl.NumberFormat("en").format(n);
}

export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function fmtDateTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function timeAgo(d: string | Date | null | undefined): string {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  const min  = Math.floor(diff / 60_000);
  if (min <   1) return "Just now";
  if (min <  60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr  <  24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day <  30) return `${day}d ago`;
  return fmtDate(d);
}
