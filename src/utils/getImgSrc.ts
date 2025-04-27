// src/utils/getImgSrc.ts
export function getImgSrc(raw: string): string {
  if (!raw) return '';
  const s = raw.trim();

  // ── Treat blob: and data: as already-ready-to-render URLs ──
  if (/^(blob:|data:)/.test(s)) {
    return s;
  }

  // ── Then your existing logic ──
  // 1. Absolute HTTP(S) URL → strip /api prefix
  if (/^https?:\/\//.test(s)) {
    const url = new URL(s);
    url.pathname = url.pathname.replace(/^\/api\/?/, '/');
    return url.toString();
  }

  // 2. Otherwise build off your upload base
  const base = (
    process.env.NEXT_PUBLIC_UPLOAD_BASE ||
    (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api(\/.*|$)/, '')
  ).replace(/\/$/, '');

  const path = s.replace(/^\/+/, '');
  return `${base}/${path}`;
}
