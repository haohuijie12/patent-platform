import {
  FileText,
  Search,
  Type,
  FileOutput,
  FileSearch,
  Tag,
  Sparkles,
  Image,
  Binary,
} from "lucide-react";

export interface TestMenuItem {
  title: string;
  url?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: TestMenuItem[];
}

export const testConfig: TestMenuItem[] = [
  {
    title: "专利交底书",
    icon: FileText,
    items: [
      {
        title: "技术背景生成",
        url: "/test/disclosure/background-generation",
        icon: Type,
      },
      {
        title: "技术方案优化",
        url: "/test/disclosure/proposal-text-optimization",
        icon: Sparkles,
      },
      {
        title: "关键词解释",
        url: "/test/disclosure/explanation-of-keywords",
        icon: Search,
      },
      {
        title: "图片检测",
        url: "/test/disclosure/image-detection",
        icon: Image,
      },
      {
        title: "有益效果生成",
        url: "/test/disclosure/beneficial-effect-generation",
        icon: Sparkles,
      },
      {
        title: "预保护点生成",
        url: "/test/disclosure/pre-protection-point-generation",
        icon: Sparkles,
      },
      {
        title: "交底书模板导出",
        url: "/test/disclosure/template-export",
        icon: FileOutput,
      },
    ],
  },
  {
    title: "专利检索报告",
    icon: FileText,
    items: [
      {
        title: "报告结论生成",
        url: "/test/report/conclusion-generation",
        icon: FileOutput,
      },
      {
        title: "关键词推荐",
        url: "/test/report/keyword-recommendation",
        icon: Tag,
      },
      {
        title: "关键词聚类",
        url: "/test/report/keyword-clustering",
        icon: Tag,
      },
    ],
  },
  {
    title: "专利解析",
    icon: Search,
    items: [
      // 预留位置，暂时为空，或者可以加一个待开发的页面
    ],
  },
  {
    title: "通用服务",
    icon: Sparkles,
    items: [
      {
        title: "Embedding 测试",
        url: "/test/common/embedding",
        icon: Binary,
      },
    ],
  },
];
