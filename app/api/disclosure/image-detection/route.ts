import { NextRequest, NextResponse } from "next/server";
import { detectImageProperties } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      console.warn("缺少图片数据");
      return NextResponse.json(
        { error: "图片数据(imageUrl)是必需的" },
        { status: 400 },
      );
    }

    const result = await detectImageProperties({
      imageUrl,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("图片检测 API 处理错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
