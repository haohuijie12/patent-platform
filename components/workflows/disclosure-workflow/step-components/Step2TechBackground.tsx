"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, RefreshCw } from "lucide-react";

interface Step2TechBackgroundProps {
  inventionName: string;
  technicalField: string;
  techBackground: string;
  setTechBackground: (value: string) => void;
  isGeneratingBackground: boolean;
  existingProblems: string;
  setExistingProblems: (value: string) => void;
  generateTechBackground: (type: "ai" | "refresh") => void;
}

export function Step2TechBackground({
  inventionName,
  technicalField,
  techBackground,
  setTechBackground,
  isGeneratingBackground,
  existingProblems,
  setExistingProblems,
  generateTechBackground,
}: Step2TechBackgroundProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            本发明技术背景
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => generateTechBackground("ai")}
              disabled={isGeneratingBackground}
              className="gap-2 bg-transparent"
            >
              <Sparkles className="h-4 w-4" />
              AI生成
            </Button>
            <Button
              variant="outline"
              onClick={() => generateTechBackground("refresh")}
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
  );
}
