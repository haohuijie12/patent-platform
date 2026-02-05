import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { CallbackHandler } from "@langfuse/langchain";

const langfuseHandler = new CallbackHandler();

// 1. 核心改动：将“背景技术生成”提示词改为“关键词推荐”提示词
const KEYWORD_RECOMMENDATION_TEMPLATE = `你是一位资深的专利审查员。请根据用户提供的核心专利关键词，生成一批高度相关、可用于专利检索或技术情报分析的扩展关联词。

输入信息：
1. 核心专利关键词：{coreKeyword}
2. 期望关联词数量：{desiredCount}

生成要求：
1. **关联维度**：生成的关联词应涵盖以下多个维度：
   - **同义词/近义词**：技术概念相同或极相近的表述。
   - **缩写/简称**：该技术术语的通用缩写、英文简称或行业惯用语（如“人工智能”->“AI”）。
   - **上下位概念**：更宽泛（上位词）或更具体（下位词）的技术术语。
   - **技术关联词**：经常与该核心技术共同出现、配套使用或处于同一技术流程的其他关键技术。
   - **应用场景词**：该技术具体应用的领域或场景。
2. **输出格式**：请输出合法的 JSON 格式。
   - 返回一个对象，包含一个 "recommendations" 数组。
   - 数组中的每个元素为字符串，即推荐的关联词。
   - 示例：
     {{
       "recommendations": ["机器学习", "深度学习", "神经网络模型", "图像识别", "算法优化"]
     }}
3. **质量要求**：关联词必须专业、精准，符合专利数据库的常用术语习惯。

请直接输出 JSON 结果，不要包含 Markdown 代码块标记（如 \`\`\`json），也不要包含开场白。`;

// 创建提示词模板
const keywordPromptTemplate = ChatPromptTemplate.fromTemplate(
  KEYWORD_RECOMMENDATION_TEMPLATE,
);

// 2. 模型配置
const model = new ChatOpenAI({
  modelName: process.env.OPENAI_CHAT_MODEL, // 使用统一的模型配置
  temperature: 0.3, // 较低的温度，保持稳定性
  openAIApiKey: process.env.OPENAI_API_KEY, // 使用统一的 OPENAI_API_KEY
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL, // 使用统一的 OPENAI_BASE_URL
  },
  timeout: 120000, // 120秒超时
  maxRetries: 1,
  streaming: false,
});

// 创建 JSON 输出解析器
const jsonOutputParser = new JsonOutputParser();

// 创建处理链
const keywordRecommendationChain = RunnableSequence.from([
  keywordPromptTemplate,
  model,
  jsonOutputParser,
]);

/**
 * 生成专利关键词关联词
 * @param params 包含核心关键词和期望数量的对象
 * @returns Promise<object> 生成的关联词对象
 */
export async function generateKeywords(params: {
  coreKeyword: string;
  desiredCount: number;
}): Promise<object> {
  try {
    const timeoutPromise = new Promise<object>((_, reject) => {
      setTimeout(() => reject(new Error("关键词推荐生成超时")), 20000);
    });

    const result = await Promise.race([
      keywordRecommendationChain.invoke(params, {
        callbacks: [langfuseHandler],
      }),
      timeoutPromise,
    ]);

    return result;
  } catch (error) {
    console.error("关键词推荐生成时发生错误:", error);
    throw error;
  }
}

// 可选导出链，供需要时使用
export { keywordRecommendationChain };
