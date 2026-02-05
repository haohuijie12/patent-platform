"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function ConclusionGenerationPage() {
  const [searchTopic, setSearchTopic] = useState("电动汽车电池热管理技术");
  const [searchResults, setSearchResults] = useState(
    "检索到相关专利150篇，其中发明专利120篇，实用新型30篇",
  );
  const [keyPatentAnalysis, setKeyPatentAnalysis] = useState(
    "核心专利主要分布在特斯拉、宁德时代等公司，关键技术包括液冷系统、相变材料等",
  );
  const [patentMap, setPatentMap] = useState(
    "技术分布集中在热管理控制系统、冷却介质、电池包结构",
  );
  const [innovationAssessment, setInnovationAssessment] = useState(
    "目标技术具有中等创新性，存在一定的专利壁垒",
  );

  const { completion, complete, isLoading, stop, setCompletion } =
    useCompletion({
      api: "/api/report/conclusion-generation",
      streamProtocol: "text",
      onFinish: () => {
        toast.success("生成完成", {
          description: "报告结论已成功生成",
        });
      },
      onError: (error: Error) => {
        console.error(error);
        toast.error("生成出错", {
          description: "请稍后重试",
        });
      },
    });

  async function handleGenerate() {
    if (!searchTopic || !searchResults || !keyPatentAnalysis) {
      toast.error("缺少必要信息", {
        description: "请填写检索主题、检索结果和关键专利分析",
      });
      return;
    }

    try {
      await complete("", {
        body: {
          searchTopic,
          searchResults,
          keyPatentAnalysis,
          patentMap,
          innovationAssessment,
        },
      });
    } catch (err) {
      // Error is handled in onError
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(completion);
    toast.success("已复制", {
      description: "内容已复制到剪贴板",
    });
  };

  const handleClear = () => {
    setSearchTopic("");
    setSearchResults("");
    setKeyPatentAnalysis("");
    setPatentMap("");
    setInnovationAssessment("");
    stop();
    setCompletion("");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)]">
        <div className="flex items-center justify-between space-y-2 mb-2">
          <h2 className="text-3xl font-bold tracking-tight">报告结论生成</h2>
          <Button variant="outline" onClick={handleClear} disabled={isLoading}>
            <Eraser className="mr-2 h-4 w-4" />
            清空重置
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>输入信息</CardTitle>
              <CardDescription>
                提供专利检索的相关信息，AI 将为您生成专业的报告结论与建议。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="searchTopic">
                  检索主题 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="searchTopic"
                  placeholder="例如：电动汽车电池热管理技术"
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchResults">
                  检索结果概述 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="searchResults"
                  placeholder="简要描述检索到的专利数量、类型分布等"
                  className="min-h-[100px] resize-none"
                  value={searchResults}
                  onChange={(e) => setSearchResults(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyPatentAnalysis">
                  关键专利分析 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="keyPatentAnalysis"
                  placeholder="分析核心专利的分布情况、关键技术等"
                  className="min-h-[100px] resize-none"
                  value={keyPatentAnalysis}
                  onChange={(e) => setKeyPatentAnalysis(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patentMap">专利地图/技术分布</Label>
                <Textarea
                  id="patentMap"
                  placeholder="描述技术分布情况"
                  className="min-h-[80px] resize-none"
                  value={patentMap}
                  onChange={(e) => setPatentMap(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="innovationAssessment">创新点评估</Label>
                <Textarea
                  id="innovationAssessment"
                  placeholder="评估目标技术的创新程度和专利壁垒"
                  className="min-h-[80px] resize-none"
                  value={innovationAssessment}
                  onChange={(e) => setInnovationAssessment(e.target.value)}
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
                      <Sparkles className="mr-2 h-4 w-4" />
                      开始生成
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

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
              <div className="h-full rounded-md border bg-background p-4 overflow-y-auto shadow-sm">
                {completion ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed">
                    <ReactMarkdown>{completion}</ReactMarkdown>
                  </div>
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
    </div>
  );
}
