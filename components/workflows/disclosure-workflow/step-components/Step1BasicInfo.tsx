"use client";

import React from "react";

interface Step1BasicInfoProps {
  inventionName: string;
  setInventionName: (value: string) => void;
  contactPerson: string;
  setContactPerson: (value: string) => void;
  applicationType: "发明" | "实用新型" | "";
  setApplicationType: (value: "发明" | "实用新型" | "") => void;
  technicalField: string;
  setTechnicalField: (value: string) => void;
}

export function Step1BasicInfo({
  inventionName,
  setInventionName,
  contactPerson,
  setContactPerson,
  applicationType,
  setApplicationType,
  technicalField,
  setTechnicalField,
}: Step1BasicInfoProps) {
  return (
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
  );
}
