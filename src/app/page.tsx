"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() && username.trim()) {
      const encodedRoom = encodeURIComponent(roomName.trim());
      const encodedUsername = encodeURIComponent(username.trim());
      router.push(`/rooms/${encodedRoom}?username=${encodedUsername}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-900">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Madoguchi
        </h1>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1 text-zinc-300"
            >
              Your Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="roomName"
              className="block text-sm font-medium mb-1 text-zinc-300"
            >
              Room Name
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              required
              className="w-full px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Join Room
          </button>
        </form>

        <div className="mt-10 space-y-3">
          <Link
            href="/user"
            className="block w-full rounded-lg bg-zinc-800 py-2 text-center font-medium text-white hover:bg-zinc-700"
          >
            市民の方へ
          </Link>
          <Link
            href="/office"
            className="block w-full rounded-lg bg-zinc-800 py-2 text-center font-medium text-white hover:bg-zinc-700"
          >
            職員の方へ
          </Link>
          <Link
            href="/pricing"
            className="block w-full rounded-lg bg-zinc-800 py-2 text-center font-medium text-white hover:bg-zinc-700"
          >
            料金ページへ
          </Link>
        </div>
      </div>
    </main>
  );
}
