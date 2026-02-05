// types.ts
export interface ContentBlock {
  id: string;
  type: "text" | "image";
  content: string;
  imageUrl?: string;
  detectionResult?: ImageDetectionResult; // 添加检测结果
  isDetecting?: boolean; // 添加检测状态
}

export interface KeywordDefinition {
  term: string;
  definition: string;
}

export interface AIWarning {
  type: "unclear" | "brief" | "image";
  message: string;
}

export interface ImageDetectionResult {
  isWhiteBackground: boolean;
  isBlackLines: boolean;
  pass: boolean;
  reason: string;
}

export type Step = 1 | 2 | 3 | 4 | 5;