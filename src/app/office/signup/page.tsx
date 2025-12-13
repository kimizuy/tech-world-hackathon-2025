"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupUser } from "@/app/actions/auth";
import { departments } from "@/app/user/reception/departments";

export default function StaffSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("お名前を入力してください");
      return;
    }

    if (!departmentId) {
      setError("所属部署を選択してください");
      return;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    setIsLoading(true);

    const result = await signupUser(
      email,
      password,
      name,
      "staff",
      departmentId,
    );

    if (result.success) {
      router.push("/office/dashboard");
    } else {
      setError(result.error ?? "登録に失敗しました");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-2">職員登録</h1>
          <p className="text-slate-400 text-center text-sm mb-6">
            職員ポータルを利用するためのアカウントを作成します
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                お名前
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                placeholder="山田 太郎"
              />
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium mb-1"
              >
                所属部署
              </label>
              <select
                id="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">選択してください</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

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
                className="w-full px-4 py-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                placeholder="example@city.lg.jp"
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
                className="w-full px-4 py-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                placeholder="6文字以上"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1"
              >
                パスワード（確認）
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
                placeholder="パスワードを再入力"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
            >
              {isLoading ? "登録中..." : "登録する"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">
              既にアカウントをお持ちですか？
            </span>{" "}
            <Link
              href="/office/login"
              className="text-emerald-400 hover:underline"
            >
              ログイン
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/office"
              className="text-slate-400 text-sm hover:text-white"
            >
              ← 戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
