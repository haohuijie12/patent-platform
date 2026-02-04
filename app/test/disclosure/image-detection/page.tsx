"use client";

import { useState, ChangeEvent, useRef, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Eraser,
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  Play,
} from "lucide-react";
import { toast } from "sonner";

interface DetectionResult {
  isWhiteBackground: boolean;
  isBlackLines: boolean;
  pass: boolean;
  reason: string;
}

interface ImageItem {
  id: string;
  url: string | null;
  file?: File; // 添加 file 字段以便上传
  status?: "pending" | "analyzing" | "done" | "error";
  result?: DetectionResult;
}

export default function ImageDetectionPage() {
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const batchInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const validFiles = files.filter((file) => file.type.startsWith("image/"));
      if (validFiles.length > 0) {
        processFiles(validFiles);
      } else {
        toast.error("格式错误", {
          description: "请上传图片文件",
        });
      }
    }
  };

  const processFiles = (files: File[]) => {
    const newItems: ImageItem[] = files.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
      url: URL.createObjectURL(file),
      file: file,
      status: "pending",
    }));
    setImageItems((prev) => [...prev, ...newItems]);
  };

  const handleBatchSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (batchInputRef.current) {
      batchInputRef.current.value = "";
    }
  };

  const handleAddImageCard = () => {
    batchInputRef.current?.click();
  };

  // 保留单个替换的功能
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, id: string) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setImageItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, url, file, status: "pending", result: undefined }
            : item,
        ),
      );
    }
  };

  const triggerFileUpload = (id: string) => {
    if (fileInputRefs.current[id]) {
      fileInputRefs.current[id]?.click();
    }
  };

  const removeImageItem = (id: string) => {
    setImageItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleStartDetection = async () => {
    const validItems = imageItems.filter(
      (item) => item.url !== null && item.file,
    );

    if (validItems.length === 0) {
      toast.error("缺少必要信息", {
        description: "请上传至少一张图片",
      });
      return;
    }

    const pendingItems = validItems.filter(
      (item) => item.status !== "done" && item.status !== "analyzing",
    );
    if (pendingItems.length === 0) {
      toast.info("所有图片已完成检测");
      return;
    }

    setIsAnalyzing(true);

    // 更新状态为 analyzing
    setImageItems((prev) =>
      prev.map((item) =>
        item.url && item.file && item.status !== "done"
          ? { ...item, status: "analyzing" }
          : item,
      ),
    );

    try {
      await Promise.all(
        pendingItems.map(async (item) => {
          try {
            // Convert file to base64
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(item.file!);
            });

            const response = await fetch("/api/disclosure/image-detection", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl: base64 }),
            });

            if (!response.ok) throw new Error("API Error");

            const result = await response.json();

            setImageItems((prev) =>
              prev.map((prevItem) =>
                prevItem.id === item.id
                  ? { ...prevItem, status: "done", result }
                  : prevItem,
              ),
            );
          } catch (error) {
            console.error(`Error processing image ${item.id}:`, error);
            setImageItems((prev) =>
              prev.map((prevItem) =>
                prevItem.id === item.id
                  ? { ...prevItem, status: "error" }
                  : prevItem,
              ),
            );
          }
        }),
      );
      toast.success("检测完成");
    } catch (error) {
      console.error("Batch detection error:", error);
      toast.error("检测过程中发生错误");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderCompletion = () => {
    const hasResults = imageItems.some(
      (item) =>
        item.status === "done" ||
        item.status === "error" ||
        item.status === "analyzing",
    );

    if (!hasResults && imageItems.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
          <p>请上传图片并点击“开始检测”</p>
        </div>
      );
    }

    if (!hasResults) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
          <p>暂无检测结果</p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded border border-border">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-accent/50">
            <tr>
              <th className="border-b border-border px-3 py-1.5 text-left font-medium w-[80px]">
                图片序号
              </th>
              <th className="border-b border-border px-3 py-1.5 text-left font-medium w-[100px]">
                状态
              </th>
              <th className="border-b border-border px-3 py-1.5 text-left font-medium">
                检测详情
              </th>
            </tr>
          </thead>
          <tbody>
            {imageItems.map((item, index) => (
              <tr
                key={item.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-3 py-1.5 align-top font-medium truncate">
                  图片 {index + 1}
                </td>
                <td className="px-3 py-1.5 align-top">
                  {item.status === "pending" && (
                    <span className="text-muted-foreground">待检测</span>
                  )}
                  {item.status === "analyzing" && (
                    <span className="flex items-center text-blue-600">
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      检测中
                    </span>
                  )}
                  {item.status === "error" && (
                    <span className="text-destructive">错误</span>
                  )}
                  {item.status === "done" && item.result && (
                    <span
                      className={cn(
                        "flex items-center font-medium",
                        item.result.pass
                          ? "text-green-600"
                          : "text-destructive",
                      )}
                    >
                      {item.result.pass ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> 通过
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" /> 未通过
                        </>
                      )}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5 align-top">
                  {item.status === "done" && item.result ? (
                    <div className="text-xs space-y-1">
                      <div className="flex gap-2">
                        <span
                          className={
                            item.result.isWhiteBackground
                              ? "text-green-600"
                              : "text-destructive"
                          }
                        >
                          背景纯白:{" "}
                          {item.result.isWhiteBackground ? "是" : "否"}
                        </span>
                        <span
                          className={
                            item.result.isBlackLines
                              ? "text-green-600"
                              : "text-destructive"
                          }
                        >
                          线条纯黑: {item.result.isBlackLines ? "是" : "否"}
                        </span>
                      </div>
                      {!item.result.pass && item.result.reason && (
                        <p className="text-muted-foreground bg-muted/50 p-1 rounded mt-1">
                          {item.result.reason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleClear = () => {
    setImageItems([]);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-6xl mx-auto w-full h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight">图片检测</h2>
        <Button variant="outline" onClick={handleClear} disabled={isAnalyzing}>
          <Eraser className="mr-2 h-4 w-4" />
          清空重置
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* 左侧：输入区域 */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>图片输入</CardTitle>
            <CardDescription>
              用于检测图片是否满足交底书背景用白色，其他线条用黑色的条件
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden p-6 pt-0">
            <div className="space-y-4 flex flex-col flex-1 min-h-0">
              <div
                className={cn(
                  "flex-1 overflow-y-auto pr-2 space-y-4 rounded-lg transition-colors relative",
                  isDragging &&
                    "bg-primary/5 border-2 border-dashed border-primary",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* 隐藏的批量上传 input */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  ref={batchInputRef}
                  onChange={handleBatchSelect}
                />

                {imageItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="border rounded-lg overflow-hidden bg-background shadow-sm"
                  >
                    <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
                      <span className="text-sm font-medium text-muted-foreground">
                        图片 {index + 1}
                      </span>
                      <button
                        onClick={() => removeImageItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4">
                      {item.url ? (
                        <div className="relative w-full h-48 bg-muted/5 rounded-md overflow-hidden flex items-center justify-center">
                          <img
                            src={item.url}
                            alt={`Uploaded ${index + 1}`}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-full h-48 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors bg-muted/10"
                          onClick={() => triggerFileUpload(item.id)}
                        >
                          <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            点击上传图片
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(el) => {
                              fileInputRefs.current[item.id] = el;
                            }}
                            onChange={(e) => handleImageUpload(e, item.id)}
                            disabled={isAnalyzing}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {imageItems.length === 0 && (
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-muted/5 hover:bg-muted/10 hover:border-primary/50",
                      isDragging && "border-primary bg-primary/10",
                    )}
                    onClick={() => batchInputRef.current?.click()}
                  >
                    <div className="rounded-full bg-muted/20 p-4 mb-4">
                      <Upload className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      点击或拖拽上传图片
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      支持多张图片上传，支持 JPG、PNG 格式
                    </p>
                  </div>
                )}

                {imageItems.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={handleAddImageCard}
                      disabled={isAnalyzing}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-accent/30 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-accent/50 hover:text-foreground",
                        isAnalyzing &&
                          "opacity-50 cursor-not-allowed hover:border-border hover:bg-accent/30 hover:text-muted-foreground",
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      继续添加（或拖拽图片）
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground pt-1">
                提示：支持上传多张图片，AI 将对图片进行检测分析。
              </p>

              <Button
                onClick={handleStartDetection}
                className="w-full"
                disabled={isAnalyzing || imageItems.length === 0}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在检测...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    开始检测
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：结果展示 */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>检测结果</CardTitle>
            <CardDescription>
              检测图片的背景是否为纯白色，线条是否为黑色
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-6 pt-0">
            {renderCompletion()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
