import Link from "next/link";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";
import { findDepartmentById } from "@/app/user/reception/departments";

export default async function OfficePage() {
  const user = await getCurrentUser();
  const isLoggedIn = user && user.role === "staff";
  const department = user?.departmentId
    ? findDepartmentById(user.departmentId)
    : null;

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <section className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">職員ポータル</h1>
            <p className="mt-2 text-slate-300">
              リモート来庁者への対応とスタッフ管理を行います。
            </p>
          </div>
          {isLoggedIn && (
            <form action={logoutUser}>
              <button
                type="submit"
                className="px-3 py-1 text-sm rounded border border-slate-600 hover:border-slate-400"
              >
                ログアウト
              </button>
            </form>
          )}
        </div>

        {isLoggedIn ? (
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <p className="text-emerald-400">
              {user.name ?? "名前未設定"}さん（
              {department?.name ?? "部署未設定"}）
            </p>
          </div>
        ) : (
          <div className="flex gap-3 mb-4">
            <Link
              href="/office/login"
              className="flex-1 rounded-lg border border-emerald-600 px-4 py-3 text-center font-medium text-emerald-400 hover:bg-emerald-900/30"
            >
              ログイン
            </Link>
            <Link
              href="/office/signup"
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium hover:bg-emerald-500"
            >
              新規登録
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {isLoggedIn && (
            <Link
              href="/office/dashboard"
              className="block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium hover:bg-emerald-500"
            >
              ダッシュボード（待機市民一覧）
            </Link>
          )}
          <Link
            href={isLoggedIn ? "/office/assign" : "/office/login"}
            className="block w-full rounded-lg border border-slate-600 px-4 py-3 text-center font-medium hover:border-slate-400"
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
