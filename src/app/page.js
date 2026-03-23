"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-xl text-center">

        <h1 className="text-4xl font-bold mb-6">🎬 Movie Night</h1>

        <button
          onClick={() => router.push("/setup")}
          className="w-full bg-green-500 hover:bg-green-600 p-4 rounded mb-4 text-xl"
        >
          Create or Join
        </button>

        <button
          onClick={() => router.push("/join")}
          className="w-full bg-blue-500 hover:bg-blue-600 p-4 rounded text-xl"
        >
          Join with Code
        </button>

      </div>
    </main>
  );
}