"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdBanner from "@/components/AdBanner"; // ⭐ ADDED IMPORT

export default function JoinPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");

  const joinLobby = () => {
    if (!name.trim()) return alert("Enter your name");
    if (!sessionId.trim()) return alert("Enter a session code");

    router.push(
      `/lobby?session=${sessionId}&name=${encodeURIComponent(name)}`
    );
  };

  return (
    <>
      <AdBanner slot="1000000006" />

      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-xl">

          <h1 className="text-3xl font-bold mb-6 text-center">Join Lobby</h1>

          <input
            placeholder="Your name"
            className="w-full p-3 bg-gray-700 rounded mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Session code"
            className="w-full p-3 bg-gray-700 rounded mb-4"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value.toUpperCase())}
          />

          <button
            onClick={joinLobby}
            className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded"
          >
            Join
          </button>
        </div>
      </main>
    </>
  );
}