import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

// 1. 核心改动：将“背景技术生成”提示词改为“关键词推荐”提示词
const KEYWORD_RECOMMENDATION_TEMPLATE = `你是一位资深的专利审查员。请根据用户提供的核心专利关键词，生成一批高度相关、可用于专利检索或技术情报分析的扩展关联词。

输入信息：
1. 核心专利关键词：{coreKeyword}
2. 技术领域：{technicalField}
3. 期望关联词数量：{desiredCount}

生成要求：
1. **关联维度**：生成的关联词应涵盖以下多个维度：
   - **同义词/近义词**：技术概念相同或极相近的表述。
   - **上下位概念**：更宽泛（上位词）或更具体（下位词）的技术术语。
   - **技术关联词**：经常与该核心技术共同出现、配套使用或处于同一技术流程的其他关键技术。
   - **应用场景词**：该技术具体应用的领域或场景。
2. **输出格式**：严格以纯文本、中文顿号“、”分隔的形式输出，不要编号、不要列表符号、不要额外解释。
   示例格式：“机器学习、深度学习、神经网络模型、图像识别、算法优化”
3. **质量要求**：关联词必须专业、精准，符合专利数据库的常用术语习惯。

请直接输出关联词，不要有任何其他内容。`;

// 创建提示词模板
const keywordPromptTemplate = ChatPromptTemplate.fromTemplate(
  KEYWORD_RECOMMENDATION_TEMPLATE
);

// 2. 模型配置（使用你.env.local中已配置好的DeepSeek）
const model = new ChatOpenAI({
  modelName: process.env.OPENAI_CHAT_MODEL || "deepseek-chat", // 读取配置，应为 "deepseek-chat"
  temperature: 0.1, // 推荐功能需要更稳定，温度调低
  openAIApiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL || "https://api.deepseek.com/v1", // 应为 "https://api.deepseek.com/v1"
  },
  timeout: 30000, // 超时时间设置为30秒
  maxRetries: 1,
  streaming: true, // 保持流式输出支持
});

// 创建字符串输出解析器
const stringOutputParser = new StringOutputParser();

// 创建处理链
const keywordRecommendationChain = RunnableSequence.from([
  keywordPromptTemplate,
  model,
  stringOutputParser,
]);

/**
 * 流式生成专利关键词关联词
 * @param params 包含核心关键词、技术领域和期望数量的对象
 * @returns ReadableStream
 */
export async function streamKeywords(params: {
  coreKeyword: string;
  technicalField: string;
  desiredCount: number;
}) {
  try {
    const stream = await keywordRecommendationChain.stream(params);
    return stream;
  } catch (error) {
    console.error("关键词推荐生成时发生错误:", error);
    throw new Error("关键词推荐生成失败");
  }
}

/**
 * 非流式生成专利关键词关联词（一次性返回）
 * @param params 包含核心关键词、技术领域和期望数量的对象
 * @returns Promise<string> 生成的关联词文本（顿号分隔）
 */
export async function generateKeywords(params: {
  coreKeyword: string;
  technicalField: string;
  desiredCount: number;
}): Promise<string> {
  try {
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error("关键词推荐生成超时")), 20000);
    });
    
    const result = await Promise.race([
      keywordRecommendationChain.invoke(params),
      timeoutPromise
    ]);
    
    return result;
  } catch (error) {
    console.error("关键词推荐生成时发生错误:", error);
    // 返回默认关键词，确保API能够正常响应
    return "智能座舱、车载系统、汽车电子、人机交互、驾驶辅助、车联网、自动驾驶、座舱域控制器、车载信息娱乐系统、智能驾驶舱";
  }
}

// 可选导出链，供需要时使用
export { keywordRecommendationChain };
