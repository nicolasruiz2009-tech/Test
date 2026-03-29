"use client";

import { useState } from "react";

interface Note {
  id: number;
  text: string;
  done: boolean;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: "Déployer l'app sur Vercel", done: false },
    { id: 2, text: "Pousser depuis le téléphone", done: false },
  ]);
  const [input, setInput] = useState("");

  const addNote = () => {
    if (!input.trim()) return;
    setNotes([...notes, { id: Date.now(), text: input.trim(), done: false }]);
    setInput("");
  };

  const toggleNote = (id: number) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, done: !n.done } : n)));
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-8 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">MobileNotes</h1>
        <p className="mt-1 text-violet-200 text-sm">
          {notes.filter((n) => !n.done).length} note(s) en attente
        </p>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Nouvelle note..."
            className="flex-1 rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={addNote}
            className="bg-violet-600 hover:bg-violet-500 active:bg-violet-700 rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
          >
            +
          </button>
        </div>

        {/* Notes list */}
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-4 border border-gray-700"
            >
              <button
                onClick={() => toggleNote(note.id)}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors ${
                  note.done
                    ? "bg-violet-500 border-violet-500"
                    : "border-gray-500"
                }`}
              />
              <span
                className={`flex-1 text-sm ${
                  note.done ? "line-through text-gray-500" : "text-gray-100"
                }`}
              >
                {note.text}
              </span>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        {notes.length === 0 && (
          <p className="text-center text-gray-600 mt-12 text-sm">
            Aucune note. Ajoutez-en une !
          </p>
        )}
      </div>
    </main>
  );
}
