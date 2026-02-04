"use client";

import { useState, useEffect, useRef } from "react";
import type { Step, ContentBlock, KeywordDefinition, AIWarning } from "./types";

export function useDisclosureWorkflow() {
  // 状态
  const [step, setStep] = useState<Step>(1);
  const [inventionName, setInventionName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [applicationType, setApplicationType] = useState<"发明" | "实用新型" | "">("");
  const [technicalField, setTechnicalField] = useState("");
  const [techBackground, setTechBackground] = useState("");
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
  const [existingProblems, setExistingProblems] = useState("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: "1", type: "text", content: "" },
  ]);
  const [isRewriting, setIsRewriting] = useState(false);
  const [optimizingBlockId, setOptimizingBlockId] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<KeywordDefinition[]>([]);
  const [aiWarnings, setAiWarnings] = useState<AIWarning[]>([]);
  const [beneficialEffects, setBeneficialEffects] = useState("");
  const [protectionPoints, setProtectionPoints] = useState("");
  const [isGeneratingEffects, setIsGeneratingEffects] = useState(false);
  const [documentGenerated, setDocumentGenerated] = useState(false);
  const [optimizationType, setOptimizationType] = useState<string>("standard");
  const [optimizationStatus, setOptimizationStatus] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API调用函数
  const callOptimizationAPI = async (text: string, blockId?: string) => {
    if (blockId) {
      setOptimizationStatus(prev => ({ ...prev, [blockId]: "loading" }));
    }

    try {
      const response = await fetch("/api/disclosure/proposal-text-optimization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, optimizationType }),
      });

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
        setOptimizationStatus(prev => ({ ...prev, [blockId]: "success" }));
      }

      return result;
    } catch (error) {
      console.error(error);
      if (blockId) {
        setOptimizationStatus(prev => ({ ...prev, [blockId]: "error" }));
      }
      alert("AI优化失败，请稍后重试");
      return text;
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
        `发明名称：${inventionName}\n技术领域：${technicalField}\n现有问题：${existingProblems || "未提供"}`
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
      setContentBlocks(prev =>
        prev.map(block => block.id === id ? { ...block, content: optimized } : block)
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
    
    // 添加关键词
    if (keywords.length === 0) {
      setKeywords([
        { term: "技术方案", definition: "指为解决特定技术问题而采用的技术手段的集合" },
        { term: "实施例", definition: "指发明创造的具体实现方式" },
      ]);
    }
    
    setIsRewriting(false);
  };

  // 有益效果生成
  const generateBeneficialEffects = () => {
    setIsGeneratingEffects(true);
    
    const techText = contentBlocks
      .filter(b => b.type === "text")
      .map(b => b.content)
      .join(" ");
    
    setTimeout(() => {
      setBeneficialEffects(`基于技术方案，本发明具有以下有益效果：\n\n1. 提高了${technicalField}的技术效率\n2. 改善了用户体验\n3. 降低了实施成本`);
      setProtectionPoints(`技术关键点：\n1. ${inventionName}的核心架构\n2. 关键技术模块设计\n3. 数据处理方法`);
      setIsGeneratingEffects(false);
    }, 1000);
  };

  // 内容块管理
  const addContentBlock = (type: "text" | "image") => {
    setContentBlocks([...contentBlocks, {
      id: Date.now().toString(),
      type,
      content: "",
    }]);
  };

  const updateContentBlock = (id: string, content: string) => {
    setContentBlocks(prev =>
      prev.map(block => block.id === id ? { ...block, content } : block)
    );
  };

  const deleteContentBlock = (id: string) => {
    if (contentBlocks.length > 1) {
      setContentBlocks(prev => prev.filter(block => block.id !== id));
    }
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setContentBlocks(prev =>
        prev.map(block =>
          block.id === id ? { ...block, imageUrl: url, content: file.name } : block
        )
      );
    }
  };

  // 关键词管理
  const addKeyword = () => setKeywords([...keywords, { term: "", definition: "" }]);
  
  const updateKeyword = (index: number, field: keyof KeywordDefinition, value: string) => {
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
    step, setStep,
    inventionName, setInventionName,
    contactPerson, setContactPerson,
    applicationType, setApplicationType,
    technicalField, setTechnicalField,
    techBackground, setTechBackground,
    isGeneratingBackground,
    existingProblems, setExistingProblems,
    contentBlocks,
    isRewriting, optimizingBlockId,
    keywords, aiWarnings,
    beneficialEffects, setBeneficialEffects,
    protectionPoints, setProtectionPoints,
    isGeneratingEffects,
    documentGenerated,
    optimizationType, setOptimizationType,
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
    addKeyword,
    updateKeyword,
    deleteKeyword,
    generateBeneficialEffects,
    handleGenerateDocument,
  };
}