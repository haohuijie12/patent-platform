import { NextRequest, NextResponse } from "next/server";
import { streamConclusion } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      searchTopic,
      searchResults,
      keyPatentAnalysis,
      patentMap,
      innovationAssessment,
    } = body;

    if (!searchTopic || !searchResults || !keyPatentAnalysis) {
      return NextResponse.json(
        { error: "检索主题、检索结果和关键专利分析是必需的" },
        { status: 400 },
      );
    }

    const stream = await streamConclusion({
      searchTopic,
      searchResults,
      keyPatentAnalysis,
      patentMap: patentMap || "暂无专利地图数据",
      innovationAssessment: innovationAssessment || "暂无创新性评估数据",
    });

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
    console.error("报告结论生成 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
