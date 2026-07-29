/** Resolve `/public` paths against Vite `base` (needed for itch.io relative hosting). */
export function assetUrl(path: string): string {
  if (!path) return path;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const cleaned = path.startsWith('/') ? path.slice(1) : path;
  const mediaBase = import.meta.env.VITE_MEDIA_BASE as string | undefined;
  if (mediaBase && (cleaned.startsWith('faces/') || cleaned.startsWith('demos/'))) {
    return mediaBase.endsWith('/') ? `${mediaBase}${cleaned}` : `${mediaBase}/${cleaned}`;
  }
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? `${base}${cleaned}` : `${base}/${cleaned}`;
}
