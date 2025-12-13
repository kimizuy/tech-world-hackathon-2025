import Link from "next/link";

export default function UserGuidePage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold">ユーザー向け案内</h1>
        <p className="text-zinc-300">
          このページではイベント参加方法や推奨デバイス、配信ルームへのアクセス手順などを順番に紹介します。
        </p>
        <Link
          href="/user"
          className="inline-flex rounded-lg border border-zinc-600 px-4 py-2 font-medium hover:border-zinc-400"
        >
          ユーザーページへ戻る
        </Link>
      </section>
    </main>
  );
}
