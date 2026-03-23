"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import AdBanner from "@/components/AdBanner";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");

  const startSession = async () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();

    await setDoc(doc(db, "sessions", sessionId), {
      state: "lobby",
      countdownStart: null,
    });

    router.push(
      `/lobby?session=${sessionId}&name=${encodeURIComponent(
        name
      )}&host=true`
    );
  };

  return (
    <>
      <AdBanner slot="1000000001" />

      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center">🎬 Movie Night</h1>

          <input
            placeholder="Your name"
            className="w-full p-3 bg-gray-700 rounded mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            onClick={startSession}
            className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded mb-4"
          >
            Start
          </button>

          <button
            onClick={() => router.push("/join")}
            className="w-full bg-gray-600 hover:bg-gray-700 p-3 rounded"
          >
            Join a Lobby
          </button>
        </div>
      </main>
    </>
  );
}