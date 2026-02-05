import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";

const KEYWORD_CLUSTERING_TEMPLATE = `你是一位资深的专利分析师。请将以下关键词按照技术相关性进行聚类分组。

输入信息：
1. 关键词列表：{keywords}
2. 期望聚类数量：{clusterCount}

生成要求：
1. **聚类维度**：根据关键词的语义相似性和技术关联性进行分组，考虑以下维度：
   - 同义词/近义词
   - 上下位概念
   - 技术关联词
   - 应用场景
2. **聚类数量**：尽量分成 {clusterCount} 组，但可以根据实际情况适当调整（如果关键词太少或太多）。
3. **类别命名**：为每个聚类给出一个简洁、专业的类别名称（2-6个字）。
4. **输出格式**：严格以 JSON 格式输出，不要有任何其他文字说明。
   
   输出格式示例：
   [
     {
       "id": 1,
       "name": "人工智能技术",
       "keywords": ["机器学习", "深度学习", "神经网络"]
     },
     {
       "id": 2,
       "name": "硬件设备",
       "keywords": ["GPU", "TPU", "芯片"]
     }
   ]

请直接输出 JSON，不要包含 Markdown 代码块标记或其他说明。`;

const clusteringPromptTemplate = ChatPromptTemplate.fromTemplate(
  KEYWORD_CLUSTERING_TEMPLATE,
);

const model = new ChatOpenAI({
  modelName: process.env.OPENAI_CHAT_MODEL || "deepseek-chat",
  temperature: 0.3,
  openAIApiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL || "https://api.deepseek.com/v1",
  },
  timeout: 30000,
  maxRetries: 1,
  streaming: true,
});

const stringOutputParser = new StringOutputParser();

const clusteringChain = RunnableSequence.from([
  clusteringPromptTemplate,
  model,
  stringOutputParser,
]);

export async function streamClusters(params: {
  keywords: string[];
  clusterCount: number;
}) {
  try {
    const stream = await clusteringChain.stream(params);
    return stream;
  } catch (error) {
    console.error("关键词聚类生成时发生错误:", error);
    throw new Error("关键词聚类生成失败");
  }
}

export async function generateClusters(params: {
  keywords: string[];
  clusterCount: number;
}): Promise<any[]> {
  try {
    const timeoutPromise = new Promise<any[]>((_, reject) => {
      setTimeout(() => reject(new Error("关键词聚类生成超时")), 20000);
    });

    const result = await Promise.race([
      clusteringChain.invoke(params),
      timeoutPromise,
    ]);

    let jsonResult: any[];
    try {
      jsonResult = JSON.parse(result as string);
    } catch (parseError) {
      const jsonMatch = (result as string).match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("无法解析聚类结果");
      }
    }

    return jsonResult;
  } catch (error) {
    console.error("关键词聚类生成时发生错误:", error);
    return [
      {
        id: 1,
        name: "默认分组",
        keywords: params.keywords.slice(0, 5),
      },
    ];
  }
}

export { clusteringChain };
