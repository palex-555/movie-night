"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import {
  doc,
  onSnapshot,
  collection,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import confetti from "canvas-confetti";
import AdBanner from "@/components/AdBanner"; // ⭐ ADDED IMPORT

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [winner, setWinner] = useState(null);
  const [poster, setPoster] = useState(null);

  // ⭐ Load winner + poster + confetti
  useEffect(() => {
    if (!sessionId) return;

    const unsub = onSnapshot(doc(db, "sessions", sessionId), async (snap) => {
      const data = snap.data();
      if (data?.winner) {
        setWinner(data.winner);

        // Fetch poster
        const res = await fetch(
          `/api/poster?title=${encodeURIComponent(data.winner)}`
        );
        const json = await res.json();
        setPoster(json.poster);

        // Fire confetti
        confetti({
          particleCount: 200,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    });

    return () => unsub();
  }, [sessionId]);

  // ⭐ Auto-cleanup after 2 minutes + return home
  useEffect(() => {
    if (!sessionId || !winner) return;

    const cleanup = async () => {
      // Wait 2 minutes
      await new Promise((res) => setTimeout(res, 120000));

      const deleteCollection = async (ref) => {
        const snap = await getDocs(ref);
        const deletions = snap.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deletions);
      };

      await deleteCollection(collection(db, `sessions/${sessionId}/movies`));
      await deleteCollection(collection(db, `sessions/${sessionId}/votes`));
      await deleteCollection(collection(db, `sessions/${sessionId}/players`));

      await deleteDoc(doc(db, "sessions", sessionId));

      // Return to home screen
      window.location.href = "/";
    };

    cleanup();
  }, [sessionId, winner]);

  if (!winner) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-2xl">Calculating winner…</p>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-10 rounded-xl w-full max-w-xl text-center shadow-xl flex flex-col items-center">

          <h1 className="text-4xl font-bold mb-8">🏆 Winner!</h1>

          <img
            src={poster}
            alt={winner}
            className="w-48 h-72 rounded-lg shadow-lg mb-6 object-cover"
          />

          <h2 className="text-3xl font-semibold">{winner}</h2>

          <p className="text-gray-300 mt-4">
            Returning to home screen in 2 minutes…
          </p>
        </div>
      </main>

      <AdBanner slot="1000000005" /> {/* ⭐ Correct placement */}
    </>
  );
}