"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Sparkles, Copy, Eraser, Layers, Tag } from "lucide-react";
import { toast } from "sonner";

interface Cluster {
  id: number;
  name: string;
  keywords: string[];
}

export default function KeywordClusteringTestPage() {
  const [keywords, setKeywords] = useState(
    "深度学习\n神经网络\n卷积神经网络\n图像识别\n目标检测\n自动驾驶\n激光雷达\n传感器融合\n路径规划\n车联网",
  );
  const [clusterCount, setClusterCount] = useState(3);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClustering = async () => {
    if (!keywords.trim()) {
      toast.error("请输入关键词", {
        description: "关键词列表不能为空",
      });
      return;
    }

    const keywordList = keywords
      .split(/[，、,\n]/)
      .map((k) => k.trim())
      .filter((k) => k);

    if (keywordList.length === 0) {
      toast.error("请输入有效的关键词");
      return;
    }

    if (keywordList.length < 2) {
      toast.error("关键词数量不足", {
        description: "请至少输入2个关键词",
      });
      return;
    }

    setLoading(true);
    setClusters([]);

    try {
      const response = await fetch(
        `/api/report/keyword-clustering?keywords=${encodeURIComponent(keywords)}&count=${clusterCount}`,
      );

      const data = await response.json();

      if (data.success) {
        setClusters(data.data.clusters);
        toast.success("聚类完成", {
          description: `成功生成 ${data.data.clusters.length} 个聚类组`,
        });
      } else {
        toast.error("聚类失败", {
          description: data.error || "请稍后重试",
        });
      }
    } catch (err) {
      console.error("请求出错:", err);
      toast.error("网络错误", {
        description: "无法连接到服务器",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setKeywords("");
    setClusters([]);
    toast.info("已重置", {
      description: "输入内容已清空",
    });
  };

  const handleCopyCluster = (cluster: Cluster) => {
    const text = `${cluster.name}：${cluster.keywords.join("、")}`;
    navigator.clipboard.writeText(text);
    toast.success("复制成功", {
      description: `已复制聚类 "${cluster.name}" 的内容`,
    });
  };

  const handleCopyAll = () => {
    if (clusters.length === 0) return;
    const text = clusters
      .map((c) => `${c.name}：${c.keywords.join("、")}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("全部复制成功", {
      description: "所有聚类结果已复制到剪贴板",
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight">关键词聚类</h2>
        <Button variant="outline" onClick={handleClear} disabled={loading}>
          <Eraser className="mr-2 h-4 w-4" />
          清空重置
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* 左侧：输入设置 */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>聚类设置</CardTitle>
            <CardDescription>
              输入关键词列表，系统将利用 AI 智能分析语义并进行自动归类。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="keywords">
                关键词列表 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="keywords"
                placeholder="例如：&#10;机器学习&#10;深度学习&#10;神经网络&#10;GPU&#10;芯片&#10;算法"
                className="min-h-[200px] resize-none font-mono text-sm"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                支持使用换行、逗号或顿号分隔多个关键词。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clusterCount">期望聚类数量</Label>
              <Input
                id="clusterCount"
                type="number"
                min="2"
                max="10"
                value={clusterCount}
                onChange={(e) => setClusterCount(Number(e.target.value))}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                建议设置在 2-10 之间，具体数量会根据关键词的相关性自动调整。
              </p>
            </div>

            <div className="pt-4">
              <Button
                className="w-full"
                onClick={handleClustering}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    正在聚类...
                  </>
                ) : (
                  <>
                    <Layers className="mr-2 h-4 w-4" />
                    开始聚类
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：聚类结果 */}
        <Card className="flex flex-col h-full bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>聚类结果</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAll}
              disabled={clusters.length === 0 || loading}
            >
              <Copy className="h-4 w-4 mr-2" />
              复制全部
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-6 pt-2 overflow-hidden">
            <div className="h-full rounded-md border bg-background p-4 overflow-y-auto shadow-sm">
              {clusters.length > 0 ? (
                <div className="space-y-4">
                  {clusters.map((cluster) => (
                    <div
                      key={cluster.id}
                      className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-primary flex items-center">
                          <Tag className="w-4 h-4 mr-2" />
                          {cluster.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCopyCluster(cluster)}
                          title="复制该组"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cluster.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                  <Layers className="h-12 w-12" />
                  <p>在左侧输入关键词并点击开始聚类...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
