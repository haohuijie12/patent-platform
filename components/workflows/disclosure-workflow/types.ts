// types.ts
export interface ContentBlock {
  id: string;
  type: "text" | "image";
  content: string;
  imageUrl?: string;
  detectionResult?: ImageDetectionResult;
  isDetecting?: boolean;
}

export interface KeywordDefinition {
  term: string;
  definition: string;
}

export interface AIWarning {
  type: "unclear" | "brief" | "image" | string; // 添加 string 类型以支持任意字符串
  message: string;
}

export interface ImageDetectionResult {
  isWhiteBackground: boolean;
  isBlackLines: boolean;
  pass: boolean;
  reason: string;
}

export type Step = 1 | 2 | 3 | 4 | 5;