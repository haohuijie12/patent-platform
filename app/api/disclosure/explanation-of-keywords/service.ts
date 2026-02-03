import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const KEYWORDS_EXPLANATION_SYSTEM_PROMPT = `你是一位专业的专利代理师，请根据以下提供的技术方案，提取其中的关键技术术语，并给出通俗易懂的解释，以便于专利审查员或公众理解。

撰写要求：
1. **提取关键词**：识别出方案中的核心技术术语、专业词汇或缩写（如SEI膜、FEC等）。
2. **解释**：对每个术语进行简洁明了的解释。解释应准确，并结合上下文（如果可能）。
3. **格式**：请输出合法的 JSON 格式。
   - 返回一个对象，包含一个 "keywords" 数组。
   - 每个数组元素是一个对象，包含 "term"（术语名称）和 "explanation"（解释内容）两个字段。
   - 示例：
     {
       "keywords": [
         {
           "term": "SEI膜",
           "explanation": "固体电解质界面膜，是锂离子电池负极表面形成的一层钝化膜..."
         }
       ]
     }
4. **数量**：提取3-10个最关键的术语。

请直接输出 JSON 结果，不要包含 Markdown 代码块标记（如 \`\`\`json），也不要包含开场白。`;

/**
 * 流式生成关键词解释
 * @param params 包含技术方案的对象
 * @returns AsyncGenerator<string>
 */
export async function streamKeywordsExplanation(params: {
  techSolution: string;
}) {
  try {
    console.log("开始执行关键词解释生成 (OpenAI SDK)");
    console.log("使用模型:", process.env.DEEPSEEK_CHAT_MODEL);

    const stream = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_CHAT_MODEL || "deepseek-reasoner",
      messages: [
        { role: "system", content: KEYWORDS_EXPLANATION_SYSTEM_PROMPT },
        {
          role: "user",
          content: `输入技术方案：\n${params.techSolution}`,
        },
      ],
      stream: true,
    });

    console.log("OpenAI stream 创建成功");

    // 返回一个异步生成器，适配 route.ts 的处理逻辑
    return (async function* () {
      for await (const chunk of stream) {
        // DeepSeek Reasoner 可能会返回 reasoning_content，也可以返回 content
        // 这里我们只取 content 作为最终输出
        // 如果需要显示思考过程，可以额外处理 reasoning_content
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          yield content;
        }
      }
    })();
  } catch (error) {
    console.error("关键词解释生成时发生错误 (OpenAI SDK):", error);
    throw new Error("关键词解释生成失败");
  }
}
