import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";

export default async function OfficePage() {
  const user = await getCurrentUser();

  // Redirect logged-in staff to dashboard
  if (user && user.role === "staff") {
    redirect("/office/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">職員ポータル</h1>
          <p className="mt-2 text-slate-300">
            リモート来庁者への対応とスタッフ管理を行います。
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/office/login"
            className="flex-1 rounded-lg border border-emerald-600 px-4 py-3 text-center font-medium text-emerald-400 hover:bg-emerald-900/30"
          >
            ログイン
          </Link>
          <Link
            href="/office/signup"
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium hover:bg-emerald-500"
          >
            新規登録
          </Link>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex rounded-lg border border-slate-600 px-4 py-2 font-medium hover:border-slate-400"
          >
            ホームへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
