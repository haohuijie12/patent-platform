"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function TemplateExportPage() {
  // State matches DisclosureWorkflow
  const [inventionName, setInventionName] =
    useState("一种基于深度学习的图像识别方法");
  const [contactPerson, setContactPerson] = useState("张三");
  const [applicationType, setApplicationType] = useState<string>("发明");
  const [technicalField, setTechnicalField] =
    useState("人工智能与计算机视觉技术领域");
  const [techBackground, setTechBackground] = useState(
    "现有的图像识别方法主要依赖于人工设计的特征提取算子，如SIFT、HOG等。这些方法在面对复杂场景、光照变化、遮挡等情况时，特征提取的鲁棒性较差，导致识别准确率难以进一步提升。此外，传统方法在处理大规模数据集时，计算效率低下，难以满足实时性要求。",
  );
  const [technicalSolution, setTechnicalSolution] =
    useState(`本发明提供了一种基于深度学习的图像识别方法，包括以下步骤：
1. 数据预处理：对采集的图像数据进行归一化、去噪等处理；
2. 构建卷积神经网络模型：模型包含多个卷积层、池化层和全连接层，引入了残差连接以加深网络深度；
3. 模型训练：使用标注好的数据集对模型进行监督学习，采用Adam优化器进行参数更新；
4. 图像识别：将待识别图像输入训练好的模型，输出识别结果。`);
  const [beneficialEffects, setBeneficialEffects] =
    useState(`1. 提高了识别准确率：通过深度卷积神经网络自动提取特征，克服了传统手工特征的局限性；
2. 增强了鲁棒性：引入残差连接，解决了深层网络训练困难的问题，对光照、旋转等变化具有更好的适应性；
3. 提升了计算效率：采用GPU加速计算，能够满足实时图像识别的需求。`);
  const [protectionPoints, setProtectionPoints] =
    useState(`1. 一种基于深度学习的图像识别方法，其特征在于，包括数据预处理、构建卷积神经网络模型、模型训练和图像识别步骤。
2. 根据权利要求1所述的方法，其特征在于，所述卷积神经网络模型采用了残差网络结构。
3. 根据权利要求1所述的方法，其特征在于，所述数据预处理包括图像归一化和随机数据增强。`);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const data = {
        inventionName,
        contactPerson,
        applicationType,
        technicalField,
        techBackground,
        technicalSolution,
        beneficialEffects,
        protectionPoints,
      };

      const response = await fetch("/api/disclosure/template-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "文档生成失败");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `专利交底书-${inventionName}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("文档导出成功");
    } catch (error) {
      console.error("导出失败:", error);
      toast.error(error instanceof Error ? error.message : "文档导出失败");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">
          交底书模板导出测试
        </h2>
        <Button onClick={handleExport} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "生成中..." : "生成并导出"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Step 1: 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>1. 基本信息</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inventionName">发明名称</Label>
                <Input
                  id="inventionName"
                  placeholder="请输入发明名称"
                  value={inventionName}
                  onChange={(e) => setInventionName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">联系人</Label>
                <Input
                  id="contactPerson"
                  placeholder="请输入联系人姓名"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicationType">专利类型</Label>
                <Select
                  value={applicationType}
                  onValueChange={setApplicationType}
                >
                  <SelectTrigger id="applicationType">
                    <SelectValue placeholder="选择专利类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="发明">发明</SelectItem>
                    <SelectItem value="实用新型">实用新型</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicalField">技术领域</Label>
                <Input
                  id="technicalField"
                  placeholder="请输入技术领域"
                  value={technicalField}
                  onChange={(e) => setTechnicalField(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: 技术背景 */}
        <Card>
          <CardHeader>
            <CardTitle>2. 技术背景</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="techBackground">背景技术描述</Label>
              <Textarea
                id="techBackground"
                placeholder="描述本发明所属的技术领域、现有技术状况以及现有技术存在的问题..."
                className="min-h-[150px]"
                value={techBackground}
                onChange={(e) => setTechBackground(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 3: 技术方案 */}
        <Card>
          <CardHeader>
            <CardTitle>3. 技术方案</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="technicalSolution">技术方案详情</Label>
              <Textarea
                id="technicalSolution"
                placeholder="详细描述本发明的技术方案，包括具体实施方式、结构特征、步骤流程等..."
                className="min-h-[200px]"
                value={technicalSolution}
                onChange={(e) => setTechnicalSolution(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 4: 有益效果与保护点 */}
        <Card>
          <CardHeader>
            <CardTitle>4. 有益效果与保护点</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="beneficialEffects">有益效果</Label>
              <Textarea
                id="beneficialEffects"
                placeholder="描述本发明相对于现有技术具有的优点和积极效果..."
                className="min-h-[100px]"
                value={beneficialEffects}
                onChange={(e) => setBeneficialEffects(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protectionPoints">关键保护点</Label>
              <Textarea
                id="protectionPoints"
                placeholder="列出本发明需要保护的核心技术特征..."
                className="min-h-[100px]"
                value={protectionPoints}
                onChange={(e) => setProtectionPoints(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
