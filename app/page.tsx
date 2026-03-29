"use client";

import { useState, useRef, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type NoteColor = "default" | "rose" | "amber" | "emerald" | "sky";

interface Note {
  id: string;
  text: string;
  done: boolean;
  color: NoteColor;
  createdAt: number;
  pinned: boolean;
  image?: string;
  imageFilter?: string;
  audio?: string;        // base64 audio data URL
  audioDuration?: number; // seconds
}

// ── Photo filters ────────────────────────────────────────────────────────────

const PHOTO_FILTERS = [
  { id: "none",    label: "Original", css: "none" },
  { id: "bw",      label: "N&B",      css: "grayscale(100%)" },
  { id: "sepia",   label: "Sépia",    css: "sepia(100%)" },
  { id: "matrix",  label: "Matrix",   css: "hue-rotate(90deg) saturate(3) brightness(0.75)" },
  { id: "robot",   label: "Robot",    css: "hue-rotate(195deg) saturate(4) contrast(1.4) brightness(0.85)" },
  { id: "neon",    label: "Néon",     css: "contrast(2) saturate(4) brightness(1.1)" },
  { id: "vintage", label: "Vintage",  css: "sepia(40%) contrast(1.1) brightness(1.1) saturate(1.4)" },
] as const;

type FilterId = typeof PHOTO_FILTERS[number]["id"];

// ── Constants ────────────────────────────────────────────────────────────────

const COLOR_OPTIONS: {
  value: NoteColor;
  label: string;
  ring: string;
  dot: string;
}[] = [
  { value: "default", label: "Indigo",  ring: "ring-indigo-400",   dot: "bg-indigo-400" },
  { value: "rose",    label: "Rose",    ring: "ring-rose-400",     dot: "bg-rose-400" },
  { value: "amber",   label: "Amber",   ring: "ring-amber-400",    dot: "bg-amber-400" },
  { value: "emerald", label: "Green",   ring: "ring-emerald-400",  dot: "bg-emerald-400" },
  { value: "sky",     label: "Sky",     ring: "ring-sky-400",      dot: "bg-sky-400" },
];

const COLOR_CARD_BG: Record<NoteColor, string> = {
  default: "bg-white dark:bg-slate-800",
  rose:    "bg-rose-50/80 dark:bg-rose-950/40",
  amber:   "bg-amber-50/80 dark:bg-amber-950/40",
  emerald: "bg-emerald-50/80 dark:bg-emerald-950/40",
  sky:     "bg-sky-50/80 dark:bg-sky-950/40",
};

const COLOR_DOT: Record<NoteColor, string> = {
  default: "bg-indigo-400",
  rose:    "bg-rose-400",
  amber:   "bg-amber-400",
  emerald: "bg-emerald-400",
  sky:     "bg-sky-400",
};

const SAMPLE_NOTES: Note[] = [
  {
    id: "s1",
    text: "Welcome to MobileNotes! Tap the + button to add a new note.",
    done: false,
    color: "default",
    createdAt: Date.now() - 300_000,
    pinned: true,
  },
  {
    id: "s2",
    text: "Buy groceries: milk, eggs, bread, coffee",
    done: false,
    color: "amber",
    createdAt: Date.now() - 200_000,
    pinned: false,
  },
  {
    id: "s3",
    text: "Read 20 pages of that book",
    done: true,
    color: "emerald",
    createdAt: Date.now() - 100_000,
    pinned: false,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function fmtDate(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="3 6 5 6 21 6" strokeLinecap="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}

function PinIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 4.5l-8 8 2 2 8-8M9 15l-5 5M12 3l9 9-4 1-6-6 1-4z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function StopRecIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="2" width="6" height="12" rx="3" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" />
    </svg>
  );
}

function NotePageIcon() {
  return (
    <svg className="w-10 h-10 text-indigo-300 dark:text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path strokeLinecap="round" d="M8 8h8M8 12h5" />
    </svg>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
        <NotePageIcon />
      </div>
      <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No notes here</p>
      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
        Tap <span className="font-bold">+</span> below to create your first note.
      </p>
    </div>
  );
}

// ── Filter Tabs ───────────────────────────────────────────────────────────────

type Filter = "all" | "active" | "done";

interface FilterTabsProps {
  active: Filter;
  onChange: (f: Filter) => void;
  counts: Record<Filter, number>;
}

function FilterTabs({ active, onChange, counts }: FilterTabsProps) {
  const tabs: { id: Filter; label: string }[] = [
    { id: "all",    label: "All" },
    { id: "active", label: "Active" },
    { id: "done",   label: "Done" },
  ];

  return (
    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150
            ${active === t.id
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
        >
          {t.label}
          <span
            className={`ml-1 rounded-full px-1.5 py-px text-[10px]
              ${active === t.id
                ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400"}`}
          >
            {counts[t.id]}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Note Card ────────────────────────────────────────────────────────────────

interface NoteCardProps {
  note: Note;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  isNew?: boolean;
}

function NoteCard({ note, onToggle, onDelete, onPin, isNew }: NoteCardProps) {
  const [expanded, setExpanded]   = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [popping, setPopping]     = useState(false);
  const [lightbox, setLightbox]   = useState(false);
  const [swipeX, setSwipeX]       = useState(0);
  const touchStartX               = useRef(0);
  const touchStartY               = useRef(0);
  const isDragging                = useRef(false);

  // ── Swipe handlers ──────────────────────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current  = e.touches[0].clientX;
    touchStartY.current  = e.touches[0].clientY;
    isDragging.current   = false;
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    // Ignore if mostly vertical scroll
    if (dy > Math.abs(dx) || dy > 12) return;
    if (dx < -8) {
      isDragging.current = true;
      setSwipeX(Math.max(dx, -220));
    }
  }

  function handleTouchEnd() {
    if (swipeX < -80) {
      // Fly off screen then remove
      setDeleting(true);
      setSwipeX(-420);
      setTimeout(() => onDelete(note.id), 300);
    } else {
      setSwipeX(0); // snap back
    }
    isDragging.current = false;
  }

  // ── Toggle with pop animation ────────────────────────────────────────────
  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setPopping(true);
    setTimeout(() => setPopping(false), 350);
    onToggle(note.id);
  }

  function handleCardClick() {
    if (!isDragging.current) setExpanded((v) => !v);
  }

  const isMoving      = swipeX !== 0 && !deleting;
  const deleteReveal  = Math.min(Math.abs(swipeX) / 80, 1);

  return (
    <div
      className="relative"
      style={{
        animation: isNew ? "noteEnter 0.38s cubic-bezier(0.34,1.56,0.64,1) both" : undefined,
      }}
    >
      {/* Red delete background — revealed as card slides left */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl bg-rose-500 flex items-center justify-end pr-5"
        style={{ opacity: deleteReveal }}
      >
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="3 6 5 6 21 6" strokeLinecap="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
      </div>

      {/* Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`note-card cursor-pointer select-none relative z-10 ${COLOR_CARD_BG[note.color]}`}
        style={{
          transform:  `translateX(${swipeX}px)`,
          opacity:    deleting ? 0 : 1,
          transition: isMoving
            ? "none"
            : "transform 0.32s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease",
          touchAction: "pan-y",
        }}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            aria-label={note.done ? "Mark undone" : "Mark done"}
            onClick={handleToggle}
            className={`custom-checkbox mt-0.5 flex-shrink-0 ${note.done ? "checked" : ""}`}
            style={{ animation: popping ? "checkPop 0.35s ease both" : undefined }}
          >
            {note.done && <CheckIcon />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm leading-relaxed break-words transition-all duration-300 ${
                note.done ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-100"
              }`}
            >
              {note.text}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${COLOR_DOT[note.color]}`} />
              <span className="text-xs text-slate-400 dark:text-slate-500">{fmtDate(note.createdAt)}</span>
              {note.pinned && (
                <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">pinned</span>
              )}
            </div>
          </div>
        </div>

        {/* Audio player */}
        {note.audio && (
          <AudioPlayer url={note.audio} duration={note.audioDuration ?? 0} />
        )}

        {/* Photo — tap to open lightbox */}
        {note.image && (
          <div
            className="mt-3 rounded-xl overflow-hidden cursor-zoom-in active:opacity-80 transition-opacity"
            onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
          >
            <img
              src={note.image}
              alt="note photo"
              className="w-full max-h-52 object-cover"
              style={{ filter: note.imageFilter }}
            />
          </div>
        )}

        {/* Lightbox */}
        {lightbox && note.image && (
          <PhotoLightbox
            src={note.image}
            filter={note.imageFilter}
            onClose={() => setLightbox(false)}
          />
        )}

        {/* Action row — shown on tap */}
        {expanded && (
          <div
            className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label={note.pinned ? "Unpin" : "Pin"}
              onClick={() => onPin(note.id)}
              className={`btn-icon w-auto rounded-lg px-2 gap-1 text-xs ${
                note.pinned ? "text-indigo-500 dark:text-indigo-400" : ""
              }`}
            >
              <PinIcon filled={note.pinned} />
              {note.pinned ? "Unpin" : "Pin"}
            </button>

            <button
              aria-label="Delete note"
              onClick={() => onDelete(note.id)}
              className="btn-icon w-auto rounded-lg px-2 gap-1 text-xs text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
            >
              <TrashIcon />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Audio Player ─────────────────────────────────────────────────────────────

// Fake-but-realistic waveform heights so every note looks unique
const WAVE = [4,7,12,8,14,10,6,15,9,13,5,11,8,14,7,10,13,6,9,12,7,11,5,8,13];

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function AudioPlayer({ url, duration }: { url: string; duration: number }) {
  const [playing, setPlaying]     = useState(false);
  const [current, setCurrent]     = useState(0);
  const [realDur, setRealDur]     = useState(duration);
  const audioRef                  = useRef<HTMLAudioElement>(null);

  const progress = realDur > 0 ? current / realDur : 0;

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    playing ? a.pause() : a.play();
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current;
    if (!a || !realDur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    a.currentTime = ratio * realDur;
  }

  return (
    <div
      className="flex items-center gap-3 mt-3 bg-slate-100 dark:bg-slate-700/60 rounded-2xl px-3 py-2.5"
      onClick={(e) => e.stopPropagation()}
    >
      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrent(0); }}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setRealDur(audioRef.current?.duration ?? duration)}
      />

      {/* Play / Pause */}
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow active:scale-90 transition"
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>

      {/* Waveform + seek */}
      <div
        className="flex-1 flex items-center gap-px cursor-pointer h-8"
        onClick={handleSeek}
        role="slider"
        aria-label="Seek"
      >
        {WAVE.map((h, i) => {
          const isPlayed = i / WAVE.length < progress;
          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-colors duration-150 ${
                isPlayed ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-500"
              }`}
              style={{
                height: `${h}px`,
                animation: playing ? `barPulse ${0.4 + (i % 4) * 0.12}s ease-in-out ${(i % 5) * 0.06}s infinite alternate` : undefined,
                transformOrigin: "center",
              }}
            />
          );
        })}
      </div>

      {/* Time */}
      <span className="text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400 flex-shrink-0 w-8 text-right">
        {playing ? fmtTime(current) : fmtTime(realDur)}
      </span>
    </div>
  );
}

// ── Photo Lightbox ────────────────────────────────────────────────────────────

function PhotoLightbox({ src, filter, onClose }: { src: string; filter?: string; onClose: () => void }) {
  // Close on Escape key (desktop)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      style={{ animation: "fadeIn 0.2s ease both" }}
    >
      <img
        src={src}
        alt="full photo"
        className="max-w-full max-h-full object-contain"
        style={{ filter, animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}
        onClick={(e) => e.stopPropagation()}
      />
      {/* Close hint */}
      <span className="absolute top-5 right-5 text-white/50 text-sm">Tap pour fermer</span>
    </div>
  );
}

// ── Photo Editor ─────────────────────────────────────────────────────────────

interface PhotoEditorProps {
  src: string;
  onConfirm: (url: string, filterCss?: string) => void;
  onCancel: () => void;
}

function PhotoEditor({ src, onConfirm, onCancel }: PhotoEditorProps) {
  const [filterId, setFilterId] = useState<FilterId>("none");
  const imgRef = useRef<HTMLImageElement>(null);

  const filterCss = PHOTO_FILTERS.find((f) => f.id === filterId)?.css ?? "none";

  function applyAndConfirm() {
    const img = imgRef.current;
    if (!img) return;

    // Resize to max 900px and compress, no canvas filter (unreliable on iOS Safari)
    const MAX = 900;
    const scale = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1);
    const w = Math.round(img.naturalWidth  * scale);
    const h = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);

    // Pass filter CSS separately — applied via CSS at display time (works on all Safari versions)
    onConfirm(canvas.toDataURL("image/jpeg", 0.75), filterCss === "none" ? undefined : filterCss);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-black/70 backdrop-blur-sm">
        <button
          onClick={onCancel}
          className="text-white/70 text-sm font-medium active:opacity-50 transition"
        >
          Annuler
        </button>
        <h3 className="text-white text-sm font-semibold">Choisir un filtre</h3>
        <button
          onClick={applyAndConfirm}
          className="text-indigo-400 text-sm font-bold active:opacity-50 transition"
        >
          Utiliser
        </button>
      </div>

      {/* Image preview with selected filter */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <img
          ref={imgRef}
          src={src}
          alt="preview"
          className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
          style={{ filter: filterCss === "none" ? undefined : filterCss }}
          crossOrigin="anonymous"
        />
      </div>

      {/* Filter strip */}
      <div className="bg-black/70 backdrop-blur-sm px-4 pt-4 pb-10">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          {PHOTO_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterId(f.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all duration-150 ${
                filterId === f.id ? "scale-105" : "opacity-55 hover:opacity-80"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  filterId === f.id ? "border-indigo-400 shadow-lg shadow-indigo-500/40" : "border-transparent"
                }`}
              >
                <img
                  src={src}
                  alt={f.label}
                  className="w-full h-full object-cover"
                  style={{ filter: f.css === "none" ? undefined : f.css }}
                />
              </div>
              <span className={`text-[11px] font-medium ${filterId === f.id ? "text-indigo-400" : "text-white/60"}`}>
                {f.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Add Note Bottom Sheet ─────────────────────────────────────────────────────

interface AddSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (text: string, color: NoteColor, image?: string, imageFilter?: string, audio?: string, audioDuration?: number) => void;
}

function AddSheet({ open, onClose, onAdd }: AddSheetProps) {
  const [text, setText]               = useState("");
  const [color, setColor]             = useState<NoteColor>("default");
  const [listening, setListening]     = useState(false);
  const [voiceOk, setVoiceOk]         = useState(false);
  const [rawPhoto, setRawPhoto]       = useState<string | null>(null);
  const [savedPhoto, setSavedPhoto]   = useState<{ url: string; filter?: string } | null>(null);
  const [recording, setRecording]     = useState(false);
  const [recSecs, setRecSecs]         = useState(0);
  const [savedAudio, setSavedAudio]   = useState<{ url: string; duration: number } | null>(null);
  const textareaRef                   = useRef<HTMLTextAreaElement>(null);
  const fileInputRef                  = useRef<HTMLInputElement>(null);
  const mediaRecRef                   = useRef<MediaRecorder | null>(null);
  const audioChunksRef                = useRef<Blob[]>([]);
  const recTimerRef                   = useRef<ReturnType<typeof setInterval> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef  = useRef<any>(null);
  const committedRef    = useRef("");
  const lastChunkRef    = useRef("");
  const manualStopRef   = useRef(false);

  // Detect Web Speech API support once on mount
  useEffect(() => {
    setVoiceOk(
      typeof window !== "undefined" &&
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }, []);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => textareaRef.current?.focus(), 120);
      return () => clearTimeout(t);
    } else {
      setText("");
      setColor("default");
      setRawPhoto(null);
      setSavedPhoto(null);
      stopRecording();
      setSavedAudio(null);
      setRecSecs(0);
      stopListening();
      committedRef.current  = "";
      lastChunkRef.current  = "";
      manualStopRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function startListening() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const r = new SR();
    r.lang            = navigator.language || "fr-FR";
    r.continuous      = false;   // iOS ignores true — we handle restart ourselves
    r.interimResults  = true;
    r.maxAlternatives = 1;

    r.onstart = () => setListening(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      let chunk = "";
      for (let i = 0; i < e.results.length; i++) {
        chunk += e.results[i][0].transcript;
      }
      lastChunkRef.current = chunk;

      // Show committed text + live chunk
      const full = [committedRef.current, chunk].filter(Boolean).join(" ");
      setText(full.charAt(0).toUpperCase() + full.slice(1));
    };

    r.onend = () => {
      // Commit whatever was captured this session
      if (lastChunkRef.current) {
        committedRef.current = [committedRef.current, lastChunkRef.current]
          .filter(Boolean).join(" ");
        lastChunkRef.current = "";
      }

      if (!manualStopRef.current) {
        // Auto-restart after tiny gap so iOS doesn't complain
        setTimeout(() => {
          if (!manualStopRef.current) startListening();
          else setListening(false);
        }, 180);
      } else {
        setListening(false);
      }
    };

    r.onerror = (e: any) => {
      // "no-speech" is normal on iOS after silence — just restart
      if (e.error === "no-speech" && !manualStopRef.current) {
        setTimeout(() => { if (!manualStopRef.current) startListening(); }, 180);
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = r;
    r.start();
  }

  function stopListening() {
    manualStopRef.current = true;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function toggleListening() {
    if (listening) {
      stopListening();
    } else {
      // Seed committed text with whatever is already typed
      committedRef.current  = text.trim();
      lastChunkRef.current  = "";
      manualStopRef.current = false;
      startListening();
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg"]
        .find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType || "audio/mp4" });
        const reader = new FileReader();
        reader.onload = (ev) => {
          setSavedAudio({ url: ev.target?.result as string, duration: recSecs });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecRef.current = rec;
      rec.start(100);
      setRecording(true);
      setRecSecs(0);
      // auto-stop at 120s
      recTimerRef.current = setInterval(() => {
        setRecSecs((s) => {
          if (s + 1 >= 120) { stopRecording(); return s; }
          return s + 1;
        });
      }, 1000);
    } catch {
      // mic permission denied — silently ignore
    }
  }

  function stopRecording() {
    mediaRecRef.current?.stop();
    mediaRecRef.current = null;
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
    setRecording(false);
  }

  function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setRawPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed && !savedPhoto && !savedAudio) return;
    onAdd(trimmed, color, savedPhoto?.url, savedPhoto?.filter, savedAudio?.url, savedAudio?.duration);
    onClose();
  }

  return (
    <>
      {/* Hidden file input — opens camera on mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoSelected}
      />

      {/* Photo editor overlay */}
      {rawPhoto && (
        <PhotoEditor
          src={rawPhoto}
          onConfirm={(url, filterCss) => { setSavedPhoto({ url, filter: filterCss }); setRawPhoto(null); }}
          onCancel={() => setRawPhoto(null)}
        />
      )}

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New note"
        className={`fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto
          bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl
          transition-transform duration-300 ease-out
          ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="px-5 pb-8 pt-3">
          {/* Title + mic + camera buttons */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">New Note</h2>

            <div className="flex items-center gap-2">
              {/* Camera button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                aria-label="Take photo"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${savedPhoto
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
              >
                <CameraIcon />
                <span>{savedPhoto ? "Photo ✓" : "Photo"}</span>
              </button>

              {/* Audio record button */}
              <button
                onClick={recording ? stopRecording : startRecording}
                aria-label={recording ? "Stop recording" : "Record voice note"}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${recording
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40"
                    : savedAudio
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
              >
                {recording && <span className="absolute inset-0 rounded-xl bg-rose-500 animate-ping opacity-25" />}
                <span className="relative flex items-center gap-1.5">
                  {recording ? <StopRecIcon /> : <MicIcon active={false} />}
                  <span>{recording ? fmtTime(recSecs) : savedAudio ? "Audio ✓" : "Audio"}</span>
                </span>
              </button>

              {/* Mic button */}
              {voiceOk && (
                <button
                  onClick={toggleListening}
                  aria-label={listening ? "Stop dictation" : "Dictate note"}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${listening
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                >
                  {listening && (
                    <span className="absolute inset-0 rounded-xl bg-rose-500 animate-ping opacity-25" />
                  )}
                  <MicIcon active={listening} />
                  <span className="relative">{listening ? "Écoute…" : "Dicter"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Photo preview (thumbnail) */}
          {savedPhoto && (
            <div className="relative mb-4 rounded-2xl overflow-hidden animate-fade-in">
              <img
                src={savedPhoto.url}
                alt="note photo"
                className="w-full max-h-52 object-cover"
                style={{ filter: savedPhoto.filter }}
              />
              <button
                onClick={() => setSavedPhoto(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs font-bold hover:bg-black/80 transition"
                aria-label="Remove photo"
              >
                ✕
              </button>
              <button
                onClick={() => { setRawPhoto(savedPhoto.url); setSavedPhoto(null); }}
                className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-white text-xs font-medium hover:bg-black/80 transition"
                aria-label="Change filter"
              >
                Filtre
              </button>
            </div>
          )}

          {/* Audio preview */}
          {savedAudio && !recording && (
            <div className="mb-4 animate-fade-in">
              <AudioPlayer url={savedAudio.url} duration={savedAudio.duration} />
              <button
                onClick={() => setSavedAudio(null)}
                className="mt-1.5 text-xs text-rose-400 hover:text-rose-600 transition"
              >
                Supprimer l'audio
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={listening ? "Parle, j'écoute…" : "Écris quelque chose…"}
            rows={savedPhoto || savedAudio ? 2 : 4}
            className={`input-base resize-none mb-4 text-base leading-relaxed transition-all duration-300
              ${listening ? "border-rose-300 dark:border-rose-700 ring-2 ring-rose-200 dark:ring-rose-900/50" : ""}`}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleAdd();
              if (e.key === "Escape") onClose();
            }}
          />

          {/* Color picker */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Color</span>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                aria-label={c.label}
                onClick={() => setColor(c.value)}
                className={`w-7 h-7 rounded-full ${c.dot}
                  ring-offset-2 ring-offset-white dark:ring-offset-slate-900
                  transition-all duration-150
                  ${color === c.value ? `ring-2 ${c.ring} scale-110` : "hover:scale-105"}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold
                text-slate-600 dark:text-slate-300
                bg-slate-100 dark:bg-slate-800
                hover:bg-slate-200 dark:hover:bg-slate-700
                active:scale-95 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!text.trim() && !savedPhoto?.url && !savedAudio}
              className="btn-primary flex-1 py-3"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  // Initialise from localStorage on first render
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window === "undefined") return SAMPLE_NOTES;
    try {
      const raw = localStorage.getItem("mn-notes");
      return raw ? (JSON.parse(raw) as Note[]) : SAMPLE_NOTES;
    } catch {
      return SAMPLE_NOTES;
    }
  });

  const [filter, setFilter]       = useState<Filter>("all");
  const [search, setSearch]       = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dark, setDark]           = useState(false);
  const [newNoteId, setNewNoteId] = useState<string | null>(null);

  // Read dark-mode state already applied by the inline script in layout.tsx
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Persist notes to localStorage
  useEffect(() => {
    try { localStorage.setItem("mn-notes", JSON.stringify(notes)); } catch { /* ignore */ }
  }, [notes]);

  // ── Actions ──────────────────────────────────────────────────────────────

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("mn-theme", next ? "dark" : "light"); } catch { /* ignore */ }
  }

  function addNote(text: string, color: NoteColor, image?: string, imageFilter?: string, audio?: string, audioDuration?: number) {
    const note: Note = {
      id: uid(),
      text,
      done: false,
      color,
      createdAt: Date.now(),
      pinned: false,
      image,
      imageFilter,
      audio,
      audioDuration,
    };
    setNotes((prev) => [note, ...prev]);
    setNewNoteId(note.id);
    setTimeout(() => setNewNoteId(null), 450);
  }

  function toggleNote(id: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, done: !n.done } : n)));
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function pinNote(id: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  }

  function clearDone() {
    setNotes((prev) => prev.filter((n) => !n.done));
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const searched = search.trim()
    ? notes.filter((n) => n.text.toLowerCase().includes(search.toLowerCase()))
    : notes;

  const filtered = searched.filter((n) => {
    if (filter === "active") return !n.done;
    if (filter === "done")   return n.done;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt - a.createdAt;
  });

  const counts: Record<Filter, number> = {
    all:    searched.length,
    active: searched.filter((n) => !n.done).length,
    done:   searched.filter((n) => n.done).length,
  };

  const doneTotal = notes.filter((n) => n.done).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* ── Sticky gradient header ── */}
      <header className="header-gradient sticky top-0 z-20 shadow-lg">
        <div className="max-w-lg mx-auto px-4">

          {/* Title row */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">MobileNotes</h1>
              <p className="text-xs text-white/70 mt-0.5">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </p>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="btn-icon text-white/80 hover:text-white hover:bg-white/20 dark:hover:bg-white/10"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* Search bar */}
          <div className="relative pb-4">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
                bg-white/20 placeholder:text-white/60 text-white
                border border-white/20
                focus:outline-none focus:bg-white/30
                transition duration-150"
            />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-lg mx-auto px-4 pb-32">

        {/* Filter bar */}
        <div className="flex items-center gap-3 py-4">
          <div className="flex-1">
            <FilterTabs active={filter} onChange={setFilter} counts={counts} />
          </div>
          {doneTotal > 0 && (
            <button
              onClick={clearDone}
              className="text-xs font-medium text-rose-500 dark:text-rose-400 hover:underline whitespace-nowrap"
            >
              Clear {doneTotal} done
            </button>
          )}
        </div>

        {/* Stats strip */}
        <div className="flex gap-2 mb-4">
          {[
            { label: "Total",   value: notes.length,                          color: "text-slate-500 dark:text-slate-400" },
            { label: "Active",  value: notes.filter((n) => !n.done).length,   color: "text-indigo-500 dark:text-indigo-400" },
            { label: "Done",    value: doneTotal,                             color: "text-emerald-500 dark:text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="flex-1 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-center shadow-sm border border-slate-100 dark:border-slate-700">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Notes list */}
        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onToggle={toggleNote}
                onDelete={deleteNote}
                onPin={pinNote}
                isNew={note.id === newNoteId}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Floating Action Button ── */}
      <div className="fixed bottom-6 inset-x-0 flex justify-center z-20 pointer-events-none">
        <button
          onClick={() => setSheetOpen(true)}
          aria-label="Add note"
          className="pointer-events-auto btn-primary w-14 h-14 rounded-full shadow-xl shadow-indigo-500/30 dark:shadow-indigo-800/40"
        >
          <PlusIcon />
        </button>
      </div>

      {/* ── Add Note bottom sheet ── */}
      <AddSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={addNote}
      />
    </div>
  );
}
