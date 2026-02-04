import { NextRequest, NextResponse } from "next/server";
import { streamKeywords, generateKeywords } from "./service"; // 导入服务

export const dynamic = "force-dynamic";

// 处理 POST 请求（支持流式输出和一次性返回）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coreKeyword, technicalField, desiredCount, stream } = body;

    // 参数验证
    if (!coreKeyword) {
      return NextResponse.json(
        { error: "核心关键词是必需的" },
        { status: 400 }
      );
    }

    // 设置默认值
    const field = technicalField || "通用技术";
    const count = desiredCount || 5;
    const useStream = stream !== false; // 默认启用流式输出

    // 如果客户端请求流式输出
    if (useStream) {
      const stream = await streamKeywords({
        coreKeyword,
        technicalField: field,
        desiredCount: count,
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
    } 
    // 非流式输出
    else {
      const keywordsString = await generateKeywords({
        coreKeyword,
        technicalField: field,
        desiredCount: count,
      });

      // 将顿号分隔的字符串转为数组，方便前端使用
      const recommendations = keywordsString.split("、").filter(item => item.trim());

      return NextResponse.json({
        success: true,
        data: {
          coreKeyword,
          technicalField: field,
          desiredCount: count,
          recommendations,
          actualCount: recommendations.length,
        },
      });
    }
  } catch (error) {
    console.error("关键词推荐 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

// 处理 GET 请求（通过查询参数，仅支持非流式）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const coreKeyword = searchParams.get("keyword");
    const technicalField = searchParams.get("field") || "通用技术";
    const desiredCount = Number(searchParams.get("count")) || 5;

    if (!coreKeyword) {
      return NextResponse.json(
        { error: "缺少必要参数。请使用格式：/api/report/keyword-recommendation?keyword=智能座舱&field=汽车电子&count=5" },
        { status: 400 }
      );
    }

    const keywordsString = await generateKeywords({
      coreKeyword,
      technicalField,
      desiredCount,
    });

    const recommendations = keywordsString.split("、").filter(item => item.trim());

    return NextResponse.json({
      success: true,
      data: {
        coreKeyword,
        technicalField,
        desiredCount,
        recommendations,
        actualCount: recommendations.length,
      },
    });
  } catch (error) {
    console.error("关键词推荐 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
