"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
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
import ReactMarkdown from "react-markdown";

export default function TechnicalEffectGenerationPage() {
  const [technicalBackground, setTechnicalBackground] = useState(
    "随着区块链技术的快速发展，供应链金融领域对数据存证的需求日益增长。现有技术中，虽然已有多种解决方案，但仍存在以下问题：\n\n1. 数据易被篡改：中心化数据库存在单点故障风险，数据安全性不足；\n2. 信任成本高：多方协作需要建立复杂的信任机制；\n3. 隐私保护不足：敏感数据在传输和存储过程中存在泄露风险。",
  );
  const [technicalSolution, setTechnicalSolution] = useState(
    "本发明提出一种基于区块链的供应链金融数据存证方法，包括：\n\n1. 构建联盟链网络，实现多方参与的去中心化数据存储；\n2. 采用智能合约自动执行数据存证流程，确保流程透明可追溯；\n3. 引入零知识证明技术，在保护数据隐私的同时实现数据验证；\n4. 设计分层存储架构，将敏感数据加密存储在私有链，公开哈希存储在公有链。",
  );

  const { completion, complete, isLoading, stop, setCompletion } =
    useCompletion({
      api: "/api/disclosure/technical-effect-generation",
      streamProtocol: "text",
      onFinish: () => {
        toast.success("生成完成", {
          description: "技术效果已成功生成",
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
    if (!technicalBackground || !technicalSolution) {
      toast.error("缺少必要信息", {
        description: "请填写技术背景和技术方案",
      });
      return;
    }

    try {
      await complete("", {
        body: {
          technicalBackground,
          technicalSolution,
        },
      });
    } catch (error) {
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(completion);
    toast.success("已复制", {
      description: "内容已复制到剪贴板",
    });
  };

  const handleClear = () => {
    setTechnicalBackground("");
    setTechnicalSolution("");
    stop();
    setCompletion("");
  };

  const parseCompletion = (text: string) => {
    const beneficialEffectsMatch = text.match(/## 有益效果\s*\n([\s\S]*?)(?=## 技术关键点和欲保护点|$)/);
    const protectionPointsMatch = text.match(/## 技术关键点和欲保护点\s*\n([\s\S]*?)$/);

    return {
      beneficialEffects: beneficialEffectsMatch ? beneficialEffectsMatch[1].trim() : "",
      protectionPoints: protectionPointsMatch ? protectionPointsMatch[1].trim() : "",
    };
  };

  const { beneficialEffects, protectionPoints } = parseCompletion(completion);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight">“有益效果”和“预保护点”生成</h2>
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
              提供技术背景和技术方案，AI 将为您生成专业的有益效果和技术关键点。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="technicalBackground">
                技术背景 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="technicalBackground"
                placeholder="请输入技术背景，描述现有技术的发展现状和存在的问题..."
                className="min-h-[200px] resize-none"
                value={technicalBackground}
                onChange={(e) => setTechnicalBackground(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalSolution">
                技术方案 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="technicalSolution"
                placeholder="请输入技术方案，描述本发明的核心创新点和实现方式..."
                className="min-h-[200px] resize-none"
                value={technicalSolution}
                onChange={(e) => setTechnicalSolution(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                提示：技术方案描述越详细，生成的有益效果和技术关键点越准确。
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
        <div className="flex flex-col gap-4 h-full">
          {/* 有益效果 */}
          <Card className="flex-1 flex flex-col bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>有益效果</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!beneficialEffects || isLoading}
              >
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-6 pt-2">
              <div className="h-full rounded-md border bg-background p-4 overflow-y-auto shadow-sm">
                {beneficialEffects ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed">
                    <ReactMarkdown>{beneficialEffects}</ReactMarkdown>
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

          {/* 技术关键点和欲保护点 */}
          <Card className="flex-1 flex flex-col bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>技术关键点和欲保护点</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!protectionPoints || isLoading}
              >
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-6 pt-2">
              <div className="h-full rounded-md border bg-background p-4 overflow-y-auto shadow-sm">
                {protectionPoints ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed">
                    <ReactMarkdown>{protectionPoints}</ReactMarkdown>
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
