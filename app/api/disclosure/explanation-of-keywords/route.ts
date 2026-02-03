import { NextRequest, NextResponse } from "next/server";
import { generateKeywordsExplanation } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { techSolution } = body;

    if (!techSolution) {
      console.warn("缺少技术方案");
      return NextResponse.json(
        { error: "技术方案是必需的" },
        { status: 400 },
      );
    }

    const result = await generateKeywordsExplanation({
      techSolution,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("关键词解释 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
