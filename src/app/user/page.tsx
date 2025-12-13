import Link from "next/link";

export default function UserPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold">ユーザー向けページ</h1>
        <p className="text-zinc-300">
          サービスの参加者が必要な情報へ素早くアクセスできます。
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/user/guide"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500"
          >
            案内ページへ
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-zinc-600 px-4 py-2 font-medium hover:border-zinc-400"
          >
            ホームへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
