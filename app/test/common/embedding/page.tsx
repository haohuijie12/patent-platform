"use client";

import { useState } from "react";
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
import { Sparkles, Copy, Eraser, Binary } from "lucide-react";
import { toast } from "sonner";
import { getEmbedding } from "@/lib/service/embedding";

export default function EmbeddingPage() {
  const [inputText, setInputText] = useState(
    "一种基于区块链的供应链金融数据存证方法",
  );
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!inputText) {
      toast.error("缺少输入文本", {
        description: "请输入需要转换的文本",
      });
      return;
    }

    setIsLoading(true);
    setEmbedding(null);

    try {
      const result = await getEmbedding(inputText);
      setEmbedding(result);
      toast.success("生成完成", {
        description: `成功生成 ${result.length} 维向量`,
      });
    } catch (error) {
      console.error(error);
      toast.error("生成出错", {
        description: "请检查控制台日志或稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!embedding) return;
    navigator.clipboard.writeText(JSON.stringify(embedding));
    toast.success("已复制", {
      description: "向量数据已复制到剪贴板",
    });
  };

  const handleClear = () => {
    setInputText("");
    setEmbedding(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight">Embedding 测试</h2>
        <Button variant="outline" onClick={handleClear} disabled={isLoading}>
          <Eraser className="mr-2 h-4 w-4" />
          清空重置
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* 左侧：输入区域 */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>输入文本</CardTitle>
            <CardDescription>
              输入需要转换为向量的文本内容，支持中文和英文。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="inputText">
                文本内容 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="inputText"
                placeholder="请输入文本..."
                className="min-h-[200px] resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
              />
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
                    <Binary className="mr-2 h-4 w-4" />
                    生成向量
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：输出区域 */}
        <Card className="flex flex-col h-full bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>向量结果</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!embedding || isLoading}
            >
              <Copy className="h-4 w-4 mr-2" />
              复制 JSON
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-6 pt-2">
            <div className="h-full rounded-md border bg-background p-4 overflow-y-auto shadow-sm">
              {embedding ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-2">
                    <span>维度: {embedding.length}</span>
                    <span>类型: float32[]</span>
                  </div>
                  <div className="font-mono text-xs break-all text-muted-foreground">
                    <p className="mb-2 text-foreground font-semibold">
                      前 10 维预览:
                    </p>
                    [{embedding.slice(0, 10).join(", ")}, ... ]
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-foreground font-semibold text-xs">
                      完整数据 (前 1000 字符):
                    </p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(embedding).slice(0, 1000)}
                      {JSON.stringify(embedding).length > 1000 && "..."}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                  <Binary className="h-12 w-12" />
                  <p>在左侧输入文本并点击生成...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
