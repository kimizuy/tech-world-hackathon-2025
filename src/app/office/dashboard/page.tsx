"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, logoutUser } from "@/app/actions/auth";
import {
  getWaitingCitizens,
  startConsultation,
  QueueEntry,
} from "@/app/actions/queue";
import { findDepartmentById } from "@/app/user/reception/departments";

export default function StaffDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    name: string | null;
    departmentId: string | null;
  } | null>(null);
  const [waitingList, setWaitingList] = useState<QueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState<number | null>(null);

  const department = user?.departmentId
    ? findDepartmentById(user.departmentId)
    : null;

  const loadData = useCallback(async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "staff") {
      router.push("/office/login");
      return;
    }

    setUser({
      id: currentUser.id,
      name: currentUser.name,
      departmentId: currentUser.departmentId,
    });

    if (currentUser.departmentId) {
      const citizens = await getWaitingCitizens(currentUser.departmentId);
      setWaitingList(citizens);
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await loadData();
      }
    };

    fetchData();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        loadData();
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [loadData]);

  const handleStartConsultation = async (queueId: number) => {
    setIsStarting(queueId);
    const result = await startConsultation(queueId);

    if (result.success && result.roomId) {
      router.push(`/rooms/${result.roomId}`);
    } else {
      alert(result.error ?? "相談の開始に失敗しました");
      setIsStarting(null);
    }
  };

  const formatWaitTime = (createdAt: Date) => {
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - new Date(createdAt).getTime()) / 1000 / 60,
    );
    if (diff < 1) return "たった今";
    if (diff < 60) return `${diff}分前`;
    return `${Math.floor(diff / 60)}時間${diff % 60}分前`;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-pulse">読み込み中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              {department?.name ?? "部署未設定"} - ダッシュボード
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {user?.name ?? "名前未設定"} さん
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => loadData()}
              className="px-4 py-2 rounded-lg border border-slate-600 hover:border-slate-400 text-sm"
            >
              更新
            </button>
            <form action={logoutUser}>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg border border-red-600 text-red-400 hover:bg-red-900/30 text-sm"
              >
                ログアウト
              </button>
            </form>
          </div>
        </header>

        {/* Waiting Citizens Section */}
        <section className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
            待機中の市民
            <span className="text-slate-400 text-sm font-normal">
              ({waitingList.length}人)
            </span>
          </h2>

          {waitingList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg">現在待機中の市民はいません</p>
              <p className="text-sm mt-2">
                市民が待機キューに参加すると、ここに表示されます
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingList.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between bg-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-xl font-bold">
                      {entry.ticketNumber}
                    </div>
                    <div>
                      <p className="font-medium">
                        {entry.citizenName ?? "名前未登録"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatWaitTime(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartConsultation(entry.id)}
                    disabled={isStarting !== null}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                  >
                    {isStarting === entry.id ? "開始中..." : "相談を開始する"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Navigation */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/office"
            className="px-4 py-2 rounded-lg border border-slate-600 hover:border-slate-400 text-sm"
          >
            職員ポータルへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
