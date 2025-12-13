import Link from "next/link";

export default function OfficePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">職員ポータル</h1>
          <p className="mt-2 text-slate-300">
            リモート来庁者への対応とスタッフ管理を行います。
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/office/assign"
            className="block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium hover:bg-emerald-500"
          >
            スタッフ管理
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
