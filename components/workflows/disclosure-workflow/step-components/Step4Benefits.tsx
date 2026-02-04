"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface Step4BenefitsProps {
  beneficialEffects: string;
  setBeneficialEffects: (value: string) => void;
  protectionPoints: string;
  setProtectionPoints: (value: string) => void;
  isGeneratingEffects: boolean;
  generateBeneficialEffects: () => void;
}

export function Step4Benefits({
  beneficialEffects,
  setBeneficialEffects,
  protectionPoints,
  setProtectionPoints,
  isGeneratingEffects,
  generateBeneficialEffects,
}: Step4BenefitsProps) {
  return (
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
                重新生成
              </Button>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              AI 已基于技术背景和技术方案自动生成，您可以修改以下内容：
            </p>
            <textarea
              value={beneficialEffects}
              onChange={(e) => setBeneficialEffects(e.target.value)}
              placeholder="请描述本发明的有益效果..."
              rows={8}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary resize-none"
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              本发明的技术关键点和欲保护点
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              AI 已基于技术方案自动识别关键点，您可以修改以下内容：
            </p>
            <textarea
              value={protectionPoints}
              onChange={(e) => setProtectionPoints(e.target.value)}
              placeholder="请描述本发明的技术关键点和欲保护点..."
              rows={8}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary resize-none"
            />
          </div>
        </>
      )}
    </div>
  );
}
