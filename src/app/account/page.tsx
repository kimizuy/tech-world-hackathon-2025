import { getSession } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await getSession();

  if (!session.user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold">アカウント</h1>
        <p className="text-zinc-300">ログイン中: {session.user.email}</p>

        <form
          action={async () => {
            "use server";
            const session = await getSession();
            session.destroy();
          }}
        >
          <button className="rounded-lg bg-zinc-700 px-4 py-2 font-medium hover:bg-zinc-600">
            ログアウト
          </button>
        </form>

        <div className="flex flex-wrap gap-4">
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
