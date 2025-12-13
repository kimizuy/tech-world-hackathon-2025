import Link from "next/link";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";

export default async function UserPage() {
  const user = await getCurrentUser();
  const isLoggedIn = user && user.role === "citizen";

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">リモート来庁</h1>
            <p className="mt-2 text-zinc-300">
              ご自宅から市役所の手続き・相談ができます。
            </p>
          </div>
          {isLoggedIn && (
            <form action={logoutUser}>
              <button
                type="submit"
                className="px-3 py-1 text-sm rounded border border-zinc-600 hover:border-zinc-400"
              >
                ログアウト
              </button>
            </form>
          )}
        </div>

        {isLoggedIn ? (
          <div className="bg-zinc-800 rounded-lg p-4 mb-4">
            <p className="text-emerald-400">
              ようこそ、{user.name ?? "ゲスト"}さん
            </p>
          </div>
        ) : (
          <div className="flex gap-3 mb-4">
            <Link
              href="/user/login"
              className="flex-1 rounded-lg border border-emerald-600 px-4 py-3 text-center font-medium text-emerald-400 hover:bg-emerald-900/30"
            >
              ログイン
            </Link>
            <Link
              href="/user/signup"
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium hover:bg-emerald-500"
            >
              新規登録
            </Link>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href={isLoggedIn ? "/user/reception" : "/user/login"}
            className="block w-full rounded-lg bg-emerald-600 px-4 py-4 text-center text-lg font-bold hover:bg-emerald-500"
          >
            AI総合案内を開始
          </Link>
          <p className="text-center text-sm text-zinc-400">
            音声でご用件をお伝えください。適切な窓口をご案内します。
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex rounded-lg border border-zinc-600 px-4 py-2 font-medium hover:border-zinc-400"
          >
            ホームへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
