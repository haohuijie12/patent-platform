"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  FileText,
  Tags,
  BookOpen,
  Plus,
  X,
  Search,
  Lightbulb,
  FileSearch,
  CheckCircle,
  Download,
  Pencil,
  Save,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReportWorkflowProps {
  fileName: string;
  onBack: () => void;
}

interface IPCItem {
  code: string;
  name: string;
}

interface KeywordItem {
  word: string;
}

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  example: string;
}

interface PatentItem {
  id: string;
  title: string;
  applicant: string;
  publicationNumber: string;
  publicationDate: string;
  relevance: number;
  similarities: string;
  differences: string;
  category: "X" | "Y" | "A";
}

// IPC建议库
const ipcSuggestions: IPCItem[] = [
  { code: "G06F", name: "电数字数据处理" },
  { code: "G06N", name: "基于特定计算模型的计算机系统" },
  {
    code: "G06Q",
    name: "专门适用于行政、商业、金融、管理、监督或预测目的的数据处理系统或方法",
  },
  { code: "H04L", name: "数字信息的传输" },
  { code: "G06K", name: "数据识别；数据表示；记录载体" },
  { code: "G06T", name: "一般的图像数据处理或产生" },
  { code: "H04N", name: "图像通信" },
  { code: "G06V", name: "图像或视频识别或理解" },
  { code: "H04W", name: "无线通信网络" },
  { code: "G06F16", name: "信息检索；数据库结构" },
];

// 扩展词建议映射
const keywordSuggestions: Record<string, string[]> = {
  人工智能: ["AI", "智能系统", "认知计算"],
  机器学习: ["ML", "自动学习", "统计学习"],
  深度学习: ["DL", "神经网络", "表示学习"],
  神经网络: ["NN", "深度网络", "卷积网络"],
  算法: ["方法", "模型", "技术"],
  数据处理: ["数据分析", "信息处理", "数据挖掘"],
  模型训练: ["训练方法", "学习过程", "优化训练"],
};

const templates: TemplateOption[] = [
  {
    id: "ipc-keywords",
    name: "IncoPat | IPC/CPC + Keywords",
    description: "使用 IPC/CPC 分类号与关键词组合进行检索",
    example:
      "(IPC=G06F OR IPC=G06N) AND (TI=人工智能 OR AB=人工智能 OR TI=机器学习 OR AB=机器学习)",
  },
  {
    id: "keywords-only",
    name: "IncoPat | Keywords",
    description: "仅使用关键词进行检索",
    example: "(TI=人工智能 OR AB=人工智能 OR TI=机器学习 OR AB=机器学习)",
  },
];

// 模拟专利数据
const mockPatents: PatentItem[] = [
  {
    id: "1",
    title: "一种基于深度学习的图像识别方法",
    applicant: "某科技公司",
    publicationNumber: "CN112345678A",
    publicationDate: "2023-05-15",
    relevance: 95,
    similarities: "采用深度学习技术，使用神经网络进行特征提取",
    differences: "未公开具体的网络结构优化方法",
    category: "X",
  },
  {
    id: "2",
    title: "机器学习模型训练系统及方法",
    applicant: "某研究院",
    publicationNumber: "CN112345679A",
    publicationDate: "2023-04-20",
    relevance: 88,
    similarities: "涉及模型训练流程，包含数据预处理步骤",
    differences: "训练算法与本方案有显著差异",
    category: "Y",
  },
  {
    id: "3",
    title: "神经网络优化算法",
    applicant: "某大学",
    publicationNumber: "CN112345680A",
    publicationDate: "2023-03-10",
    relevance: 82,
    similarities: "使用优化算法提升模型性能",
    differences: "应用领域不同，技术路线存在差异",
    category: "A",
  },
];

export function ReportWorkflow({ fileName, onBack }: ReportWorkflowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // 提案名称（自动生成，可修改）- 移到步骤4
  const [proposalName, setProposalName] = useState(() => {
    const date = new Date();
    const dateStr = date
      .toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
    return `专利检索报告-${fileName.replace(/\.[^/.]+$/, "")}-${dateStr}`;
  });

  // Step 1: 生成检索关键词
  const [ipcList, setIPCList] = useState<IPCItem[]>([
    { code: "G06F", name: "电数字数据处理" },
    { code: "G06N", name: "基于特定计算模型的计算机系统" },
  ]);
  const [keywords, setKeywords] = useState<KeywordItem[]>([
    { word: "人工智能" },
    { word: "机器学习" },
    { word: "深度学习" },
  ]);
  const [newIPCCode, setNewIPCCode] = useState("");
  const [filteredIPCSuggestions, setFilteredIPCSuggestions] = useState<
    IPCItem[]
  >([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);

  // Step 2: 生成检索式（默认选择第一个模板）
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    "ipc-keywords",
  );
  const [generatedFormula, setGeneratedFormula] = useState<string>("");

  // Step 3: 检索相关文件
  const [selectedPatents, setSelectedPatents] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PatentItem[]>([]);
  const [originalSearchResults, setOriginalSearchResults] = useState<
    PatentItem[]
  >([]);
  const [editingPatentId, setEditingPatentId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<PatentItem>>({});

  // Step 4: 完善报告信息
  const [standardAdaptation, setStandardAdaptation] = useState(false);
  const [vehicleApplication, setVehicleApplication] = useState(false);
  const [usageProspect, setUsageProspect] = useState<"高" | "低" | "无" | "">(
    "",
  );
  const [authorizationProspect, setAuthorizationProspect] = useState<
    "高" | "中" | "低" | "无" | ""
  >("");
  const [proposalGrade, setProposalGrade] = useState<
    "A" | "B" | "C" | "不通过" | ""
  >("");
  const [conclusion, setConclusion] = useState("");
  const [enforcementability, setEnforcementability] = useState<
    "高" | "低" | "无" | ""
  >("");

  // Step 5: 预览与导出
  const [reportGenerated, setReportGenerated] = useState(false);

  // Auto-generate formula when entering step 2
  useEffect(() => {
    if (step === 2 && selectedTemplate && !generatedFormula) {
      generateFormula(selectedTemplate);
    }
  }, [step, selectedTemplate]);

  // Auto-search when entering step 3
  useEffect(() => {
    if (step === 3 && searchResults.length === 0 && !isSearching) {
      handleSearch();
    }
  }, [step]);

  // IPC handlers
  const handleIPCInputChange = (value: string) => {
    setNewIPCCode(value);
    if (value.trim()) {
      const filtered = ipcSuggestions.filter(
        (ipc) =>
          !ipcList.find((existing) => existing.code === ipc.code) &&
          (ipc.code.toLowerCase().includes(value.toLowerCase()) ||
            ipc.name.toLowerCase().includes(value.toLowerCase())),
      );
      setFilteredIPCSuggestions(filtered.slice(0, 6));
    } else {
      setFilteredIPCSuggestions([]);
    }
  };

  const addIPC = (ipc: IPCItem) => {
    setIPCList([...ipcList, ipc]);
    setNewIPCCode("");
    setFilteredIPCSuggestions([]);
  };

  const deleteIPC = (index: number) => {
    setIPCList(ipcList.filter((_, i) => i !== index));
  };

  // Keyword handlers
  const addKeyword = (word: string) => {
    if (word.trim() && !keywords.find((kw) => kw.word === word.trim())) {
      setKeywords([...keywords, { word: word.trim() }]);
      const suggestions = (keywordSuggestions[word.trim()] || [])
        .slice(0, 5)
        .filter((w) => !keywords.find((kw) => kw.word === w));
      setSuggestedWords(suggestions);
      setNewKeyword("");
    }
  };

  const deleteKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleKeywordClick = (keyword: string) => {
    if (activeKeyword === keyword) {
      setActiveKeyword(null);
      setSuggestedWords([]);
    } else {
      setActiveKeyword(keyword);
      const suggestions = (keywordSuggestions[keyword] || [])
        .slice(0, 5)
        .filter((word) => !keywords.find((kw) => kw.word === word));
      setSuggestedWords(suggestions);
    }
  };

  const addSuggestedWord = (word: string) => {
    if (!keywords.find((kw) => kw.word === word)) {
      setKeywords([...keywords, { word }]);
      const updatedSuggestions = suggestedWords.filter((w) => w !== word);
      setSuggestedWords(updatedSuggestions);
      if (updatedSuggestions.length === 0) {
        setActiveKeyword(null);
      }
    }
  };

  // Formula generation
  const generateFormula = (templateId: string) => {
    const ipcCodes = ipcList.map((ipc) => ipc.code);
    const keywordsList = keywords.map((kw) => kw.word);

    let formula = "";
    switch (templateId) {
      case "ipc-keywords":
        const ipcPart = ipcCodes.map((code) => `IPC=${code}`).join(" OR ");
        const keywordPart = keywordsList
          .map((kw) => `TI=${kw} OR AB=${kw}`)
          .join(" OR ");
        formula = `(${ipcPart}) AND (${keywordPart})`;
        break;
      case "keywords-only":
        const keywordsOnlyPart = keywordsList
          .map((kw) => `TI=${kw} OR AB=${kw}`)
          .join(" OR ");
        formula = `(${keywordsOnlyPart})`;
        break;
    }
    setGeneratedFormula(formula);
  };

  // Patent search
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setSearchResults(mockPatents);
      setOriginalSearchResults(mockPatents);
      setIsSearching(false);
    }, 1500);
  };

  // Reset search results
  const handleResetResults = () => {
    setSearchResults([...originalSearchResults]);
  };

  const togglePatentSelection = (id: string) => {
    if (selectedPatents.includes(id)) {
      setSelectedPatents(selectedPatents.filter((pid) => pid !== id));
    } else {
      setSelectedPatents([...selectedPatents, id]);
    }
  };

  // Manual trigger for conclusion generation
  const handleAutoGenerateConclusion = () => {
    const conclusionText =
      `根据专利检索分析，本提案${proposalName || ""}的综合评估如下：\n\n` +
      `经过检索共发现${searchResults.length}件相关专利文献，其中包含${searchResults.filter((p) => p.category === "X").length}件X类对比文件、${searchResults.filter((p) => p.category === "Y").length}件Y类对比文件、${searchResults.filter((p) => p.category === "A").length}件A类对比文件。\n\n` +
      `【用途前景】${usageProspect || "未评估"}：${usageProspect === "高" ? "该技术方案具有较高的市场应用价值和广阔的发展前景。" : usageProspect === "低" ? "该技术方案的市场应用范围相对有限。" : usageProspect === "无" ? "暂无明确的应用前景。" : "需进一步评估。"}\n\n` +
      `【授权前景】${authorizationProspect || "未评估"}：${authorizationProspect === "高" ? "技术方案具有良好的新颖性和创造性，授权前景乐观。" : authorizationProspect === "中" ? "技术方案具有一定的新颖性，授权可能性适中。" : authorizationProspect === "低" ? "现有技术较为接近，授权存在一定难度。" : authorizationProspect === "无" ? "不具备授权条件。" : "需进一步评估。"}\n\n` +
      (standardAdaptation ? `【标准适配】已适配相关标准\n\n` : "") +
      (vehicleApplication ? `【车型应用】适用于相关车型\n\n` : "") +
      `【提案等级】${proposalGrade || "未评级"}${proposalGrade === "A" ? " - 建议优先推进" : proposalGrade === "B" ? " - 建议推进" : proposalGrade === "C" ? " - 建议谨慎推进" : proposalGrade === "不通过" ? " - 不建议推进" : ""}`;
    setConclusion(conclusionText);
  };

  // Generate report
  const handleGenerateReport = () => {
    setReportGenerated(true);
  };

  const copyFormula = () => {
    navigator.clipboard.writeText(generatedFormula);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="bg-transparent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              专利检索报告
            </h1>
            <p className="text-sm text-muted-foreground">文件：{fileName}</p>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "生成检索关键词" },
            { num: 2, label: "生成检索式" },
            { num: 3, label: "检索相关文件" },
            { num: 4, label: "完善报告信息" },
            { num: 5, label: "生成检索报告" },
          ].map((s, index) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all",
                    step === s.num
                      ? "border-primary bg-primary text-primary-foreground"
                      : step > s.num
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
                </div>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium",
                    step >= s.num ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {index < 4 && (
                <div
                  className={cn(
                    "mx-4 h-0.5 w-16 transition-all",
                    step > s.num ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Step 1: 生成检索关键词 (复用检索式逻辑) */}
          {step === 1 && (
            <div className="space-y-6">
              {/* IPC/CPC */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    IPC/CPC
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {ipcList.map((ipc, index) => (
                      <div
                        key={index}
                        title={ipc.name}
                        className="group relative flex items-center rounded-lg border border-primary bg-primary/10 pr-8 pl-4 py-2 font-mono text-sm font-medium text-primary transition-all"
                      >
                        {ipc.code}
                        <button
                          onClick={() => deleteIPC(index)}
                          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/90"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">
                          {ipc.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-accent/30 p-3">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={newIPCCode}
                        onChange={(e) => handleIPCInputChange(e.target.value)}
                        placeholder="搜索 IPC/CPC 分类号"
                        className="flex-1 bg-transparent px-2 py-1 text-sm font-mono outline-none placeholder:text-muted-foreground"
                      />
                    </div>

                    {filteredIPCSuggestions.length > 0 && (
                      <div className="rounded-lg bg-accent/30 p-3">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          选择分类
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {filteredIPCSuggestions.map((ipc, index) => (
                            <button
                              key={index}
                              onClick={() => addIPC(ipc)}
                              className={cn(
                                "group relative flex items-center rounded-lg border border-border bg-background px-4 py-2 font-mono text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary",
                              )}
                              title={ipc.name}
                            >
                              {ipc.code}
                              <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100 z-10">
                                {ipc.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {newIPCCode.trim() &&
                      filteredIPCSuggestions.length === 0 && (
                        <div className="rounded-lg bg-accent/30 p-3 text-center">
                          <p className="text-sm text-muted-foreground">
                            未找到匹配的分类号
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Tags className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    关键词
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                      <div
                        key={index}
                        onClick={() => handleKeywordClick(keyword.word)}
                        className={cn(
                          "group relative flex items-center rounded-lg border pr-8 pl-4 py-2 text-sm font-medium transition-all cursor-pointer",
                          activeKeyword === keyword.word
                            ? "border-primary bg-primary/20 text-primary ring-2 ring-primary"
                            : "border-primary bg-primary/10 text-primary hover:bg-primary/15",
                        )}
                      >
                        {keyword.word}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteKeyword(index);
                            if (activeKeyword === keyword.word) {
                              setActiveKeyword(null);
                              setSuggestedWords([]);
                            }
                          }}
                          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/90"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-accent/30 p-3">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && addKeyword(newKeyword)
                        }
                        placeholder="输入关键词"
                        className="flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
                      />
                      <Button
                        onClick={() => addKeyword(newKeyword)}
                        disabled={!newKeyword.trim()}
                        size="sm"
                        className="h-8"
                      >
                        添加
                      </Button>
                    </div>

                    {suggestedWords.length > 0 && (
                      <div className="rounded-lg bg-accent/30 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          <p className="text-xs font-medium text-muted-foreground">
                            {activeKeyword
                              ? `"${activeKeyword}" 的扩展词（同类词）`
                              : "推荐的扩展词（同类词）"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {suggestedWords.map((word, index) => (
                            <button
                              key={index}
                              onClick={() => addSuggestedWord(word)}
                              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                            >
                              <Plus className="h-3 w-3" />
                              {word}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 生成检索式 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  选择检索式模版
                </h2>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        generateFormula(template.id);
                      }}
                      className={cn(
                        "w-full rounded-lg border p-4 text-left transition-all",
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "border-border bg-background hover:border-primary hover:bg-accent",
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {template.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {template.description}
                          </p>
                          <p className="mt-2 rounded bg-accent/50 px-3 py-2 font-mono text-xs text-foreground">
                            {template.example}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {generatedFormula && (
                <div className="rounded-lg border border-primary bg-primary/5 p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      生成的检索式
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyFormula}
                      className="gap-2 bg-transparent"
                    >
                      <FileText className="h-4 w-4" />
                      复制
                    </Button>
                  </div>
                  <Textarea
                    value={generatedFormula}
                    onChange={(e) => setGeneratedFormula(e.target.value)}
                    className="min-h-[100px] resize-y font-mono text-sm bg-background border-border"
                    placeholder="生成的检索式将显示在这里，支持手动编辑"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: 检索相关文件 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    检索专利文献
                  </h2>
                  {originalSearchResults.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="gap-2 bg-transparent"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          重置
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认重置</AlertDialogTitle>
                          <AlertDialogDescription>
                            该操作将抹去列表中的所有修改
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResetResults}>
                            确认
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                {isSearching && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">正在检索专利文献...</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      共找到 {searchResults.length} 条相关专利
                    </p>
                    <div className="overflow-hidden rounded-lg border border-border">
                      <table className="w-full">
                        <thead className="bg-accent/50">
                          <tr>
                            <th className="border-b border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                              专利信息
                            </th>
                            <th className="border-b border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                              相同点
                            </th>
                            <th className="border-b border-border px-4 py-3 text-left text-sm font-semibold text-foreground">
                              不同点
                            </th>
                            <th className="border-b border-border px-4 py-3 text-center text-sm font-semibold text-foreground">
                              判定
                            </th>
                            <th className="border-b border-border px-4 py-3 text-center text-sm font-semibold text-foreground">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((patent) => (
                            <tr
                              key={patent.id}
                              className="border-b border-border hover:bg-accent/30 transition-colors"
                            >
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  <div className="font-mono text-sm font-medium text-primary">
                                    {patent.publicationNumber}
                                  </div>
                                  <div className="text-sm font-medium text-foreground">
                                    {patent.title}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-foreground max-w-xs">
                                {editingPatentId === patent.id ? (
                                  <Textarea
                                    value={editingData.similarities || ""}
                                    onChange={(e) =>
                                      setEditingData({
                                        ...editingData,
                                        similarities: e.target.value,
                                      })
                                    }
                                    className="min-h-[80px]"
                                  />
                                ) : (
                                  patent.similarities
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm text-foreground max-w-xs">
                                {editingPatentId === patent.id ? (
                                  <Textarea
                                    value={editingData.differences || ""}
                                    onChange={(e) =>
                                      setEditingData({
                                        ...editingData,
                                        differences: e.target.value,
                                      })
                                    }
                                    className="min-h-[80px]"
                                  />
                                ) : (
                                  patent.differences
                                )}
                              </td>
                              <td className="px-4 py-4 text-center">
                                {editingPatentId === patent.id ? (
                                  <Select
                                    value={editingData.category || ""}
                                    onValueChange={(value) =>
                                      setEditingData({
                                        ...editingData,
                                        category: value as "X" | "Y" | "A",
                                      })
                                    }
                                  >
                                    <SelectTrigger className="w-[80px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="X">X</SelectItem>
                                      <SelectItem value="Y">Y</SelectItem>
                                      <SelectItem value="A">A</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span
                                    className={cn(
                                      "inline-flex items-center justify-center rounded-lg px-3 py-1 text-sm font-bold",
                                      patent.category === "X" &&
                                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                      patent.category === "Y" &&
                                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                      patent.category === "A" &&
                                        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                    )}
                                  >
                                    {patent.category}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-1">
                                  <TooltipProvider>
                                    {editingPatentId === patent.id ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                              setSearchResults(
                                                searchResults.map((p) =>
                                                  p.id === patent.id
                                                    ? { ...p, ...editingData }
                                                    : p,
                                                ),
                                              );
                                              setEditingPatentId(null);
                                              setEditingData({});
                                            }}
                                            className="h-8 w-8 text-primary hover:text-primary/90"
                                          >
                                            <Save className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          保存修改
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                              setEditingPatentId(patent.id);
                                              setEditingData(patent);
                                            }}
                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          编辑信息
                                        </TooltipContent>
                                      </Tooltip>
                                    )}

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                                        >
                                          <FileSearch className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>解析专利</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setSearchResults(
                                              searchResults.filter(
                                                (p) => p.id !== patent.id,
                                              ),
                                            );
                                          }}
                                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>删除条目</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: 完善报告信息 */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  完善报告信息
                </h2>
                <p className="mb-6 text-muted-foreground">
                  请填写以下信息以完成检索报告：
                </p>

                <div className="space-y-6">
                  {/* 提案名称 */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      提案名称
                    </label>
                    <input
                      type="text"
                      value={proposalName}
                      onChange={(e) => setProposalName(e.target.value)}
                      placeholder="提案名称（可修改）"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  {/* 标准适配 和 车型应用 */}
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={standardAdaptation}
                        onChange={(e) =>
                          setStandardAdaptation(e.target.checked)
                        }
                        className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-foreground">
                        标准适配
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vehicleApplication}
                        onChange={(e) =>
                          setVehicleApplication(e.target.checked)
                        }
                        className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-foreground">
                        车型应用
                      </span>
                    </label>
                  </div>

                  {/* 用途前景 */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      用途前景
                    </label>
                    <div className="flex gap-3">
                      {["高", "低", "无"].map((option) => (
                        <button
                          key={option}
                          onClick={() => setUsageProspect(option as any)}
                          className={cn(
                            "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                            usageProspect === option
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-foreground hover:bg-accent",
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 授权前景 */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      授权前景
                    </label>
                    <div className="flex gap-3">
                      {["高", "中", "低", "无"].map((option) => (
                        <button
                          key={option}
                          onClick={() =>
                            setAuthorizationProspect(option as any)
                          }
                          className={cn(
                            "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                            authorizationProspect === option
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-foreground hover:bg-accent",
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 提案等级 */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      提案等级
                    </label>
                    <div className="flex gap-3">
                      {["A", "B", "C", "不通过"].map((option) => (
                        <button
                          key={option}
                          onClick={() => setProposalGrade(option as any)}
                          className={cn(
                            "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                            proposalGrade === option
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-foreground hover:bg-accent",
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 结论 */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        结论
                      </label>
                      {conclusion.trim() ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-2 text-primary hover:text-primary/90"
                            >
                              <Sparkles className="h-4 w-4" />
                              生成结论
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认生成</AlertDialogTitle>
                              <AlertDialogDescription>
                                该操作将覆盖结论框中的所有内容，是否继续？
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleAutoGenerateConclusion}
                              >
                                确认
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleAutoGenerateConclusion}
                          className="h-8 gap-2 text-primary hover:text-primary/90"
                        >
                          <Sparkles className="h-4 w-4" />
                          生成结论
                        </Button>
                      )}
                    </div>
                    <textarea
                      value={conclusion}
                      onChange={(e) => setConclusion(e.target.value)}
                      placeholder="结论将根据上述信息自动生成，您也可以手动修改..."
                      rows={12}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: 生成最终结论 */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-primary bg-primary/5 p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                    <CheckCircle className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      检索报告已生成
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      您可以直接下载报告
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* 1. 提案名称 */}
                  <div className="rounded-lg border border-border bg-background p-4">
                    <h3 className="mb-2 font-semibold text-foreground">
                      提案名称
                    </h3>
                    <p className="text-sm text-foreground">{proposalName}</p>
                  </div>

                  {/* 2. 检索日期 */}
                  <div className="rounded-lg border border-border bg-background p-4">
                    <h3 className="mb-2 font-semibold text-foreground">
                      检索日期
                    </h3>
                    <p className="text-sm text-foreground">
                      {new Date().toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* 3. 检索领域 */}
                  <div className="rounded-lg border border-border bg-background p-4">
                    <h3 className="mb-2 font-semibold text-foreground">
                      检索领域
                    </h3>
                    <div className="space-y-1 text-sm text-foreground">
                      <p>
                        IPC/CPC 分类号：
                        {ipcList.map((ipc) => ipc.code).join(", ")}
                      </p>
                      <p>关键词：{keywords.map((kw) => kw.word).join("、")}</p>
                    </div>
                  </div>

                  {/* 4. 检索式 */}
                  <div className="rounded-lg border border-border bg-background p-4">
                    <h3 className="mb-2 font-semibold text-foreground">
                      检索式
                    </h3>
                    <div className="rounded-lg bg-accent/30 p-3 font-mono text-sm text-foreground">
                      {generatedFormula}
                    </div>
                  </div>

                  {/* 5. 相关文件 */}
                  <div className="rounded-lg border border-border bg-background p-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                      相关文件（共 {searchResults.length} 件）
                    </h3>
                    <div className="overflow-hidden rounded-lg border border-border">
                      <table className="w-full">
                        <thead className="bg-accent/50">
                          <tr>
                            <th className="border-b border-border px-4 py-2 text-left text-sm font-semibold text-foreground">
                              公开号
                            </th>
                            <th className="border-b border-border px-4 py-2 text-left text-sm font-semibold text-foreground">
                              专利名称
                            </th>
                            <th className="border-b border-border px-4 py-2 text-left text-sm font-semibold text-foreground">
                              相同点
                            </th>
                            <th className="border-b border-border px-4 py-2 text-left text-sm font-semibold text-foreground">
                              不同点
                            </th>
                            <th className="border-b border-border px-4 py-2 text-center text-sm font-semibold text-foreground">
                              判定
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((patent) => (
                            <tr
                              key={patent.id}
                              className="border-b border-border"
                            >
                              <td className="px-4 py-2 font-mono text-sm text-foreground">
                                {patent.publicationNumber}
                              </td>
                              <td className="px-4 py-2 text-sm text-foreground">
                                {patent.title}
                              </td>
                              <td className="px-4 py-2 text-sm text-foreground">
                                {patent.similarities}
                              </td>
                              <td className="px-4 py-2 text-sm text-foreground">
                                {patent.differences}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span
                                  className={cn(
                                    "inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold",
                                    patent.category === "X" &&
                                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                    patent.category === "Y" &&
                                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                    patent.category === "A" &&
                                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                  )}
                                >
                                  {patent.category}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 6. 结论 */}
                  <div className="rounded-lg border border-border bg-background p-4">
                    <h3 className="mb-2 font-semibold text-foreground">结论</h3>
                    <div className="whitespace-pre-wrap text-sm text-foreground">
                      {conclusion}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
        <div>
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                setStep((step - 1) as any);
              }}
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
                setStep((step + 1) as any);
              }}
              disabled={
                (step === 1 &&
                  (ipcList.length === 0 || keywords.length === 0)) ||
                (step === 2 && !generatedFormula) ||
                (step === 3 && searchResults.length === 0)
              }
              className="gap-2"
            >
              下一步
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              下载报告 (DOCX)
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
