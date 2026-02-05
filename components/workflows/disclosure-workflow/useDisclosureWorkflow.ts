"use client";

import { useState, useEffect, useRef } from "react";
import type { Step, ContentBlock, KeywordDefinition, AIWarning } from "./types";

export function useDisclosureWorkflow() {
  // 状态
  const [step, setStep] = useState<Step>(1);
  const [inventionName, setInventionName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [applicationType, setApplicationType] = useState<
    "发明" | "实用新型" | ""
  >("");
  const [technicalField, setTechnicalField] = useState("");
  const [techBackground, setTechBackground] = useState("");
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
  const [existingProblems, setExistingProblems] = useState("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: "1", type: "text", content: "" },
  ]);
  const [isRewriting, setIsRewriting] = useState(false);
  const [optimizingBlockId, setOptimizingBlockId] = useState<string | null>(
    null,
  );
  const [keywords, setKeywords] = useState<KeywordDefinition[]>([]);
  const [aiWarnings, setAiWarnings] = useState<AIWarning[]>([]);
  const [beneficialEffects, setBeneficialEffects] = useState("");
  const [protectionPoints, setProtectionPoints] = useState("");
  const [isGeneratingEffects, setIsGeneratingEffects] = useState(false);
  const [documentGenerated, setDocumentGenerated] = useState(false);
  const [optimizationType, setOptimizationType] = useState<string>("standard");
  const [optimizationStatus, setOptimizationStatus] = useState<
    Record<string, string>
  >({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取技术方案文本
  const getTechSolutionText = () => {
    return contentBlocks
      .filter((block) => block.type === "text")
      .map((block) => block.content)
      .join("\n");
  };

  // API调用函数 - 文本优化
  const callOptimizationAPI = async (text: string, blockId?: string) => {
    if (blockId) {
      setOptimizationStatus((prev) => ({ ...prev, [blockId]: "loading" }));
    }

    try {
      const response = await fetch(
        "/api/disclosure/proposal-text-optimization",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, optimizationType }),
        },
      );

      if (!response.ok) throw new Error("优化失败");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let result = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
      }

      if (blockId) {
        setOptimizationStatus((prev) => ({ ...prev, [blockId]: "success" }));
      }

      return result;
    } catch (error) {
      console.error(error);
      if (blockId) {
        setOptimizationStatus((prev) => ({ ...prev, [blockId]: "error" }));
      }
      alert("AI优化失败，请稍后重试");
      return text;
    }
  };

  // API调用函数 - 关键词提取
  const extractKeywords = async () => {
    const techSolutionText = getTechSolutionText();
    if (!techSolutionText.trim()) {
      alert("请先输入技术方案内容");
      return false;
    }

    try {
      const response = await fetch("/api/disclosure/explanation-of-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        return true;
      }

      return false;
    } catch (error) {
      console.error("关键词提取失败:", error);
      alert("关键词提取失败，请稍后重新点击提取");
      return false;
    }
  };

  // 背景生成
  const generateTechBackground = async () => {
    if (!inventionName || !technicalField) {
      alert("请先填写发明名称和技术领域");
      return;
    }

    setIsGeneratingBackground(true);
    try {
      setTechBackground("");
      const background = await callOptimizationAPI(
        `发明名称：${inventionName}\n技术领域：${technicalField}\n现有问题：${existingProblems || "未提供"}`,
      );
      setTechBackground(background);
    } finally {
      setIsGeneratingBackground(false);
    }
  };

  // 技术方案优化
  const handleOptimizeBlock = async (id: string, content: string) => {
    if (!content.trim()) {
      alert("请先输入内容");
      return;
    }

    setOptimizingBlockId(id);
    const optimized = await callOptimizationAPI(content, id);

    if (optimized !== content) {
      setContentBlocks((prev) =>
        prev.map((block) =>
          block.id === id ? { ...block, content: optimized } : block,
        ),
      );
    }

    setOptimizingBlockId(null);
  };

  // 批量优化
  const handleAIRewrite = async () => {
    setIsRewriting(true);

    for (const block of contentBlocks) {
      if (block.type === "text" && block.content.trim()) {
        await handleOptimizeBlock(block.id, block.content);
      }
    }

    // 自动提取关键词
    await extractKeywords();

    setIsRewriting(false);
  };

  // 有益效果生成
  const generateBeneficialEffects = async () => {
    setIsGeneratingEffects(true);

    try {
      // 这里需要调用有益效果生成的API
      // 暂时用模拟数据
      const techText = getTechSolutionText();

      if (!techText.trim()) {
        alert("请先输入技术方案");
        return;
      }

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setBeneficialEffects(
        `基于技术方案，本发明具有以下有益效果：\n\n1. 提高了${technicalField || "相关领域"}的技术效率\n2. 改善了用户体验\n3. 降低了实施成本\n4. 增强了系统稳定性`,
      );
      setProtectionPoints(
        `技术关键点：\n1. ${inventionName || "本发明"}的核心架构设计\n2. 关键技术模块的创新实现\n3. 数据处理方法的优化\n4. 系统整体协同工作机制`,
      );
    } catch (error) {
      alert("生成失败，请稍后重试");
    } finally {
      setIsGeneratingEffects(false);
    }
  };

  // 内容块管理
  const addContentBlock = (type: "text" | "image") => {
    setContentBlocks([
      ...contentBlocks,
      {
        id: Date.now().toString(),
        type,
        content: "",
      },
    ]);
  };

  const updateContentBlock = (id: string, content: string) => {
    setContentBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, content } : block)),
    );
  };

  const deleteContentBlock = (id: string) => {
    if (contentBlocks.length > 1) {
      setContentBlocks((prev) => prev.filter((block) => block.id !== id));
    }
  };

  const handleImageUpload = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setContentBlocks((prev) =>
        prev.map((block) =>
          block.id === id
            ? { ...block, imageUrl: url, content: file.name }
            : block,
        ),
      );
    }
  };

  // 关键词管理
  const addKeyword = () =>
    setKeywords([...keywords, { term: "", definition: "" }]);

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

  // 文档生成
  const handleGenerateDocument = () => {
    setStep(5);
    setDocumentGenerated(true);
  };

  return {
    // 状态
    step,
    setStep,
    inventionName,
    setInventionName,
    contactPerson,
    setContactPerson,
    applicationType,
    setApplicationType,
    technicalField,
    setTechnicalField,
    techBackground,
    setTechBackground,
    isGeneratingBackground,
    existingProblems,
    setExistingProblems,
    contentBlocks,
    isRewriting,
    optimizingBlockId,
    keywords,
    aiWarnings,
    beneficialEffects,
    setBeneficialEffects,
    protectionPoints,
    setProtectionPoints,
    isGeneratingEffects,
    documentGenerated,
    optimizationType,
    setOptimizationType,
    optimizationStatus,
    fileInputRef,

    // 方法
    generateTechBackground,
    addContentBlock,
    updateContentBlock,
    deleteContentBlock,
    handleImageUpload,
    handleOptimizeBlock,
    handleAIRewrite,
    extractKeywords, // 新增的关键词提取方法
    addKeyword,
    updateKeyword,
    deleteKeyword,
    generateBeneficialEffects,
    handleGenerateDocument,
  };
}
