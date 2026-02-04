"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Plus,
  X,
  ImageIcon,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  BookOpen,
  Settings,
} from "lucide-react";

interface DisclosureWorkflowProps {
  fileName: string;
  onBack: () => void;
}

interface ContentBlock {
  id: string;
  type: "text" | "image";
  content: string;
  imageUrl?: string;
}

interface KeywordDefinition {
  term: string;
  definition: string;
}

interface AIWarning {
  type: "unclear" | "brief" | "image";
  message: string;
}

export function DisclosureWorkflow({
  fileName,
  onBack,
}: DisclosureWorkflowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: 基本信息
  const [inventionName, setInventionName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [applicationType, setApplicationType] = useState<
    "发明" | "实用新型" | ""
  >("");
  const [technicalField, setTechnicalField] = useState("");

  // Step 2: 技术背景
  const [techBackground, setTechBackground] = useState("");
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
  const [existingProblems, setExistingProblems] = useState("");

  // Step 3: 技术方案
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: "1", type: "text", content: "" },
  ]);
  const [isRewriting, setIsRewriting] = useState(false);
  const [optimizingBlockId, setOptimizingBlockId] = useState<string | null>(
    null,
  );
  const [keywords, setKeywords] = useState<KeywordDefinition[]>([]);
  const [aiWarnings, setAIWarnings] = useState<AIWarning[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4: 有益效果与保护点
  const [beneficialEffects, setBeneficialEffects] = useState("");
  const [protectionPoints, setProtectionPoints] = useState("");
  const [isGeneratingEffects, setIsGeneratingEffects] = useState(false);

  // Step 5: 预览
  const [documentGenerated, setDocumentGenerated] = useState(false);

  // 新增：优化相关状态
  const [optimizationType, setOptimizationType] = useState<string>("standard");
  const [optimizationStatus, setOptimizationStatus] = useState<{
    [key: string]: "idle" | "loading" | "success" | "error";
  }>({});

  // 生成技术背景
  const generateTechBackground = async () => {
    if (!inventionName.trim() || !technicalField.trim()) {
      alert("请先填写发明名称和技术领域");
      return;
    }

    setIsGeneratingBackground(true);
    
    try {
      setTechBackground("");
      
      const response = await fetch("/api/disclosure/background-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventionName,
          technicalField,
          existingProblems: existingProblems || "（未提供具体问题，请根据通用情况分析）",
        }),
      });

      if (!response.ok) {
        throw new Error("生成失败");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let generatedText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          generatedText += chunk;
          setTechBackground(generatedText);
        }
      }
      
    } catch (error) {
      console.error("生成技术背景失败:", error);
      alert("AI生成失败，请稍后重新点击生成按钮");
    } finally {
      setIsGeneratingBackground(false);
    }
  };

  // Auto-generate background when entering step 2 (现在改为手动生成，所以注释掉)
  // useEffect(() => {
  //   if (step === 2 && !techBackground && inventionName && technicalField) {
  //     generateTechBackground();
  //   }
  // }, [step]);

  // 添加内容块
  const addContentBlock = (type: "text" | "image") => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: "",
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  // 更新内容块
  const updateContentBlock = (id: string, content: string) => {
    setContentBlocks(
      contentBlocks.map((block) =>
        block.id === id ? { ...block, content } : block,
      ),
    );
  };

  // 删除内容块
  const deleteContentBlock = (id: string) => {
    if (contentBlocks.length > 1) {
      setContentBlocks(contentBlocks.filter((block) => block.id !== id));
    }
  };

  // 处理图片上传
  const handleImageUpload = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setContentBlocks(
        contentBlocks.map((block) =>
          block.id === id
            ? { ...block, imageUrl: url, content: file.name }
            : block,
        ),
      );
    }
  };

  // 单个文本块 AI 优化 - 调用真实API
  const handleOptimizeBlock = async (id: string, content: string) => {
    if (!content.trim()) {
      alert("请先输入要优化的内容");
      return;
    }

    setOptimizingBlockId(id);
    setOptimizationStatus(prev => ({
      ...prev,
      [id]: "loading"
    }));

    try {
      const response = await fetch("/api/disclosure/proposal-text-optimization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: content,
          optimizationType: optimizationType || "standard",
        }),
      });

      if (!response.ok) {
        throw new Error(`优化失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let optimizedText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          optimizedText += chunk;
        }
      }

      // 更新文本块内容
      setContentBlocks(prev =>
        prev.map((block) => {
          if (block.id === id && block.type === "text") {
            return {
              ...block,
              content: optimizedText,
            };
          }
          return block;
        })
      );

      setOptimizationStatus(prev => ({
        ...prev,
        [id]: "success"
      }));

    } catch (error) {
      console.error("文本块优化失败:", error);
      setOptimizationStatus(prev => ({
        ...prev,
        [id]: "error"
      }));
      alert("文本优化失败，请稍后重新点击优化按钮");
    } finally {
      setOptimizingBlockId(null);
    }
  };

  // AI 风格化改写
  const handleAIRewrite = async () => {
    // 收集所有文本块内容
    const textBlocks = contentBlocks
      .filter((b) => b.type === "text" && b.content.trim())
      .map((b) => ({ id: b.id, content: b.content }));

    if (textBlocks.length === 0) {
      alert("请先输入技术方案内容");
      return;
    }

    setIsRewriting(true);

    try {
      // 逐个优化文本块
      for (const block of textBlocks) {
        await handleOptimizeBlock(block.id, block.content);
      }

      // 模拟识别专有词汇
      const suggestedKeywords = [
        {
          term: "技术方案",
          definition: "指为解决特定技术问题而采用的技术手段的集合",
        },
        { term: "实施例", definition: "指发明创造的具体实现方式" },
        { term: "权利要求", definition: "指专利申请人请求专利保护的技术范围" },
      ];

      // 合并已有关键词和新关键词
      const mergedKeywords = [...keywords];
      suggestedKeywords.forEach((newKw) => {
        if (!mergedKeywords.some((kw) => kw.term === newKw.term)) {
          mergedKeywords.push(newKw);
        }
      });
      setKeywords(mergedKeywords);

      // AI检测问题
      const warnings: AIWarning[] = [];
      const totalText = textBlocks.map((b) => b.content).join("");

      if (totalText.length < 100) {
        warnings.push({
          type: "brief",
          message: "技术方案描述过于简略，建议补充更多技术细节",
        });
      }

      const imageBlocks = contentBlocks.filter((b) => b.type === "image");
      if (imageBlocks.some((b) => !b.imageUrl)) {
        warnings.push({
          type: "image",
          message: "存在未上传图片的图片区块，请检查",
        });
      }

      if (totalText.includes("等") || totalText.includes("之类")) {
        warnings.push({
          type: "unclear",
          message: "文中存在模糊表述（如'等'、'之类'），建议明确具体内容",
        });
      }

      setAIWarnings(warnings);
    } catch (error) {
      console.error("AI优化失败:", error);
      alert("AI优化失败，请稍后重试");
    } finally {
      setIsRewriting(false);
    }
  };

  // 关键词管理
  const addKeyword = () => {
    setKeywords([...keywords, { term: "", definition: "" }]);
  };

  const updateKeyword = (
    index: number,
    field: keyof KeywordDefinition,
    value: string,
  ) => {
    const newKeywords = [...keywords];
    newKeywords[index] = { ...newKeywords[index], [field]: value };
    setKeywords(newKeywords);
  };

  const deleteKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  // 生成有益效果
  const generateBeneficialEffects = () => {
    setIsGeneratingEffects(true);
    setTimeout(() => {
      setBeneficialEffects(`本发明技术方案具有以下有益效果：

1. 提高了${technicalField}领域的技术效率，相比现有技术提升显著；
2. 降低了实施成本，使技术方案更易于推广应用；
3. 改善了用户体验，操作更加便捷、可靠；
4. 具有良好的扩展性，可适应不同应用场景的需求。`);

      setProtectionPoints(`本发明的技术关键点和欲保护点包括：

1. ${inventionName}的核心技术架构及其实现方法；
2. 关键技术模块的创新设计及优化方案；
3. 技术方案中涉及的数据处理方法和流程；
4. 系统整体的协同工作机制和控制策略。`);

      setIsGeneratingEffects(false);
    }, 1500);
  };

  // Auto-generate effects when entering step 4 (现在改为手动生成，所以注释掉)
  // useEffect(() => {
  //   if (step === 4 && !beneficialEffects && !protectionPoints) {
  //     generateBeneficialEffects();
  //   }
  // }, [step]);

  // 生成交底书
  const handleGenerateDocument = () => {
    setStep(5);
    setDocumentGenerated(true);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              专利交底书
            </h1>
            <p className="text-sm text-muted-foreground">
              AI 辅助制作专利交底书
            </p>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "基本信息" },
            { num: 2, label: "技术背景" },
            { num: 3, label: "技术方案" },
            { num: 4, label: "有益效果" },
            { num: 5, label: "生成文档" },
          ].map((s, index) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    step >= s.num
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-muted-foreground",
                  )}
                >
                  {step > s.num ? <CheckCircle className="h-4 w-4" /> : s.num}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    step >= s.num ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {index < 4 && (
                <div
                  className={cn(
                    "mx-4 h-0.5 w-16 transition-colors",
                    step > s.num ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl">
          {/* Step 1: 基本信息 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  填写基本信息
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      发明名称 *
                    </label>
                    <input
                      type="text"
                      value={inventionName}
                      onChange={(e) => setInventionName(e.target.value)}
                      placeholder="请输入发明创造的名称"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        联系人 *
                      </label>
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="请输入联系人姓名"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground outline-none transition-colors focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        申请类型 *
                      </label>
                      <div className="flex h-[42px] items-center gap-4">
                        {["发明", "实用新型"].map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={applicationType === type}
                              onChange={() =>
                                setApplicationType(type as "发明" | "实用新型")
                              }
                              className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-foreground">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      技术领域 *
                    </label>
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="text-sm">
                        本发明创造技术方案所属技术领域为
                      </span>
                      <input
                        type="text"
                        value={technicalField}
                        onChange={(e) => setTechnicalField(e.target.value)}
                        placeholder="请填写技术领域"
                        className="flex-1 border-b-2 border-dashed border-primary bg-transparent px-2 py-1 text-sm outline-none focus:border-solid"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 技术背景 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    本发明技术背景
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => generateTechBackground()}
                      disabled={isGeneratingBackground}
                      className="gap-2 bg-transparent"
                    >
                      <Sparkles className="h-4 w-4" />
                      AI生成
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => generateTechBackground()}
                      disabled={isGeneratingBackground}
                      className="gap-2 bg-transparent"
                    >
                      <RefreshCw
                        className={cn(
                          "h-4 w-4",
                          isGeneratingBackground && "animate-spin",
                        )}
                      />
                      重新生成
                    </Button>
                  </div>
                </div>

                <p className="mb-4 text-sm text-muted-foreground">
                  基于发明名称"{inventionName}"和技术领域"{technicalField}
                  "，AI将为您生成专业的技术背景
                </p>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    现有技术问题（可选）
                  </label>
                  <textarea
                    value={existingProblems}
                    onChange={(e) => setExistingProblems(e.target.value)}
                    placeholder="请描述现有技术存在的问题..."
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary resize-none"
                  />
                </div>

                {isGeneratingBackground ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">AI正在思考...</p>
                  </div>
                ) : (
                  <textarea
                    value={techBackground}
                    onChange={(e) => setTechBackground(e.target.value)}
                    placeholder="点击'AI生成'按钮开始生成技术背景"
                    rows={12}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary resize-none"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 3: 技术方案 */}
          {step === 3 && (
            <div className="space-y-6">
              {/* 优化类型选择器 */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">优化设置</h3>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    优化类型
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { value: "standard", label: "标准优化", desc: "平衡专业性和可读性" },
                      { value: "detailed", label: "详细优化", desc: "增加技术细节和实施方式" },
                      { value: "concise", label: "简明优化", desc: "提炼核心，简洁表达" },
                      { value: "legal", label: "法律优化", desc: "强化法律保护角度表述" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setOptimizationType(option.value)}
                        className={cn(
                          "rounded-lg border p-3 text-left transition-colors",
                          optimizationType === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary"
                        )}
                      >
                        <div className="font-medium text-foreground">
                          {option.label}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    本发明的技术方案
                  </h2>
                </div>

                <p className="mb-4 text-sm text-muted-foreground">
                  请详细描述您的技术方案，可以添加文字说明和配图。AI
                  将帮助您优化表述并识别专有词汇。
                </p>

                <div className="space-y-4">
                  {contentBlocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="group relative rounded-lg border border-border bg-background p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          {block.type === "text"
                            ? `文本块 ${index + 1}`
                            : `图片 ${index + 1}`}
                        </span>
                        {contentBlocks.length > 1 && (
                          <button
                            onClick={() => deleteContentBlock(block.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {block.type === "text" ? (
                        <div className="relative">
                          <textarea
                            value={block.content}
                            onChange={(e) =>
                              updateContentBlock(block.id, e.target.value)
                            }
                            placeholder="请输入技术方案的详细描述..."
                            rows={6}
                            className="w-full resize-none rounded border border-border bg-background px-3 py-2 pb-14 text-sm text-foreground outline-none transition-colors focus:border-primary"
                          />
                          <div className="absolute bottom-4 right-2 flex items-center gap-2">
                            {optimizationStatus[block.id] === "loading" && (
                              <div className="flex items-center gap-1 text-xs text-blue-500">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                优化中...
                              </div>
                            )}
                            {optimizationStatus[block.id] === "success" && (
                              <div className="flex items-center gap-1 text-xs text-green-500">
                                <CheckCircle className="h-3 w-3" />
                                已优化
                              </div>
                            )}
                            {optimizationStatus[block.id] === "error" && (
                              <div className="flex items-center gap-1 text-xs text-red-500">
                                <AlertTriangle className="h-3 w-3" />
                                失败
                              </div>
                            )}
                            
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 gap-1 text-xs"
                              onClick={() => handleOptimizeBlock(block.id, block.content)}
                              disabled={optimizingBlockId === block.id || !block.content.trim()}
                            >
                              <Sparkles
                                className={cn(
                                  "h-3 w-3",
                                  optimizingBlockId === block.id && "animate-pulse",
                                )}
                              />
                              {optimizingBlockId === block.id
                                ? "优化中..."
                                : "AI 优化"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {block.imageUrl ? (
                            <div className="relative">
                              <img
                                src={block.imageUrl || "/placeholder.svg"}
                                alt={block.content}
                                className="max-h-64 rounded-lg object-contain"
                              />
                              <p className="mt-2 text-sm text-muted-foreground">
                                {block.content}
                              </p>
                            </div>
                          ) : (
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-8 transition-colors hover:border-primary">
                              <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                点击上传图片
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(block.id, e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => addContentBlock("text")}
                      className="gap-2 bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                      添加文本
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => addContentBlock("image")}
                      className="gap-2 bg-transparent"
                    >
                      <ImageIcon className="h-4 w-4" />
                      添加图片
                    </Button>
                  </div>
                  <Button
                    onClick={handleAIRewrite}
                    disabled={isRewriting}
                    className="gap-2"
                  >
                    <Sparkles
                      className={cn("h-4 w-4", isRewriting && "animate-pulse")}
                    />
                    {isRewriting ? "AI 处理中..." : "AI 优化全部"}
                  </Button>
                </div>
              </div>

              {aiWarnings.length > 0 && (
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <h3 className="font-medium text-amber-700 dark:text-amber-400">
                      AI 检测到以下问题
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {aiWarnings.map((warning, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400"
                      >
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                        {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">关键词表</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addKeyword}
                    className="gap-2 text-primary hover:text-primary/80"
                  >
                    <Plus className="h-4 w-4" />
                    添加关键词
                  </Button>
                </div>

                {keywords.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full">
                      <thead className="bg-accent/50">
                        <tr>
                          <th className="border-b border-border px-4 py-2 text-left text-sm font-semibold text-foreground w-1/3">
                            术语
                          </th>
                          <th className="border-b border-border px-4 py-2 text-left text-sm font-semibold text-foreground">
                            释义
                          </th>
                          <th className="border-b border-border px-4 py-2 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {keywords.map((kw, index) => (
                          <tr
                            key={index}
                            className="border-b border-border last:border-0"
                          >
                            <td className="p-2">
                              <input
                                type="text"
                                value={kw.term}
                                onChange={(e) =>
                                  updateKeyword(index, "term", e.target.value)
                                }
                                placeholder="输入术语"
                                className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm text-foreground hover:border-border focus:border-primary focus:bg-background focus:outline-none"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={kw.definition}
                                onChange={(e) =>
                                  updateKeyword(
                                    index,
                                    "definition",
                                    e.target.value,
                                  )
                                }
                                placeholder="输入释义"
                                className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm text-foreground hover:border-border focus:border-primary focus:bg-background focus:outline-none"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => deleteKeyword(index)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      暂无关键词，点击右上角添加或等待 AI 自动生成
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: 有益效果与保护点 */}
          {step === 4 && (
            <div className="space-y-6">
              {isGeneratingEffects ? (
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">
                      正在生成有益效果与保护点...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-border bg-card p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-foreground">
                        本发明技术方案带来的有益效果
                      </h2>
                      <Button
                        variant="outline"
                        onClick={generateBeneficialEffects}
                        disabled={isGeneratingEffects}
                        className="gap-2 bg-transparent"
                      >
                        <Sparkles className="h-4 w-4" />
                        AI生成
                      </Button>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      基于技术背景和技术方案，AI将为您生成有益效果
                    </p>
                    <textarea
                      value={beneficialEffects}
                      onChange={(e) => setBeneficialEffects(e.target.value)}
                      placeholder="点击'AI生成'按钮开始生成有益效果"
                      rows={8}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary resize-none"
                    />
                  </div>

                  <div className="rounded-lg border border-border bg-card p-6">
                    <h2 className="mb-4 text-xl font-semibold text-foreground">
                      本发明的技术关键点和欲保护点
                    </h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                      AI已基于技术方案自动识别关键点
                    </p>
                    <textarea
                      value={protectionPoints}
                      onChange={(e) => setProtectionPoints(e.target.value)}
                      placeholder="点击上方'AI生成'按钮后会自动生成"
                      rows={8}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: 预览 */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    专利交底书预览
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                      一、基本信息
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">
                          发明名称：
                        </span>
                        {inventionName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">联系人：</span>
                        {contactPerson}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          申请类型：
                        </span>
                        {applicationType}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          技术领域：
                        </span>
                        本发明创造技术方案所属技术领域为{technicalField}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-background p-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                      二、本发明技术背景
                    </h3>
                    <div className="whitespace-pre-wrap text-sm text-foreground">
                      {techBackground}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-background p-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                      三、本发明的技术方案
                    </h3>
                    <div className="space-y-4">
                      {contentBlocks.map((block, index) => (
                        <div key={block.id}>
                          {block.type === "text" ? (
                            <div className="whitespace-pre-wrap text-sm text-foreground">
                              {block.content}
                            </div>
                          ) : block.imageUrl ? (
                            <div className="space-y-2">
                              <img
                                src={block.imageUrl || "/placeholder.svg"}
                                alt={block.content}
                                className="max-h-64 rounded-lg object-contain"
                              />
                              <p className="text-sm text-muted-foreground">
                                图 {index + 1}：{block.content}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    {keywords.length > 0 && (
                      <div className="mt-6">
                        <h4 className="mb-2 text-sm font-medium text-foreground">
                          关键词表
                        </h4>
                        <div className="overflow-hidden rounded border border-border">
                          <table className="w-full text-sm">
                            <thead className="bg-accent/50">
                              <tr>
                                <th className="border-b border-border px-3 py-1.5 text-left font-medium">
                                  术语
                                </th>
                                <th className="border-b border-border px-3 py-1.5 text-left font-medium">
                                  释义
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {keywords.map((kw, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-border"
                                >
                                  <td className="px-3 py-1.5">{kw.term}</td>
                                  <td className="px-3 py-1.5 text-muted-foreground">
                                    {kw.definition}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-border bg-background p-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                      四、本发明技术方案带来的有益效果
                    </h3>
                    <div className="whitespace-pre-wrap text-sm text-foreground">
                      {beneficialEffects}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-background p-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                      五、本发明的技术关键点和欲保护点
                    </h3>
                    <div className="whitespace-pre-wrap text-sm text-foreground">
                      {protectionPoints}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      {step <= 5 && (
        <footer className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
          <div>
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((step - 1) as any)}
                className="gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                上一步
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 5 ? (
              <Button
                onClick={() => {
                  if (step === 4) {
                    handleGenerateDocument();
                  } else {
                    setStep((step + 1) as any);
                  }
                }}
                disabled={
                  (step === 1 &&
                    (!inventionName.trim() ||
                      !contactPerson.trim() ||
                      !applicationType ||
                      !technicalField.trim())) ||
                  (step === 2 && !techBackground.trim()) ||
                  (step === 3 &&
                    contentBlocks.filter(
                      (b) => b.type === "text" && b.content.trim(),
                    ).length === 0) ||
                  (step === 4 &&
                    (!beneficialEffects.trim() || !protectionPoints.trim()))
                }
                className="gap-2"
              >
                下一步
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                下载 Word 版本
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}