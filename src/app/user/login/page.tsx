"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";

export default function CitizenLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await loginUser(email, password, "citizen");

    if (result.success) {
      router.push("/user/reception");
    } else {
      setError(result.error ?? "ログインに失敗しました");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-800 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-2">市民ログイン</h1>
          <p className="text-zinc-400 text-center text-sm mb-6">
            リモート来庁サービスにログインします
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-700 rounded-lg border border-zinc-600 focus:border-emerald-500 focus:outline-none"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-700 rounded-lg border border-zinc-600 focus:border-emerald-500 focus:outline-none"
                placeholder="パスワード"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-400">
              アカウントをお持ちでないですか？
            </span>{" "}
            <Link
              href="/user/signup"
              className="text-emerald-400 hover:underline"
            >
              新規登録
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/user"
              className="text-zinc-400 text-sm hover:text-white"
            >
              ← 戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
