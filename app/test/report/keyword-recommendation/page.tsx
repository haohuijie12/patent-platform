"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Sparkles, Copy, Eraser, Search } from "lucide-react";
import { toast } from "sonner";

export default function KeywordRecommendationPage() {
  const [coreKeyword, setCoreKeyword] = useState("人工智能");
  const [desiredCount, setDesiredCount] = useState(5);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRecommend = async () => {
    if (!coreKeyword.trim()) {
      toast.error("缺少必要信息", {
        description: "请输入核心关键词",
      });
      return;
    }

    setLoading(true);
    setRecommendations([]);

    try {
      // 使用 POST 请求，与后端 API 保持一致
      const response = await fetch("/api/report/keyword-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coreKeyword,
          desiredCount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.data.recommendations);
        toast.success("推荐完成", {
          description: `成功生成 ${data.data.recommendations.length} 个关联词`,
        });
      } else {
        throw new Error(data.error || "推荐失败");
      }
    } catch (err: any) {
      console.error("请求出错:", err);
      toast.error("生成出错", {
        description: err.message || "网络或服务器错误",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (recommendations.length === 0) return;
    navigator.clipboard.writeText(recommendations.join("、"));
    toast.success("已复制", {
      description: "推荐结果已复制到剪贴板",
    });
  };

  const handleClear = () => {
    setCoreKeyword("人工智能");
    setDesiredCount(5);
    setRecommendations([]);
    toast.info("已重置", {
      description: "输入内容已清空",
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight">关键词推荐</h2>
        <Button variant="outline" onClick={handleClear} disabled={loading}>
          <Eraser className="mr-2 h-4 w-4" />
          清空重置
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* 左侧：输入区域 */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>设置条件</CardTitle>
            <CardDescription>
              输入核心关键词，AI 将为您推荐相关的专利检索关键词。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="coreKeyword">
                核心关键词 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="coreKeyword"
                placeholder="例如：智能座舱"
                value={coreKeyword}
                onChange={(e) => setCoreKeyword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredCount">期望推荐数量</Label>
              <Input
                id="desiredCount"
                type="number"
                min="1"
                max="20"
                value={desiredCount}
                onChange={(e) => setDesiredCount(Number(e.target.value))}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                建议设置在 5-10 个之间，过多可能会降低相关性。
              </p>
            </div>

            <div className="pt-4">
              <Button
                className="w-full"
                onClick={handleRecommend}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    正在推荐...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    开始推荐
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：输出区域 */}
        <Card className="flex flex-col h-full bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>推荐结果</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={recommendations.length === 0 || loading}
            >
              <Copy className="h-4 w-4 mr-2" />
              复制
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-6 pt-2">
            <div className="h-full rounded-md border bg-background p-4 overflow-y-auto shadow-sm">
              {recommendations.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {recommendations.map((word, index) => (
                      <div
                        key={index}
                        className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm font-medium border border-border"
                      >
                        {word}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      组合结果（可直接复制）：
                    </p>
                    <div className="p-3 bg-muted rounded-md text-sm break-all font-mono">
                      {recommendations.join("、")}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                  <Search className="h-12 w-12" />
                  <p>在左侧输入关键词并点击推荐...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
