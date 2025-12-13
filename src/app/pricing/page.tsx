"use client";

import { useEffect, useState } from "react";
import SubscriptionFormV2 from "@/app/components/SubscriptionFormV2";

const PAYJP_SCRIPT_SRC = "https://js.pay.jp/v2/pay.js";

export default function PricingPage() {
  const [payjpLoaded, setPayjpLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const markLoaded = () => {
      console.log("pay.jp v2スクリプト読み込み完了");
      setPayjpLoaded(true);
    };

    if (window.Payjp) {
      markLoaded();
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${PAYJP_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", markLoaded, { once: true });
      return () => existingScript.removeEventListener("load", markLoaded);
    }

    const script = document.createElement("script");
    script.src = PAYJP_SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", markLoaded, { once: true });
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", markLoaded);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
          プランを選択してご登録ください
        </h1>
        <SubscriptionFormV2 scriptLoaded={payjpLoaded} />
      </div>
    </main>
  );
}
