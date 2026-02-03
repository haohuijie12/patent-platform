import { NextRequest, NextResponse } from "next/server";
import { streamKeywordsExplanation } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("关键词解释 API 被调用");
  try {
    const body = await request.json();
    console.log("请求体:", JSON.stringify(body).substring(0, 200) + "...");
    const { techSolution } = body;

    if (!techSolution) {
      console.warn("缺少技术方案");
      return NextResponse.json(
        { error: "技术方案是必需的" },
        { status: 400 },
      );
    }

    console.log("开始调用 streamKeywordsExplanation");
    const stream = await streamKeywordsExplanation({
      techSolution,
    });
    console.log("streamKeywordsExplanation 调用成功");

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk) {
              controller.enqueue(encoder.encode(chunk));
            }
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("关键词解释 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
