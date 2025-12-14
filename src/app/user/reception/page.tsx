"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Department } from "./departments";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function ReceptionPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(
    null,
  );
  const [recommendedDepartment, setRecommendedDepartment] =
    useState<Department | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setError(
        "お使いのブラウザは音声認識に対応していません。Chrome または Edge をお使いください。",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "ja-JP";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const transcriptText = lastResult[0].transcript;
      setTranscript(transcriptText);

      if (lastResult.isFinal) {
        // Use state to trigger send in useEffect to avoid stale closure
        setPendingTranscript(transcriptText);
        setTranscript("");
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        setError(
          "マイクへのアクセスが許可されていません。ブラウザの設定を確認してください。",
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const greeting =
      "こんにちは、市役所総合案内です。本日はどのようなご用件でいらっしゃいますか？";
    const initialMessages: Message[] = [
      { role: "assistant", content: greeting },
    ];
    messagesRef.current = initialMessages;
    setMessages(initialMessages);
    speak(greeting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Process pending transcript (fixes stale closure issue)
  useEffect(() => {
    if (pendingTranscript && !isLoading) {
      handleSendMessage(pendingTranscript);
      setPendingTranscript(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTranscript]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Remove symbols that shouldn't be read aloud
    const cleanedText = text
      .replace(/[→←↑↓⇒⇐⇑⇓]/g, "")
      .replace(/[★☆◆◇■□●○▲△▼▽]/g, "")
      .replace(/[「」『』【】〈〉《》（）()［］[\]{}]/g, "")
      .replace(/[！!？?…・]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = "ja-JP";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messagesRef.current, userMessage];
    messagesRef.current = newMessages;
    setMessages(newMessages);

    try {
      const response = await fetch("/api/sakura-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      const updatedMessages = [...messagesRef.current, assistantMessage];
      messagesRef.current = updatedMessages;
      setMessages(updatedMessages);

      if (data.recommendedDepartment) {
        setRecommendedDepartment(data.recommendedDepartment);
        setShowDialog(true);
      }

      // Speak the response
      speak(data.message);
    } catch (err) {
      console.error("Chat error:", err);
      setError(
        "申し訳ございません。応答の取得に失敗しました。もう一度お試しください。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Stop any ongoing speech before listening
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const resetConversation = () => {
    setRecommendedDepartment(null);
    setShowDialog(false);
    setError(null);
    window.speechSynthesis?.cancel();
    const greeting =
      "会話をリセットしました。どのようなご用件でいらっしゃいますか？";
    const resetMessages: Message[] = [{ role: "assistant", content: greeting }];
    messagesRef.current = resetMessages;
    setMessages(resetMessages);
    speak(greeting);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-2xl p-4">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">市役所 総合案内</h1>
          <p className="text-slate-400 text-sm">
            音声でご用件をお伝えください。適切な窓口をご案内します。
          </p>
        </header>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Department confirmation dialog */}
        {showDialog && recommendedDepartment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="mx-4 w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-2xl">
              <h2 className="mb-4 text-center text-lg font-bold text-emerald-400">
                ご案内先が見つかりました
              </h2>
              <div className="mb-6 rounded-lg bg-slate-700 p-4">
                <p className="text-2xl font-bold text-white">
                  {recommendedDepartment.name}
                </p>
                <p className="mt-2 text-slate-300">
                  {recommendedDepartment.floor} {recommendedDepartment.counter}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {recommendedDepartment.description}
                </p>
              </div>
              <p className="mb-6 text-center text-slate-300">
                この窓口へ進みますか？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDialog(false);
                    setRecommendedDepartment(null);
                  }}
                  className="flex-1 rounded-lg border border-slate-500 px-4 py-3 font-bold text-slate-300 transition-colors hover:bg-slate-700"
                >
                  いいえ
                </button>
                <button
                  onClick={() =>
                    router.push(`/user/department/${recommendedDepartment.id}`)
                  }
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white transition-colors hover:bg-emerald-500"
                >
                  はい
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="mb-4 flex gap-4">
          <div className="flex flex-col items-center text-center text-slate-300">
            <div className="rounded-full bg-slate-800 p-3">
              <Image
                src="/business_man1_1_smile.png"
                alt="案内担当のアイコン"
                width={56}
                height={56}
                className="h-12 w-12 object-cover"
              />
            </div>
            <p className="mt-2 text-xs">案内AI</p>
          </div>
          <div className="flex-1 h-[400px] overflow-y-auto rounded-lg bg-slate-800 p-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-100"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {transcript && (
              <div className="mb-3 text-right">
                <div className="inline-block max-w-[80%] rounded-lg px-4 py-2 bg-blue-600/50 text-white italic">
                  {transcript}...
                </div>
              </div>
            )}
            {isLoading && (
              <div className="mb-3 text-left">
                <div className="inline-block rounded-lg px-4 py-2 bg-slate-700">
                  <span className="animate-pulse">考え中...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Voice controls */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={toggleListening}
            disabled={!speechSupported || isLoading}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? "bg-red-500 animate-pulse"
                : isSpeaking
                  ? "bg-yellow-500"
                  : "bg-blue-600 hover:bg-blue-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <MicOnIcon />
            ) : isSpeaking ? (
              <SpeakerIcon />
            ) : (
              <MicOffIcon />
            )}
          </button>
          <p className="text-slate-400 text-sm">
            {isListening
              ? "聞いています..."
              : isSpeaking
                ? "話しています..."
                : "タップして話す"}
          </p>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={resetConversation}
            className="px-4 py-2 rounded-lg border border-slate-600 hover:border-slate-400 text-sm"
          >
            会話をリセット
          </button>
          <Link
            href="/user"
            className="px-4 py-2 rounded-lg border border-slate-600 hover:border-slate-400 text-sm"
          >
            戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

// Icon components
function MicOnIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}
