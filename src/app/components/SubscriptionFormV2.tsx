"use client";

import { useState, useEffect, useRef } from "react";
import { createSubscription } from "@/app/actions/subscription";

interface SubscriptionFormProps {
  scriptLoaded: boolean;
}

interface SubscriptionResult {
  customerId: string;
  subscriptionId: string;
  status: string;
}

const PLANS = [
  {
    id: "starter_plan",
    name: "スタンダードプラン",
    price: 150000,
    description: "利用職員数：～50名",
  },
  {
    id: "basic_plan",
    name: "スタンダードプラスプラン",
    price: 400000,
    description: "利用職員数：51～200名",
  },
  {
    id: "pro_plan",
    name: "プレミアムプラン",
    price: 800000,
    description: "利用職員数：201～500名",
    note: "※500名超は別途お見積",
  },
];

export default function SubscriptionFormV2({
  scriptLoaded,
}: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubscriptionResult | null>(null);
  const [error, setError] = useState<string>("");
  const [payjpReady, setPayjpReady] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("basic_plan");
  const cardElementRef = useRef<unknown>(null);
  const payjpRef = useRef<unknown>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!scriptLoaded || typeof window === "undefined" || !window.Payjp) return;

    try {
      const publicKey = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY!;
      console.log("pay.jp初期化中...", publicKey.slice(0, 10) + "...");

      // pay.jp v2の初期化
      const payjp = window.Payjp(publicKey);
      payjpRef.current = payjp;

      const elements = payjp.elements();

      // 統合カード要素を使用（推奨）
      const cardElement = elements.create("card", {
        style: {
          base: {
            fontSize: "16px",
            color: "#1f2937",
            "::placeholder": {
              color: "#9ca3af",
            },
          },
        },
      });

      cardElement.mount("#card-element");
      cardElementRef.current = cardElement;

      console.log("✅ pay.jp Elements マウント完了");
      setPayjpReady(true);
    } catch (err) {
      console.error("pay.jp初期化エラー:", err);
      setError("pay.jpの初期化に失敗しました");
    }
  }, [scriptLoaded]);

  // 登録成功後にカード入力を無効化
  useEffect(() => {
    if (result && cardElementRef.current) {
      cardElementRef.current.update({ disabled: true });
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const email = emailRef.current?.value || "";

    try {
      if (!payjpRef.current || !cardElementRef.current) {
        throw new Error("pay.jpが初期化されていません");
      }

      console.log("トークン作成中...");

      // v2 APIでトークン作成
      const tokenResult = await payjpRef.current.createToken(
        cardElementRef.current,
      );

      console.log("トークン作成結果:", tokenResult);

      if (tokenResult.error) {
        console.error("トークン作成エラー詳細:", {
          type: tokenResult.error.type,
          code: tokenResult.error.code,
          message: tokenResult.error.message,
          param: tokenResult.error.param,
        });
        throw new Error(
          tokenResult.error.message || "トークン作成に失敗しました",
        );
      }

      console.log("✅ トークン作成成功:", tokenResult.id);

      // サブスクリプション作成
      const result = await createSubscription(
        tokenResult.id,
        email,
        selectedPlan,
      );

      if (result.success) {
        setResult(result.data);
        console.log("✅ サブスクリプション登録成功！", result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("エラー:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanInfo = PLANS.find((p) => p.id === selectedPlan);

  return (
    <div className="max-w-5xl mx-auto">
      {/* プラン選択 */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => !result && setSelectedPlan(plan.id)}
              className={`relative rounded-lg border-2 p-4 transition-all ${
                result ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              } ${
                selectedPlan === plan.id
                  ? "border-blue-600 bg-blue-50 shadow-lg"
                  : "border-gray-300 bg-white hover:border-blue-400 hover:shadow-md"
              }`}
            >
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {plan.name}
                </h3>
                <p className="text-xs text-gray-600 mb-3">{plan.description}</p>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    ¥{plan.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">/月</span>
                </div>
                {"note" in plan && (
                  <p className="text-xs text-gray-600 mt-2">{plan.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 支払い情報入力 */}
      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-1 text-gray-800">お支払い情報</h2>
        <p className="text-xs text-gray-600 mb-4">
          <span className="font-bold text-blue-600">
            {selectedPlanInfo?.name}
          </span>
          （¥{selectedPlanInfo?.price.toLocaleString()}/月・7日間無料）
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-bold text-center text-lg">
              ✅ 登録が完了しました
            </p>
            <p className="text-sm mt-2 text-center">
              ご登録いただきありがとうございます。
              <br />
              確認メールをお送りしましたので、ご確認ください。
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              ref={emailRef}
              type="email"
              required
              disabled={!!result}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              カード情報
            </label>
            <div
              id="card-element"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 ${
                result ? "bg-gray-100" : ""
              }`}
              style={{ minHeight: "40px" }}
            ></div>
          </div>

          <button
            type="submit"
            disabled={loading || !payjpReady || !!result}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors text-sm"
          >
            {result
              ? "登録済み"
              : !payjpReady
                ? "読み込み中..."
                : loading
                  ? "処理中..."
                  : `登録する（¥${selectedPlanInfo?.price.toLocaleString()}/月）`}
          </button>
        </form>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    Payjp: unknown;
  }
}
