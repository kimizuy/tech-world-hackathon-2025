import Link from "next/link";

export default function UserMactingPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold">ユーザー向けMacting</h1>
        <p className="text-zinc-300">
          配信の使い方やサポート窓口、レコメンドされるルームの選び方などをまとめた案内ページです。
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
