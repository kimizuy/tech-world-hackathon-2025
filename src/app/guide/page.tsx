import Link from "next/link";

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold">ユーザー向け案内</h1>
        <p className="text-zinc-300">
          イベント参加手順や推奨デバイス、オンライン配信ルームのトラブルシュートなどをここで確認できます。
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/user/macting"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500"
          >
            Mactingページへ
          </Link>
          <Link
            href="/user"
            className="rounded-lg border border-zinc-600 px-4 py-2 font-medium hover:border-zinc-400"
          >
            ユーザーページへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
