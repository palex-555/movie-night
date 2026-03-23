"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import AdBanner from "@/components/AdBanner"; // ⭐ ADDED IMPORT

export default function LobbyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session");
  const nameFromURL = searchParams.get("name");
  const isHost = searchParams.get("host") === "true";

  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);

  const userKey =
    typeof window !== "undefined"
      ? sessionStorage.getItem("userKey") ||
        (sessionStorage.setItem("userKey", crypto.randomUUID()),
        sessionStorage.getItem("userKey"))
      : null;

  // Redirect if no name
  useEffect(() => {
    if (!nameFromURL) router.push("/");
  }, [nameFromURL, router]);

  // Auto-join lobby
  useEffect(() => {
    if (!sessionId || !nameFromURL) return;

    const join = async () => {
      await setDoc(doc(db, `sessions/${sessionId}/players`, userKey), {
        name: nameFromURL,
        ready: false,
        joinedAt: serverTimestamp(),
      });
    };

    join();
  }, [sessionId, nameFromURL]);

  // Listen for players + countdown
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);

    const unsubSession = onSnapshot(sessionRef, (snap) => {
      const data = snap.data();
      if (!data) return;

      if (data.countdownStart) {
        const start = data.countdownStart.toMillis();
        const end = start + 15000;

        const interval = setInterval(() => {
          const now = Date.now();
          const remaining = Math.max(0, Math.floor((end - now) / 1000));
          setCountdown(remaining);

          if (remaining <= 0) {
            clearInterval(interval);
            router.push(`/submit?session=${sessionId}`);
          }
        }, 200);

        return () => clearInterval(interval);
      }
    });

    const unsubPlayers = onSnapshot(
      collection(db, `sessions/${sessionId}/players`),
      (snap) => {
        const list = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setPlayers(list);
      }
    );

    return () => {
      unsubSession();
      unsubPlayers();
    };
  }, [sessionId]);

  // Player clicks "I'm Ready"
  const toggleReady = async () => {
    await updateDoc(doc(db, `sessions/${sessionId}/players`, userKey), {
      ready: true,
    });
  };

  // Host starts countdown AND marks themselves ready
  const startCountdown = async () => {
    await updateDoc(doc(db, `sessions/${sessionId}/players`, userKey), {
      ready: true,
    });

    const allReady = players.every((p) => p.ready || p.id === userKey);

    if (!allReady) {
      alert("Not everyone is ready yet");
      return;
    }

    await updateDoc(doc(db, "sessions", sessionId), {
      countdownStart: serverTimestamp(),
    });
  };

  return (
    <>
      <AdBanner slot="1000000002" />

      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-xl">

          <h1 className="text-3xl font-bold mb-4 text-center">🎬 Lobby</h1>

          <div className="bg-gray-700 p-4 rounded text-xl font-mono text-center mb-6">
            Session Code: {sessionId}
          </div>

          <h2 className="text-xl font-semibold mb-3">Players</h2>

          <div className="bg-gray-700 rounded p-4 mb-6 max-h-48 overflow-y-auto">
            {players.map((p) => (
              <div
                key={p.id}
                className="p-2 bg-gray-600 rounded mb-2 text-white flex justify-between"
              >
                <span>{p.name}</span>
                <span className={p.ready ? "text-green-400" : "text-red-400"}>
                  {p.ready ? "Ready" : "Not Ready"}
                </span>
              </div>
            ))}
          </div>

          {countdown !== null && (
            <p className="text-center text-green-400 text-2xl mb-4">
              Starting in {countdown}…
            </p>
          )}

          {!isHost && (
            <button
              onClick={toggleReady}
              className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded"
            >
              I'm Ready
            </button>
          )}

          {isHost && (
            <button
              onClick={startCountdown}
              className="w-full bg-purple-500 hover:bg-purple-600 p-3 rounded mt-4"
            >
              Start Countdown
            </button>
          )}
        </div>
      </main>
    </>
  );
}