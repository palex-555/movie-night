"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import AdBanner from "@/components/AdBanner"; // ⭐ ADDED IMPORT

// ⭐ Clean pill-style rating buttons
function RatingButtons({ value, onChange }) {
  const labels = [
    "⭐ 1 star",
    "⭐ 2 stars",
    "⭐ 3 stars",
    "⭐ 4 stars",
    "⭐ 5 stars"
  ];

  return (
    <div className="flex flex-col gap-2 mt-3">
      {labels.map((label, index) => {
        const num = index + 1;
        const selected = value === num;

        return (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`px-4 py-2 rounded-lg font-semibold transition text-left ${
              selected
                ? "bg-yellow-400 text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function VotePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session");

  // -----------------------------
  // ⭐ All hooks MUST be at top
  // -----------------------------
  const [movies, setMovies] = useState([]);
  const [ratings, setRatings] = useState({});
  const [posters, setPosters] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [userKey, setUserKey] = useState(null);

  // Load userKey safely
  useEffect(() => {
    let key = sessionStorage.getItem("userKey");

    if (!key) {
      key = crypto.randomUUID();
      sessionStorage.setItem("userKey", key);
    }

    setUserKey(key);
  }, []);

  // Load movies
  useEffect(() => {
    if (!sessionId) return;

    const unsub = onSnapshot(
      collection(db, `sessions/${sessionId}/movies`),
      (snap) => {
        const allMovies = [];
        snap.forEach((doc) => {
          const data = doc.data();
          data.movies.forEach((m) => allMovies.push(m));
        });
        setMovies(allMovies);
      }
    );

    return () => unsub();
  }, [sessionId]);

  // Fetch posters
  useEffect(() => {
    const loadPosters = async () => {
      const map = {};

      for (const movie of movies) {
        const res = await fetch(`/api/poster?title=${encodeURIComponent(movie)}`);
        const data = await res.json();
        map[movie] = data.poster;
      }

      setPosters(map);
    };

    if (movies.length > 0) loadPosters();
  }, [movies]);

  // Listen for winner
  useEffect(() => {
    if (!sessionId) return;

    const unsub = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      const data = snap.data();
      if (data?.state === "finished" && data?.winner) {
        router.push(`/results?session=${sessionId}`);
      }
    });

    return () => unsub();
  }, [sessionId]);

  // -----------------------------
  // ⭐ SAFE conditional return
  // -----------------------------
  if (!userKey) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading…</p>
      </main>
    );
  }

  if (waiting) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-xl text-center shadow-xl">
          <h1 className="text-3xl font-bold mb-4">🎬 Waiting...</h1>
          <p className="text-gray-300 text-lg">
            Waiting for everyone else to submit their votes
          </p>
        </div>
      </main>
    );
  }

  // -----------------------------
  // ⭐ Submit votes (WITH WEIGHTED LOGIC)
  // -----------------------------
  const submitVotes = async () => {
    setSubmitting(true);

    await setDoc(doc(db, `sessions/${sessionId}/votes`, userKey), {
      ratings,
    });

    setWaiting(true);

    const playersSnap = await getDocs(collection(db, `sessions/${sessionId}/players`));
    const totalPlayers = playersSnap.size;

    const votesSnap = await getDocs(collection(db, `sessions/${sessionId}/votes`));
    const totalVotes = votesSnap.size;

    if (totalVotes >= totalPlayers) {
      const allVotes = [];
      votesSnap.forEach((doc) => allVotes.push(doc.data().ratings));

      // ⭐ Build movie → owner map
      const movieOwners = {};
      const movieDocs = await getDocs(collection(db, `sessions/${sessionId}/movies`));

      movieDocs.forEach((doc) => {
        const owner = doc.id;
        const data = doc.data();
        data.movies.forEach((movie) => {
          movieOwners[movie] = owner;
        });
      });

      // ⭐ Weighted scoring
      const movieScores = {};

      allVotes.forEach((voteSet) => {
        Object.entries(voteSet).forEach(([movie, score]) => {
          if (!movieScores[movie]) movieScores[movie] = 0;

          const owner = movieOwners[movie];
          const isSelfVote = owner === userKey;

          const weight = isSelfVote ? 0.5 : 1.0;

          movieScores[movie] += score * weight;
        });
      });

      // ⭐ Determine winner
      let winner = null;
      let bestScore = -1;

      Object.entries(movieScores).forEach(([movie, total]) => {
        if (total > bestScore) {
          bestScore = total;
          winner = movie;
        }
      });

      // ⭐ Update session with winner
      await updateDoc(doc(db, "sessions", sessionId), {
        state: "finished",
        winner,
      });
    }
  };

  const setRating = (movie, value) => {
    setRatings((prev) => ({ ...prev, [movie]: value }));
  };

  // -----------------------------
  // ⭐ Main UI
  // -----------------------------
  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-10 rounded-xl w-full max-w-3xl shadow-xl">

          <h1 className="text-4xl font-bold mb-10 text-center">⭐ Rate the Movies</h1>

          <div className="grid grid-cols-1 gap-10">
            {movies.map((movie, i) => (
              <div
                key={i}
                className="flex gap-8 bg-gray-700 p-6 rounded-2xl shadow-xl items-center border border-gray-600"
              >
                <img
                  src={posters[movie]}
                  alt={movie}
                  className="w-32 h-48 rounded-lg object-cover shadow-md"
                />

                <div className="flex-1">
                  <p className="text-2xl font-semibold mb-4">{movie}</p>

                  <RatingButtons
                    value={ratings[movie] || 0}
                    onChange={(value) => setRating(movie, value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={submitVotes}
            disabled={submitting}
            className="w-full bg-green-500 hover:bg-green-600 p-4 rounded-xl text-xl font-semibold mt-12"
          >
            {submitting ? "Submitting..." : "Submit Votes"}
          </button>
        </div>
      </main>

      <AdBanner slot="1000000004" /> {/* ⭐ Correct placement */}
    </>
  );
}