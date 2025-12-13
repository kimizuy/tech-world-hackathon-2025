import { NextRequest, NextResponse } from "next/server";
import { departments } from "@/app/gov/guide/departments";

const SAKURA_API_URL = "https://api.ai.sakura.ad.jp/v1/chat/completions";
const MODEL = "gpt-oss-120b";

// Build system prompt with department info
function buildSystemPrompt(): string {
  const departmentList = departments
    .map(
      (d) =>
        `- ID: "${d.id}" | ${d.name}（${d.floor} ${d.counter}）\n  担当: ${d.description}\n  キーワード: ${d.keywords.join("、")}`,
    )
    .join("\n\n");

  return `あなたは市役所の総合案内AIアシスタントです。来庁者の相談内容を聞いて、最適な窓口へご案内します。

## 窓口一覧（ID付き）
${departmentList}

## 重要なルール
1. 利用者の発言に上記キーワードが含まれていたら、すぐに該当窓口を案内してください
2. 「〜について」「〜したい」「〜の手続き」などの表現があれば、それだけで窓口を特定できます
3. 窓口案内時は必ずJSON形式を出力してください
4. 複数の窓口が該当する場合は、最も関連性の高い1つを案内してください

## 出力形式
窓口を案内する際は、回答の最後に必ず以下のJSON形式を含めてください。
department_idには上記の窓口IDをそのまま使用してください。

\`\`\`json
{"department_id": "窓口のID", "confidence": "high"}
\`\`\`

例：「年金について聞きたい」→ 保険年金課を案内 → department_id: "insurance"
例：「住民票が欲しい」→ 住民課を案内 → department_id: "resident"
例：「税金の相談」→ 税務課を案内 → department_id: "tax"`;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: NextRequest) {
  const sakuraToken = process.env.SAKURA_AI_ENGINE_TOKEN;

  if (!sakuraToken) {
    return NextResponse.json(
      { error: "SAKURA_AI_ENGINE_TOKEN is not configured" },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { messages }: { messages: ChatMessage[] } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 },
      );
    }

    // Prepend system prompt
    const messagesWithSystem: ChatMessage[] = [
      { role: "system", content: buildSystemPrompt() },
      ...messages,
    ];

    const response = await fetch(SAKURA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sakuraToken}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Sakura AI Engine error:", errorText);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: response.status },
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "";

    // Extract department recommendation if present
    let recommendedDepartment = null;
    const jsonMatch = assistantMessage.match(/```json\s*(\{[^`]+\})\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.department_id) {
          const dept = departments.find((d) => d.id === parsed.department_id);
          if (dept) {
            recommendedDepartment = {
              ...dept,
              confidence: parsed.confidence,
            };
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    // Remove JSON from display message
    const displayMessage = assistantMessage
      .replace(/```json\s*\{[^`]+\}\s*```/g, "")
      .trim();

    return NextResponse.json({
      message: displayMessage,
      recommendedDepartment,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
