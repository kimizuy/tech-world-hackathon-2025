import Link from "next/link";

export default function UserPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">リモート来庁</h1>
          <p className="mt-2 text-zinc-300">
            ご自宅から市役所の手続き・相談ができます。
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/user/reception"
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
