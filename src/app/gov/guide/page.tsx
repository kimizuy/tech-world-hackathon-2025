import Link from "next/link";

export default function GovGuidePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold">行政管理者向け案内</h1>
        <p className="text-slate-300">
          配信監視のチェックリストや緊急連絡手順、コンプライアンス確認事項などをここに記載します。
        </p>
        <Link
          href="/gov"
          className="inline-flex rounded-lg border border-slate-600 px-4 py-2 font-medium hover:border-slate-400"
        >
          管理者ページへ戻る
        </Link>
      </section>
    </main>
  );
}
