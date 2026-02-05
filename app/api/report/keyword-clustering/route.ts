import { NextRequest, NextResponse } from "next/server";
import { streamClusters, generateClusters } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, clusterCount, stream } = body;

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: "关键词列表是必需的" },
        { status: 400 },
      );
    }

    if (keywords.length === 0) {
      return NextResponse.json(
        { error: "关键词列表不能为空" },
        { status: 400 },
      );
    }

    const count = clusterCount || 3;
    const useStream = stream !== false;

    if (useStream) {
      const stream = await streamClusters({
        keywords,
        clusterCount: count,
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
          "Cache-Control": "no-cache",
        },
      });
    } else {
      const clusters = await generateClusters({
        keywords,
        clusterCount: count,
      });

      return NextResponse.json({
        success: true,
        data: {
          keywords,
          clusterCount: count,
          actualClusterCount: clusters.length,
          clusters,
        },
      });
    }
  } catch (error) {
    console.error("关键词聚类 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keywordsParam = searchParams.get("keywords");
    const clusterCount = Number(searchParams.get("count")) || 3;

    if (!keywordsParam) {
      return NextResponse.json(
        {
          error:
            "缺少必要参数。请使用格式：/api/report/keyword-clustering?keywords=机器学习,深度学习,神经网络&count=3",
        },
        { status: 400 },
      );
    }

    const keywords = keywordsParam
      .split(/[，、,\n\r]/)
      .map((k) => k.trim())
      .filter((k) => k);

    if (keywords.length === 0) {
      return NextResponse.json(
        { error: "关键词列表不能为空" },
        { status: 400 },
      );
    }

    const clusters = await generateClusters({
      keywords,
      clusterCount,
    });

    return NextResponse.json({
      success: true,
      data: {
        keywords,
        clusterCount,
        actualClusterCount: clusters.length,
        clusters,
      },
    });
  } catch (error) {
    console.error("关键词聚类 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
