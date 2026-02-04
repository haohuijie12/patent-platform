export interface ContentBlock {
  id: string;
  type: "text" | "image";
  content: string;
  imageUrl?: string;
}

export interface KeywordDefinition {
  term: string;
  definition: string;
}

export interface AIWarning {
  type: "unclear" | "brief" | "image";
  message: string;
}

export type Step = 1 | 2 | 3 | 4 | 5;