import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-900">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Madoguchi
        </h1>
        <div className="mt-10 space-y-3">
          <Link
            href="/user"
            className="block w-full rounded-lg bg-zinc-800 py-2 text-center font-medium text-white hover:bg-zinc-700"
          >
            市民の方へ
          </Link>
          <Link
            href="/office"
            className="block w-full rounded-lg bg-zinc-800 py-2 text-center font-medium text-white hover:bg-zinc-700"
          >
            職員の方へ
          </Link>
          <Link
            href="/pricing"
            className="block w-full rounded-lg bg-zinc-800 py-2 text-center font-medium text-white hover:bg-zinc-700"
          >
            料金ページへ
          </Link>
        </div>
      </div>
    </main>
  );
}
