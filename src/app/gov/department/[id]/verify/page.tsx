"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { findDepartmentById } from "../../../guide/departments";

type VerificationStep = "card" | "face" | "verifying" | "success" | "failed";

interface VerificationResult {
  is_match: boolean;
  similarity: number;
  threshold: number;
  message: string;
}

// Face verification API endpoint (Sakura Cloud Koukaryoku DOK)
const FACE_VERIFY_API_URL =
  process.env.NEXT_PUBLIC_FACE_VERIFY_API_URL || "http://localhost:8000";

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const department = findDepartmentById(id);

  const [step, setStep] = useState<VerificationStep>("card");
  const [cardImage, setCardImage] = useState<Blob | null>(null);
  const [cardPreview, setCardPreview] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<Blob | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setError(
        "カメラへのアクセスが拒否されました。カメラの許可を確認してください。",
      );
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  }, []);

  // Capture image from camera
  const captureImage = useCallback((): Blob | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9,
      );
    }) as unknown as Blob;
  }, []);

  // Capture card image
  const captureCardImage = useCallback(async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCardImage(blob);
          setCardPreview(URL.createObjectURL(blob));
          stopCamera();
          setStep("face");
        }
      },
      "image/jpeg",
      0.9,
    );
  }, [stopCamera]);

  // Capture face image and verify
  const captureFaceImage = useCallback(async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          setFaceImage(blob);
          setFacePreview(URL.createObjectURL(blob));
          stopCamera();
          setStep("verifying");

          // Verify faces
          await verifyFaces(cardImage!, blob);
        }
      },
      "image/jpeg",
      0.9,
    );
  }, [cardImage, stopCamera]);

  // Verify faces with API
  const verifyFaces = async (cardBlob: Blob, faceBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("card_image", cardBlob, "card.jpg");
      formData.append("live_image", faceBlob, "face.jpg");

      const response = await fetch(`${FACE_VERIFY_API_URL}/verify`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.message || "認証に失敗しました");
      }

      const data: VerificationResult = await response.json();
      setResult(data);
      setStep(data.is_match ? "success" : "failed");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "認証処理中にエラーが発生しました",
      );
      setStep("failed");
    }
  };

  // Retry verification
  const retry = useCallback(() => {
    setCardImage(null);
    setCardPreview(null);
    setFaceImage(null);
    setFacePreview(null);
    setResult(null);
    setError(null);
    setStep("card");
  }, []);

  // Start camera when step changes
  useEffect(() => {
    if (step === "card" || step === "face") {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, startCamera, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (cardPreview) URL.revokeObjectURL(cardPreview);
      if (facePreview) URL.revokeObjectURL(facePreview);
    };
  }, []);

  if (!department) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>部署が見つかりませんでした</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-2xl p-4">
        {/* Header */}
        <header className="mb-6">
          <p className="text-emerald-400 text-sm mb-2">本人確認</p>
          <h1 className="text-2xl font-bold mb-1">{department.name}</h1>
          <p className="text-slate-400 text-sm">
            番号札発行前に本人確認を行います
          </p>
        </header>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`w-3 h-3 rounded-full ${
              step === "card" ? "bg-emerald-500" : "bg-slate-600"
            }`}
          />
          <div className="w-8 h-0.5 bg-slate-600" />
          <div
            className={`w-3 h-3 rounded-full ${
              step === "face" ? "bg-emerald-500" : "bg-slate-600"
            }`}
          />
          <div className="w-8 h-0.5 bg-slate-600" />
          <div
            className={`w-3 h-3 rounded-full ${
              step === "success"
                ? "bg-emerald-500"
                : step === "failed"
                  ? "bg-red-500"
                  : "bg-slate-600"
            }`}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Step: Capture card */}
        {step === "card" && (
          <section className="space-y-4">
            <div className="p-4 bg-slate-800 rounded-lg">
              <h2 className="text-lg font-bold mb-2">
                Step 1: マイナンバーカードを撮影
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                カードの顔写真が写るように撮影してください
              </p>

              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-slate-400">カメラを起動中...</p>
                  </div>
                )}
              </div>

              <button
                onClick={captureCardImage}
                disabled={!isCameraActive}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                カードを撮影
              </button>
            </div>
          </section>
        )}

        {/* Step: Capture face */}
        {step === "face" && (
          <section className="space-y-4">
            <div className="p-4 bg-slate-800 rounded-lg">
              <h2 className="text-lg font-bold mb-2">Step 2: 顔を撮影</h2>
              <p className="text-slate-400 text-sm mb-4">
                顔全体がカメラに写るようにしてください
              </p>

              {/* Card preview */}
              {cardPreview && (
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-1">撮影したカード:</p>
                  <img
                    src={cardPreview}
                    alt="Card"
                    className="w-24 h-16 object-cover rounded"
                  />
                </div>
              )}

              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-64 border-2 border-dashed border-emerald-500/50 rounded-full" />
                </div>
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <p className="text-slate-400">カメラを起動中...</p>
                  </div>
                )}
              </div>

              <button
                onClick={captureFaceImage}
                disabled={!isCameraActive}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                顔を撮影して確認
              </button>
            </div>
          </section>
        )}

        {/* Step: Verifying */}
        {step === "verifying" && (
          <section className="space-y-4">
            <div className="p-8 bg-slate-800 rounded-lg text-center">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-bold mb-2">本人確認中...</h2>
              <p className="text-slate-400 text-sm">
                顔照合を行っています。しばらくお待ちください。
              </p>
            </div>
          </section>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <section className="space-y-4">
            <div className="p-8 bg-slate-800 rounded-lg text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-emerald-400">
                本人確認完了
              </h2>
              <p className="text-slate-400 text-sm mb-6">{result?.message}</p>

              {result && (
                <div className="text-sm text-slate-500 mb-6">
                  一致度: {(result.similarity * 100).toFixed(1)}%
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => {
                    // TODO: Issue ticket number and navigate
                    alert("番号札を発行しました: A-001");
                    router.push(`/gov/department/${id}`);
                  }}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-4 font-bold text-white hover:bg-emerald-500 transition-colors text-lg"
                >
                  番号札を発行する
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Step: Failed */}
        {step === "failed" && (
          <section className="space-y-4">
            <div className="p-8 bg-slate-800 rounded-lg text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-red-400">
                本人確認に失敗しました
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {result?.message || error || "もう一度お試しください"}
              </p>

              {result && (
                <div className="text-sm text-slate-500 mb-6">
                  一致度: {(result.similarity * 100).toFixed(1)}%
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={retry}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  もう一度試す
                </button>
                <Link
                  href="/gov/guide"
                  className="block w-full rounded-lg border border-slate-600 px-4 py-3 text-center hover:border-slate-400 transition-colors"
                >
                  有人窓口に相談する
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Back link */}
        {(step === "card" || step === "face") && (
          <div className="mt-6">
            <Link
              href={`/gov/department/${id}`}
              className="block w-full rounded-lg border border-slate-600 px-4 py-3 text-center hover:border-slate-400 transition-colors"
            >
              戻る
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
