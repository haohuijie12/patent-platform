"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            本发明技术方案带来的有益效果
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateBeneficialEffects}
              disabled={isGeneratingEffects}
              className="gap-2 bg-transparent"
            >
              <Sparkles className="h-4 w-4" />
              AI生成
            </Button>
            <Button
              variant="outline"
              onClick={generateBeneficialEffects}
              disabled={isGeneratingEffects}
              className="gap-2 bg-transparent"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  isGeneratingEffects && "animate-spin",
                )}
              />
              重新生成
            </Button>
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          基于技术背景和技术方案，AI将为您生成有益效果
        </p>

        {isGeneratingEffects ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">正在生成有益效果与保护点...</p>
          </div>
        ) : (
          <textarea
            value={beneficialEffects}
            onChange={(e) => setBeneficialEffects(e.target.value)}
            placeholder="点击'AI生成'按钮开始生成有益效果"
            rows={8}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary resize-none"
          />
        )}
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
    </div>
  );
}