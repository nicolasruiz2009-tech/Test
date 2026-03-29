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
}

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

// ── Add Note Bottom Sheet ─────────────────────────────────────────────────────

interface AddSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (text: string, color: NoteColor) => void;
}

function AddSheet({ open, onClose, onAdd }: AddSheetProps) {
  const [text, setText]           = useState("");
  const [color, setColor]         = useState<NoteColor>("default");
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk]     = useState(false);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef  = useRef<any>(null);
  const committedRef    = useRef("");      // text confirmed across sessions
  const lastChunkRef    = useRef("");      // latest transcript in current session
  const manualStopRef   = useRef(false);  // true = user tapped Stop

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

  function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed, color);
    onClose();
  }

  return (
    <>
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
          {/* Title + mic button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">New Note</h2>

            {voiceOk && (
              <button
                onClick={toggleListening}
                aria-label={listening ? "Stop dictation" : "Dictate note"}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${listening
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
              >
                {/* Pulse ring when active */}
                {listening && (
                  <span className="absolute inset-0 rounded-xl bg-rose-500 animate-ping opacity-25" />
                )}
                <MicIcon active={listening} />
                <span className="relative">{listening ? "Écoute…" : "Dicter"}</span>
              </button>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={listening ? "Parle, j'écoute…" : "Écris quelque chose…"}
            rows={4}
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
              disabled={!text.trim()}
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

  function addNote(text: string, color: NoteColor) {
    const note: Note = {
      id: uid(),
      text,
      done: false,
      color,
      createdAt: Date.now(),
      pinned: false,
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
