import Link from "next/link";

export default function OfficeAssignPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold">職員向けAssign</h1>
        <p className="text-slate-300">
          指定ルームへの割当てや進行スタッフのアサイン状況、権限配布のチェックシートをまとめています。
        </p>
        <Link
          href="/office"
          className="inline-flex rounded-lg border border-slate-600 px-4 py-2 font-medium hover:border-slate-400"
        >
          職員ページへ戻る
        </Link>
      </section>
    </main>
  );
}
