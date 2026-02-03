"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Sparkles, Copy, Eraser } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function BackgroundGenerationPage() {
  const [techSolution, setTechSolution] = useState(
    "本发明公开了一种高安全性的锂离子电池电解液及锂离子电池。所述电解液包括非水有机溶剂、锂盐和添加剂；所述添加剂包括氟代碳酸乙烯酯（FEC）和二氟磷酸锂（LiPO2F2）。本发明通过在电解液中添加特定比例的FEC和LiPO2F2，能够在负极表面形成致密且稳定的SEI膜，抑制电解液的分解，同时在正极表面形成保护膜，减少正极材料中过渡金属离子的溶出，从而显著提高锂离子电池的循环稳定性和高温存储性能，解决了现有高镍三元锂离子电池在高温下循环寿命衰减快、产气严重的问题。",
  );

  const { completion, complete, isLoading, stop, setCompletion } =
    useCompletion({
      api: "/api/disclosure/explanation-of-keywords",
      streamProtocol: "text",
      onFinish: () => {
        toast.success("生成完成", {
          description: "关键词解释已成功生成",
        });
      },
      onError: (error: Error) => {
        console.error(error);
        toast.error("生成出错", {
          description: "请稍后重试",
        });
      },
    });

  const handleGenerate = async () => {
    if (!techSolution) {
      toast.error("缺少必要信息", {
        description: "请填写技术方案",
      });
      return;
    }

    try {
      await complete("", {
        body: {
          techSolution,
        },
      });
    } catch (error) {
      // Error is handled in onError
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(completion);
    toast.success("已复制", {
      description: "内容已复制到剪贴板",
    });
  };

  const renderCompletion = () => {
    if (!completion) return null;

    try {
      // 尝试解析 JSON，如果还没生成完或者格式不对，直接显示原文
      // 注意：流式传输过程中，JSON 可能是不完整的，这里做一个简单的容错处理
      // 只有当看起来像完整的 JSON 时才尝试解析渲染
      if (completion.trim().endsWith("}")) {
        const data = JSON.parse(completion);
        if (data.keywords && Array.isArray(data.keywords)) {
          return (
            <div className="overflow-hidden rounded border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-accent/50">
                    <tr>
                      <th className="border-b border-border px-3 py-1.5 text-left font-medium w-1/4">
                        术语
                      </th>
                      <th className="border-b border-border px-3 py-1.5 text-left font-medium">
                        释义
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.keywords.map(
                      (
                        item: { term: string; explanation: string },
                        index: number,
                      ) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="px-3 py-1.5 align-top font-medium">{item.term}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">
                            {item.explanation}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
            </div>
          );
        }
      }
    } catch (e) {
      // 解析失败，回退到 Markdown 渲染
    }

    return (
      <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed">
        <ReactMarkdown>{completion}</ReactMarkdown>
      </div>
    );
  };

  const handleClear = () => {
    setTechSolution("");
    stop();
    setCompletion("");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight">关键词解释</h2>
        <Button variant="outline" onClick={handleClear} disabled={isLoading}>
          <Eraser className="mr-2 h-4 w-4" />
          清空重置
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* 左侧：输入区域 */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>输入信息</CardTitle>
            <CardDescription>
              提供发明的技术方案，AI 将为您提取关键术语并进行解释。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="techSolution">
                技术方案 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="techSolution"
                placeholder="请输入详细的技术方案描述..."
                className="h-[400px] resize-none"
                value={techSolution}
                onChange={(e) => setTechSolution(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                提示：详细描述您的技术方案，AI 将为您提取关键术语并进行解释。
              </p>
            </div>

            <div className="pt-4">
              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    正在生成...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始生成
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：输出区域 */}
        <Card className="flex flex-col h-full bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>生成结果</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!completion || isLoading}
            >
              <Copy className="h-4 w-4 mr-2" />
              复制
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-6 pt-2">
            <div className="h-full rounded-md border bg-background p-0 overflow-y-auto shadow-sm">
              {completion ? (
                renderCompletion()
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                  <Sparkles className="h-12 w-12" />
                  <p>在左侧填写信息并点击生成...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
