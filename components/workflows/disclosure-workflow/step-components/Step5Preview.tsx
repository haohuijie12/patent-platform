"use client";

import React from "react";
import type { ContentBlock, KeywordDefinition } from "../types";

interface Step5PreviewProps {
  inventionName: string;
  contactPerson: string;
  applicationType: "发明" | "实用新型" | "";
  technicalField: string;
  techBackground: string;
  contentBlocks: ContentBlock[];
  keywords: KeywordDefinition[];
  beneficialEffects: string;
  protectionPoints: string;
}

export function Step5Preview({
  inventionName,
  contactPerson,
  applicationType,
  technicalField,
  techBackground,
  contentBlocks,
  keywords,
  beneficialEffects,
  protectionPoints,
}: Step5PreviewProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            专利交底书预览
          </h2>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="mb-3 font-semibold text-foreground">一、基本信息</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">发明名称：</span>
                {inventionName}
              </p>
              <p>
                <span className="text-muted-foreground">联系人：</span>
                {contactPerson}
              </p>
              <p>
                <span className="text-muted-foreground">申请类型：</span>
                {applicationType}
              </p>
              <p>
                <span className="text-muted-foreground">技术领域：</span>
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
                        <tr key={index} className="border-b border-border">
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
  );
}
