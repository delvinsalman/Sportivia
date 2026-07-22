import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Play, X } from 'lucide-react';

interface GuideDemoTileProps {
  src: string;
  label: string;
  accent: string;
}

export function GuideDemoTile({ src, label, accent }: GuideDemoTileProps) {
  const previewRef = useRef<HTMLVideoElement>(null);
  const lightboxRef = useRef<HTMLVideoElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const startPreview = useCallback(() => {
    const video = previewRef.current;
    if (!video || failed) return;
    void video.play().catch(() => {});
  }, [failed]);

  const stopPreview = useCallback(() => {
    const video = previewRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }, []);

  useEffect(() => {
    if (hovered && !open) startPreview();
    else if (!open) stopPreview();
  }, [hovered, open, startPreview, stopPreview]);

  useEffect(() => {
    if (!open) return;
    const video = lightboxRef.current;
    if (video) {
      video.currentTime = 0;
      void video.play().catch(() => {});
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function openLightbox() {
    setOpen(true);
    stopPreview();
  }

  return (
    <>
      <button
        type="button"
        onClick={openLightbox}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={`Play demo: ${label}`}
        className="group relative w-full overflow-hidden rounded-2xl border-[2.5px] border-[#3f4147] bg-[#0c0d10]/80 text-left shadow-[0_3px_0_#1a1b1f] transition-all hover:border-[#5c5e66] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1a1b1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0d10]"
        style={{ aspectRatio: '16 / 10', ['--tw-ring-color' as string]: accent }}
      >
        {!failed ? (
          <video
            ref={previewRef}
            src={src}
            muted
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              ready ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadedData={() => setReady(true)}
            onError={() => setFailed(true)}
          />
        ) : null}

        {(!ready || failed) && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              background: `radial-gradient(ellipse 80% 70% at 30% 20%, ${accent}33 0%, transparent 55%), linear-gradient(145deg, #16181d 0%, #0c0d10 100%)`,
            }}
          >
            <div
              className={`absolute inset-3 grid grid-cols-3 gap-1.5 rounded-xl border border-white/5 bg-black/25 p-2 transition-opacity ${
                hovered ? 'opacity-100' : 'opacity-70'
              }`}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-md bg-white/5"
                  style={{
                    animation: hovered ? `guide-demo-pulse 1.2s ease-in-out ${i * 0.08}s infinite` : undefined,
                    background:
                      hovered && i % 3 === 0
                        ? `${accent}55`
                        : undefined,
                  }}
                />
              ))}
            </div>
            <div
              className={`absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[2.5px] border-white/25 transition-transform duration-300 ${
                hovered ? 'scale-110' : 'scale-100'
              }`}
              style={{ background: accent, color: '#fff', boxShadow: `0 3px 0 ${accent}88` }}
            >
              <Play className="h-4 w-4 fill-current translate-x-px" />
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-2.5 pb-2 pt-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
            Demo
          </span>
          <Maximize2 className="h-3.5 w-3.5 text-white/70 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div
              className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border-[2.5px] border-[#3f4147] bg-[#0c0d10] shadow-[0_8px_0_#1a1b1f]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3 sm:px-5">
                <p id={titleId} className="truncate text-sm font-extrabold text-[#f2f3f5]">
                  {label}
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e1f22] border-[2.5px] border-[#3f4147] text-[#b5bac1] hover:text-[#f2f3f5] hover:border-[#5c5e66] transition-colors"
                  aria-label="Close demo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative aspect-video bg-black">
                {!failed ? (
                  <video
                    ref={lightboxRef}
                    src={src}
                    muted
                    loop
                    playsInline
                    autoPlay
                    controls
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full border-[2.5px] border-white/25"
                      style={{ background: accent }}
                    >
                      <Play className="h-5 w-5 fill-white text-white translate-x-px" />
                    </div>
                    <p className="text-sm font-bold text-[#f2f3f5]">Demo coming soon</p>
                    <p className="max-w-sm text-xs text-[#949ba4] leading-relaxed">
                      Drop a looping clip at <span className="font-mono text-[#b5bac1]">{src}</span> to
                      show it here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
