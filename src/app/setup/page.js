"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import AdBanner from "@/components/AdBanner"; // ⭐ ADDED IMPORT

export default function SetupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [sessionIdInput, setSessionIdInput] = useState("");

  const createSession = async () => {
    if (!name.trim()) {
      alert("Please enter your name first");
      return;
    }

    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();

    await setDoc(doc(db, "sessions", sessionId), {
      state: "lobby",
      countdownStart: null,
      submittedCount: 0,
      votesSubmittedCount: 0,
      winner: null,
      totalVoters: 2,
    });

    router.push(
      `/lobby?session=${sessionId}&name=${encodeURIComponent(
        name
      )}&host=true`
    );
  };

  const joinSession = () => {
    if (!name.trim()) {
      alert("Please enter your name first");
      return;
    }
    if (!sessionIdInput.trim()) {
      alert("Please enter a session code");
      return;
    }

    router.push(
      `/lobby?session=${sessionIdInput}&name=${encodeURIComponent(name)}`
    );
  };

  return (
    <>
      <AdBanner slot="1000000003" />

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
            onClick={createSession}
            className="w-full bg-green-500 hover:bg-green-600 p-3 rounded mb-6"
          >
            Create New Session
          </button>

          <input
            placeholder="Enter session code"
            className="w-full p-3 bg-gray-700 rounded mb-3"
            value={sessionIdInput}
            onChange={(e) => setSessionIdInput(e.target.value.toUpperCase())}
          />

          <button
            onClick={joinSession}
            className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded"
          >
            Join Session
          </button>
        </div>
      </main>
    </>
  );
}