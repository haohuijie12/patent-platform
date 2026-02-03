"use client";

import { useState, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Copy,
  Eraser,
  History,
  Zap,
  FileText,
  Scale,
} from "lucide-react";
import { toast } from "sonner";

export default function ProposalTextOptimizationPage() {
  // 状态管理
  const [originalText, setOriginalText] = useState(
    `本发明提供一种基于深度学习的图像识别方法。该方法包括：首先通过摄像头采集图像，然后使用神经网络进行处理，最后输出识别结果。系统能够识别多种物体，具有较高的准确率。`,
  );

  const [optimizationType, setOptimizationType] = useState("standard");
  const [history, setHistory] = useState<
    Array<{ original: string; optimized: string; type: string }>
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AI 完成钩子
  const { completion, complete, isLoading, stop, setCompletion } =
    useCompletion({
      api: "/api/disclosure/proposal-text-optimization",
      streamProtocol: "text",
      onFinish: () => {
        toast.success("优化完成", {
          description: "技术方案已成功优化",
        });
        // 保存到历史记录
        if (completion) {
          setHistory((prev) => [
            {
              original: originalText,
              optimized: completion,
              type: optimizationType,
            },
            ...prev.slice(0, 9),
          ]); // 只保留最近10条
        }
      },
      onError: (error: Error) => {
        console.error(error);
        toast.error("优化出错", {
          description: error.message || "请稍后重试",
        });
      },
    });

  // 处理生成
  const handleOptimize = async () => {
    if (!originalText.trim()) {
      toast.error("请输入内容", {
        description: "请填写需要优化的技术方案文本",
      });
      return;
    }

    if (originalText.length < 10) {
      toast.error("文本过短", {
        description: "请提供更详细的技术方案描述",
      });
      return;
    }

    try {
      await complete("", {
        body: {
          text: originalText,
          optimizationType,
        },
      });
    } catch (error) {
      // Error is handled in onError
    }
  };

  // 处理复制
  const handleCopy = () => {
    if (!completion) return;
    navigator.clipboard.writeText(completion);
    toast.success("已复制", {
      description: "优化后的内容已复制到剪贴板",
    });
  };

  // 清空所有内容
  const handleClear = () => {
    setOriginalText("");
    stop();
    setCompletion("");
  };

  // 清空输出
  const handleClearOutput = () => {
    setCompletion("");
  };

  // 从历史记录恢复
  const handleRestoreFromHistory = (index: number) => {
    const item = history[index];
    setOriginalText(item.original);
    setOptimizationType(item.type);
    setCompletion(item.optimized);
    toast.info("已恢复", {
      description: "已从历史记录恢复",
    });
  };

  // 优化类型描述
  const optimizationTypes = [
    {
      value: "standard",
      label: "标准优化",
      icon: <FileText className="h-4 w-4" />,
      description: "平衡专业性和可读性",
    },
    {
      value: "detailed",
      label: "详细优化",
      icon: <Sparkles className="h-4 w-4" />,
      description: "增加技术细节和实施方式",
    },
    {
      value: "concise",
      label: "简明优化",
      icon: <Zap className="h-4 w-4" />,
      description: "提炼核心，简洁表达",
    },
    {
      value: "legal",
      label: "法律优化",
      icon: <Scale className="h-4 w-4" />,
      description: "强化法律保护角度",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-7xl mx-auto w-full min-h-[calc(100vh-6rem)]">
      {/* 标题栏 */}
      <div className="flex items-center justify-between space-y-2 mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            专利技术方案优化
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            基于AI对专利交底书技术方案进行专业优化，提升专利质量
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClearOutput}
            disabled={!completion}
          >
            <Eraser className="mr-2 h-4 w-4" />
            清空输出
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={isLoading}>
            <Eraser className="mr-2 h-4 w-4" />
            清空全部
          </Button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* 左侧：输入区域 */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>原始技术方案</CardTitle>
            <CardDescription>
              输入需要优化的专利技术方案文本，选择合适的优化方式
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {/* 优化类型选择 */}
            <div className="space-y-2">
              <Label htmlFor="optimizationType">优化方式</Label>
              <Select
                value={optimizationType}
                onValueChange={setOptimizationType}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择优化方式" />
                </SelectTrigger>
                <SelectContent>
                  {optimizationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <div>
                          <div>{type.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 文本输入区域 */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="originalText">
                技术方案文本 <span className="text-red-500">*</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({originalText.length} 字符)
                </span>
              </Label>
              <Textarea
                ref={textareaRef}
                id="originalText"
                placeholder="请输入专利技术方案文本，描述本发明的技术特征、结构、原理等..."
                className="min-h-[300px] resize-y font-mono text-sm"
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <div>建议输入100-2000字符</div>
                <div className="space-x-2">
                  <button
                    type="button"
                    className="hover:text-primary"
                    onClick={() =>
                      setOriginalText(
                        (prev) => prev + "\n\n技术方案包括以下步骤：",
                      )
                    }
                  >
                    +步骤
                  </button>
                  <button
                    type="button"
                    className="hover:text-primary"
                    onClick={() =>
                      setOriginalText(
                        (prev) => prev + "\n\n本发明具有以下优点：",
                      )
                    }
                  >
                    +优点
                  </button>
                </div>
              </div>
            </div>

            {/* 生成按钮 */}
            <div className="pt-2">
              <Button
                className="w-full"
                onClick={handleOptimize}
                disabled={isLoading || !originalText.trim()}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    正在优化中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    开始优化
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                基于DeepSeek模型进行专业优化
              </p>
            </div>

            {/* 历史记录 */}
            {history.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <Label>最近优化记录</Label>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {history.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-xs h-auto py-1"
                      onClick={() => handleRestoreFromHistory(index)}
                    >
                      <div className="truncate text-left">
                        <div className="font-medium">
                          {
                            optimizationTypes.find((t) => t.value === item.type)
                              ?.label
                          }
                        </div>
                        <div className="truncate text-muted-foreground">
                          {item.original.substring(0, 50)}...
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右侧：输出区域 */}
        <Card className="flex flex-col bg-gradient-to-b from-muted/20 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle>优化结果</CardTitle>
              <CardDescription className="mt-1">
                AI优化后的技术方案
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {completion && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!completion}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    复制
                  </Button>
                  <div className="text-xs text-muted-foreground self-center">
                    {completion.length} 字符
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="h-full rounded-lg border bg-background/50 p-4 shadow-sm">
              {completion ? (
                <div className="space-y-4">
                  {/* 优化信息 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`px-2 py-1 rounded-md text-xs ${
                          optimizationType === "legal"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            : optimizationType === "detailed"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : optimizationType === "concise"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {
                          optimizationTypes.find(
                            (t) => t.value === optimizationType,
                          )?.label
                        }
                      </div>
                      <div className="text-muted-foreground">AI优化完成</div>
                    </div>
                    <div className="text-muted-foreground">
                      字符数: {completion.length}
                    </div>
                  </div>

                  {/* 优化内容 */}
                  <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed whitespace-pre-wrap">
                    {completion}
                  </div>

                  {/* 优化建议 */}
                  <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg border">
                    <div className="font-medium mb-1">优化说明：</div>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>已标准化技术术语和法律术语</li>
                      <li>已完善技术特征描述</li>
                      <li>已优化逻辑层次结构</li>
                      <li>已突出创新点和优势</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 p-8">
                  <div className="relative">
                    <Sparkles className="h-16 w-16 text-muted-foreground/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-medium">等待输入</p>
                    <p className="text-sm max-w-sm">
                      在左侧输入专利技术方案文本，选择优化方式，点击"开始优化"按钮
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs max-w-sm">
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <div className="font-medium">标准优化</div>
                      <div className="text-muted-foreground">
                        平衡专业与可读
                      </div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <div className="font-medium">法律优化</div>
                      <div className="text-muted-foreground">强化保护角度</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium">1. 输入文本</div>
              <div className="text-muted-foreground">
                输入需要优化的技术方案
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">2. 选择方式</div>
              <div className="text-muted-foreground">根据需求选择优化类型</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">3. 开始优化</div>
              <div className="text-muted-foreground">AI自动优化技术方案</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">4. 复制结果</div>
              <div className="text-muted-foreground">复制优化后的文本使用</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
