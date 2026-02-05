import { NextRequest } from "next/server";
import { generateDisclosureDocumentFromTemplate } from "./service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      inventionName,
      contactPerson,
      applicationType,
      technicalField,
      techBackground,
      technicalSolution,
      beneficialEffects,
      protectionPoints,
    } = body;

    if (
      !inventionName ||
      !technicalField ||
      !techBackground ||
      !technicalSolution
    ) {
      return new Response(JSON.stringify({ error: "缺少必要信息" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const docxBuffer = await generateDisclosureDocumentFromTemplate({
      inventionName,
      contactPerson,
      applicationType,
      technicalField,
      techBackground,
      technicalSolution,
      beneficialEffects,
      protectionPoints,
    });

    const encodedFilename = encodeURIComponent(
      `专利交底书-${inventionName}.docx`,
    );

    return new Response(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error) {
    console.error("文档生成错误:", error);
    return new Response(JSON.stringify({ error: "文档生成失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
