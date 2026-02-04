"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X, ImageIcon, Sparkles, AlertTriangle, BookOpen } from "lucide-react";
import type { ContentBlock, KeywordDefinition, AIWarning } from "../types";

interface Step3TechSolutionProps {
  contentBlocks: ContentBlock[];
  setContentBlocks: (blocks: ContentBlock[]) => void;
  isRewriting: boolean;
  optimizingBlockId: string | null;
  keywords: KeywordDefinition[];
  aiWarnings: AIWarning[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  addContentBlock: (type: "text" | "image") => void;
  updateContentBlock: (id: string, content: string) => void;
  deleteContentBlock: (id: string) => void;
  handleImageUpload: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOptimizeBlock: (id: string) => void;
  handleAIRewrite: () => void;
  extractKeywords: () => void; // 新增
  addKeyword: () => void;
  updateKeyword: (index: number, field: keyof KeywordDefinition, value: string) => void;
  deleteKeyword: (index: number) => void;
}

export function Step3TechSolution({
  contentBlocks,
  setContentBlocks,
  isRewriting,
  optimizingBlockId,
  keywords,
  aiWarnings,
  fileInputRef,
  addContentBlock,
  updateContentBlock,
  deleteContentBlock,
  handleImageUpload,
  handleOptimizeBlock,
  handleAIRewrite,
  extractKeywords, // 新增
  addKeyword,
  updateKeyword,
  deleteKeyword,
}: Step3TechSolutionProps) {
  return (
    <div className="space-y-6">
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
                  <div className="absolute bottom-4 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 gap-1 text-xs"
                      onClick={() => handleOptimizeBlock(block.id)}
                      disabled={optimizingBlockId === block.id}
                    >
                      <Sparkles
                        className={cn(
                          "h-3 w-3",
                          optimizingBlockId === block.id &&
                            "animate-pulse",
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
          <div className="flex gap-2">
            <Button
              onClick={extractKeywords}
              disabled={isRewriting}
              className="gap-2"
            >
              <BookOpen className={cn("h-4 w-4", isRewriting && "animate-pulse")} />
              提取关键词
            </Button>
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

      {/* ... 关键词表部分保持不变 ... */}
    </div>
  );
}
