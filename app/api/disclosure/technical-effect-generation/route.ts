import { NextRequest, NextResponse } from "next/server";
import { streamBeneficialEffects, streamProtectionPoints } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { technicalBackground, technicalSolution } = body;

    if (!technicalBackground || !technicalSolution) {
      return NextResponse.json(
        { error: "技术背景和技术方案是必需的" },
        { status: 400 },
      );
    }

    const encoder = new TextEncoder();

    const beneficialEffectsStream = await streamBeneficialEffects({
      technicalBackground,
      technicalSolution,
    });

    const protectionPointsStream = await streamProtectionPoints({
      technicalBackground,
      technicalSolution,
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode("## 有益效果\n\n"));

          for await (const chunk of beneficialEffectsStream) {
            if (chunk) {
              controller.enqueue(encoder.encode(chunk));
            }
          }

          controller.enqueue(encoder.encode("\n\n## 技术关键点和欲保护点\n\n"));

          // 将技术关键点的 chunk 拆分成字符级别，实现逐字显示
          for await (const chunk of protectionPointsStream) {
            if (chunk) {
              // 将 chunk 拆分成单个字符，逐字发送
              const chunkStr = String(chunk);
              for (let i = 0; i < chunkStr.length; i++) {
                controller.enqueue(encoder.encode(chunkStr[i]));
                // 添加小延迟以确保逐字显示效果（每个字符延迟20ms）
                await new Promise(resolve => setTimeout(resolve, 20));
              }
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
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // 禁用 nginx 缓冲
      },
    });
  } catch (error) {
    console.error("技术效果生成 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
