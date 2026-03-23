"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  getDocs
} from "firebase/firestore";
import AdBanner from "@/components/AdBanner";

// ⭐ Inner component with hooks + search params
function SubmitPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session");

  const [movie1, setMovie1] = useState("");
  const [movie2, setMovie2] = useState("");
  const [loading, setLoading] = useState(false);

  const userKey = sessionStorage.getItem("userKey");

  // Listen for voting phase
  useEffect(() => {
    if (!sessionId) return;

    const unsub = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      const data = snap.data();
      if (data?.state === "voting") {
        router.push(`/vote?session=${sessionId}`);
      }
    });

    return () => unsub();
  }, [sessionId, router]);

  const submitMovies = async () => {
    if (!movie1) return alert("Enter at least one movie");

    setLoading(true);

    const sessionRef = doc(db, "sessions", sessionId);

    // Save this player's movies
    await setDoc(doc(db, `sessions/${sessionId}/movies`, userKey), {
      movies: [movie1, movie2].filter(Boolean),
    });

    // Count players
    const playersSnap = await getDocs(
      collection(db, `sessions/${sessionId}/players`)
    );
    const totalPlayers = playersSnap.size;

    // Count submissions
    const moviesSnap = await getDocs(
      collection(db, `sessions/${sessionId}/movies`)
    );
    const submittedPlayers = moviesSnap.size;

    // If all players submitted → move to voting
    if (submittedPlayers >= totalPlayers) {
      await updateDoc(sessionRef, { state: "voting" });
    }

    setLoading(false);
  };

  return (
    <>
      <AdBanner slot="1000000003" />

      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-xl">

          <h1 className="text-2xl font-bold mb-4">🎬 Submit Movies</h1>

          <input
            placeholder="Movie 1"
            className="w-full p-3 bg-gray-700 rounded mb-3"
            value={movie1}
            onChange={(e) => setMovie1(e.target.value)}
          />

          <input
            placeholder="Movie 2 (optional)"
            className="w-full p-3 bg-gray-700 rounded mb-6"
            value={movie2}
            onChange={(e) => setMovie2(e.target.value)}
          />

          <button
            onClick={submitMovies}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 p-3 rounded"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </main>
    </>
  );
}

// ⭐ Outer wrapper with Suspense (required for Next.js 16)
export default function SubmitPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-900" />}>
      <SubmitPageInner />
    </Suspense>
  );
}