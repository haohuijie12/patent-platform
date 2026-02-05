import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { CallbackHandler } from "@langfuse/langchain";

const langfuseHandler = new CallbackHandler();

// 技术方案优化模板
const PROPOSAL_OPTIMIZATION_TEMPLATE_STRING = `你是一位专业的专利代理师和专利审查专家。请对以下专利交底书中的"技术方案"部分进行优化，使其更加专业、清晰、完整，并符合专利撰写要求。

原始技术方案：
{text}

优化要求：
1. **技术特征明确化**：明确各技术特征及其相互关系
2. **逻辑层次清晰**：按照"问题-方案-效果"的逻辑展开
3. **术语规范化**：使用标准的技术术语和法律术语
4. **结构完整性**：确保包含必要的组成部分和连接关系
5. **创造性突出**：突出本发明的创新点和优势
6. **保护范围合理**：表述既要有适当宽度，又要有明确边界

根据优化类型的不同，请侧重以下方面：
- 标准优化（standard）：平衡专业性和可读性
- 详细优化（detailed）：增加技术细节和实施方式
- 简明优化（concise）：提炼核心，简洁表达
- 法律优化（legal）：强化法律保护角度的表述

优化类型：{optimizationType}

请直接输出优化后的技术方案文本，不要包含额外说明或评价。`;

// 创建 prompt 模板
const proposalPromptTemplate = ChatPromptTemplate.fromTemplate(
  PROPOSAL_OPTIMIZATION_TEMPLATE_STRING,
);

const model = new ChatOpenAI({
  modelName: process.env.OPENAI_CHAT_MODEL, // 使用统一的模型配置
  temperature: 0.3, // 较低的温度，保持稳定性
  openAIApiKey: process.env.OPENAI_API_KEY, // 使用统一的 OPENAI_API_KEY
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL, // 使用统一的 OPENAI_BASE_URL
  },
  timeout: 120000, // 120秒超时
  maxRetries: 1,
  streaming: true,
});

// 创建字符串输出解析器
const stringOutputParser = new StringOutputParser();

// 创建处理链
const proposalOptimizationChain = RunnableSequence.from([
  proposalPromptTemplate,
  model,
  stringOutputParser,
]);

/**
 * 流式优化专利技术方案
 * @param params 包含技术方案文本和优化类型
 * @returns ReadableStream
 */
export async function streamProposalText(params: {
  text: string;
  optimizationType: string;
}) {
  try {
    console.log("开始优化技术方案，优化类型:", params.optimizationType);
    const stream = await proposalOptimizationChain.stream(params, {
      callbacks: [langfuseHandler],
    });
    return stream;
  } catch (error) {
    console.error("技术方案优化时发生错误:", error);
    throw new Error("技术方案优化失败，请检查API配置");
  }
}

/**
 * 普通方式优化专利技术方案
 * @param params 包含技术方案文本和优化类型
 * @returns Promise<string> 优化后的技术方案文本
 */
export async function optimizeProposalText(params: {
  text: string;
  optimizationType: string;
}): Promise<string> {
  try {
    const result = await proposalOptimizationChain.invoke(params, {
      callbacks: [langfuseHandler],
    });
    return result;
  } catch (error) {
    console.error("技术方案优化时发生错误:", error);
    throw new Error("技术方案优化失败");
  }
}

export { proposalOptimizationChain };
