"use client";

import React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  ImageIcon,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Step1BasicInfo } from "@/components/workflows/disclosure-workflow/step-components/Step1BasicInfo";
import { Step2TechBackground } from "@/components/workflows/disclosure-workflow/step-components/Step2TechBackground";
import { Step3TechSolution } from "@/components/workflows/disclosure-workflow/step-components/Step3TechSolution";
import { Step4Benefits } from "@/components/workflows/disclosure-workflow/step-components/Step4Benefits";
import { Step5Preview } from "@/components/workflows/disclosure-workflow/step-components/Step5Preview";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4: 有益效果与保护点
  const [beneficialEffects, setBeneficialEffects] = useState("");
  const [protectionPoints, setProtectionPoints] = useState("");
  const [isGeneratingEffects, setIsGeneratingEffects] = useState(false);

  // 获取技术方案文本
  const getTechSolutionText = () => {
    return contentBlocks
      .filter((block) => block.type === "text")
      .map((block) => block.content)
      .join("\n");
  };

  // 通用流式API调用
  const callStreamAPI = async (
    url: string, 
    body: any, 
    onProgress?: (chunk: string) => void
  ) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("API调用失败");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        result += chunk;
        onProgress?.(chunk);
      }
    }

    return result;
  };

  // 生成技术背景
  const generateTechBackground = async () => {
    if (!inventionName.trim() || !technicalField.trim()) {
      alert("请先填写发明名称和技术领域");
      return;
    }

    setIsGeneratingBackground(true);
    
    try {
      setTechBackground("");
      await callStreamAPI(
        "/api/disclosure/background-generation",
        {
          inventionName,
          technicalField,
          existingProblems: existingProblems || "（未提供具体问题，请根据通用情况分析）",
        },
        (chunk) => setTechBackground(prev => prev + chunk)
      );
    } catch (error) {
      alert("AI生成失败，请点击重新生成按钮");
    } finally {
      setIsGeneratingBackground(false);
    }
  };

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

  // 单个文本块 AI 优化
  const handleOptimizeBlock = async (id: string, content: string) => {
    if (!content.trim()) {
      alert("请先输入要优化的内容");
      return;
    }

    setOptimizingBlockId(id);

    try {
      const optimized = await callStreamAPI(
        "/api/disclosure/proposal-text-optimization",
        {
          text: content,
          optimizationType: "standard",
        }
      );
      
      // 更新文本块内容
      setContentBlocks((prev) =>
        prev.map((block) => {
          if (block.id === id && block.type === "text") {
            return {
              ...block,
              content: optimized,
            };
          }
          return block;
        }),
      );

    } catch (error) {
      alert("文本优化失败，请稍后重新点击优化按钮");
    } finally {
      setOptimizingBlockId(null);
    }
  };

  // 提取关键词
  const extractKeywords = async () => {
    const techSolutionText = getTechSolutionText();
    if (!techSolutionText.trim()) {
      alert("请先输入技术方案内容");
      return;
    }

    try {
      const response = await fetch("/api/disclosure/explanation-of-keywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ techSolution: techSolutionText }),
      });

      if (!response.ok) {
        throw new Error("关键词提取失败");
      }

      const result = await response.json();

      // 合并关键词，避免重复
      if (result.keywords && Array.isArray(result.keywords)) {
        setKeywords((prev) => {
          const existingTerms = new Set(prev.map((kw) => kw.term));
          const newKeywords = result.keywords
            .filter((kw: any) => !existingTerms.has(kw.term))
            .map((kw: any) => ({
              term: kw.term,
              definition: kw.explanation,
            }));
          return [...prev, ...newKeywords];
        });

        alert(`成功提取 ${result.keywords.length} 个关键词`);
      }
    } catch (error) {
      console.error("关键词提取失败:", error);
      alert("关键词提取失败，请稍后重新点击提取");
    }
  };

  // AI 风格化改写
  const handleAIRewrite = async () => {
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

      // 自动提取关键词
      await extractKeywords();
      
    } catch (error) {
      alert("AI优化失败，请稍后重试");
    } finally {
      setIsRewriting(false);
    }
  };

  // 生成有益效果和保护点
  const generateBeneficialEffects = async () => {
    const techSolutionText = getTechSolutionText();
    
    if (!techBackground.trim() || !techSolutionText.trim()) {
      alert("请先完成技术背景和技术方案");
      return;
    }

    setIsGeneratingEffects(true);
    
    try {
      // 生成有益效果
      setBeneficialEffects("");
      await callStreamAPI(
        "/api/disclosure/beneficial-effect-generation",
        {
          technicalBackground: techBackground,
          technicalSolution: techSolutionText,
        },
        (chunk) => setBeneficialEffects(prev => prev + chunk)
      );
    } catch (error) {
      alert("有益效果生成失败");
    }

    try {
      // 生成保护点
      setProtectionPoints("");
      await callStreamAPI(
        "/api/disclosure/pre-protection-point-generation",
        {
          technicalBackground: techBackground,
          technicalSolution: techSolutionText,
        },
        (chunk) => setProtectionPoints(prev => prev + chunk)
      );
    } catch (error) {
      alert("保护点生成失败");
    }
    
    setIsGeneratingEffects(false);
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
            <Step1BasicInfo
              inventionName={inventionName}
              setInventionName={setInventionName}
              contactPerson={contactPerson}
              setContactPerson={setContactPerson}
              applicationType={applicationType}
              setApplicationType={setApplicationType}
              technicalField={technicalField}
              setTechnicalField={setTechnicalField}
            />
          )}

          {/* Step 2: 技术背景 */}
          {step === 2 && (
            <Step2TechBackground
              inventionName={inventionName}
              technicalField={technicalField}
              techBackground={techBackground}
              setTechBackground={setTechBackground}
              isGeneratingBackground={isGeneratingBackground}
              existingProblems={existingProblems}
              setExistingProblems={setExistingProblems}
              generateTechBackground={() => generateTechBackground()}
            />
          )}

          {/* Step 3: 技术方案 */}
          {step === 3 && (
            <Step3TechSolution
              contentBlocks={contentBlocks}
              setContentBlocks={setContentBlocks}
              isRewriting={isRewriting}
              optimizingBlockId={optimizingBlockId}
              keywords={keywords}
              aiWarnings={[]}
              fileInputRef={fileInputRef}
              addContentBlock={addContentBlock}
              updateContentBlock={updateContentBlock}
              deleteContentBlock={deleteContentBlock}
              handleImageUpload={handleImageUpload}
              handleOptimizeBlock={(id) => {
                const block = contentBlocks.find(b => b.id === id);
                if (block) handleOptimizeBlock(id, block.content);
              }}
              handleAIRewrite={handleAIRewrite}
              extractKeywords={extractKeywords}
              addKeyword={addKeyword}
              updateKeyword={updateKeyword}
              deleteKeyword={deleteKeyword}
            />
          )}

          {/* Step 4: 有益效果与保护点 */}
          {step === 4 && (
            <Step4Benefits
              beneficialEffects={beneficialEffects}
              setBeneficialEffects={setBeneficialEffects}
              protectionPoints={protectionPoints}
              setProtectionPoints={setProtectionPoints}
              isGeneratingEffects={isGeneratingEffects}
              generateBeneficialEffects={generateBeneficialEffects}
            />
          )}

          {/* Step 5: 预览 */}
          {step === 5 && (
            <Step5Preview
              inventionName={inventionName}
              contactPerson={contactPerson}
              applicationType={applicationType}
              technicalField={technicalField}
              techBackground={techBackground}
              contentBlocks={contentBlocks}
              keywords={keywords}
              beneficialEffects={beneficialEffects}
              protectionPoints={protectionPoints}
            />
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
                    setStep(5);
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
