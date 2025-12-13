import Link from "next/link";

export default function GovPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold">行政管理者向けページ</h1>
        <p className="text-slate-300">
          自治体職員向けに運用ポリシーとモニタリングリンクをまとめています。
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/gov/guide"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500"
          >
            案内ページへ
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-600 px-4 py-2 font-medium hover:border-slate-400"
          >
            ホームへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
