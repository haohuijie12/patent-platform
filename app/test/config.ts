import { FileText, Search, Type, FileOutput, Sparkles } from "lucide-react";

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
        title: "交底书模板导出",
        url: "/test/disclosure/template-export",
        icon: FileOutput,
      },
      {
        title: "技术背景生成",
        url: "/test/disclosure/background-generation",
        icon: Type,
      },
      {
        title: " “有益效果”和“预保护点”生成",
        url: "/test/disclosure/technical-effect-generation",
        icon: Sparkles,
        title: "关键词解释",
        url: "/test/disclosure/explanation-of-keywords",
        icon: Search,
      },
    ],
  },
  {
    title: "专利检索式",
    icon: Search,
    items: [
      // 预留位置，暂时为空，或者可以加一个待开发的页面
    ],
  },
];
