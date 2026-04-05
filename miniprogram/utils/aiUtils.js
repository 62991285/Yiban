// AI 工具函数 - 最基础的 AI 功能
const {
  retrieveRelevantKnowledge,
  formatKnowledgeAsString,
  getRelevantLinks,
} = require("./knowledgeBase.js");

/**
 * 调用 AI 模型获取回复
 * @param {string} userMessage - 用户输入的消息
 * @param {number} retryCount - 重试次数
 * @returns {Promise<string>} AI 回复内容
 */
export async function callAIModel(userMessage, retryCount = 0) {
  const MAX_RETRIES = 2;
  const TIMEOUT = 15000;

  // 局部函数：判断是否应该重试
  const shouldRetry = (error) => {
    const retryableErrors = [
      "request:fail",
      "timeout",
      "网络错误",
      "网络不可用",
      "ECONNRESET",
      "ETIMEDOUT",
    ];
    const errorMessage = error.message || error.errMsg || String(error);
    return retryableErrors.some((keyword) => errorMessage.includes(keyword));
  };

  // 局部函数：延迟
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    if (!wx.cloud || !wx.cloud.extend || !wx.cloud.extend.AI) {
      throw new Error("AI服务未初始化，请检查云开发配置");
    }

    const model = wx.cloud.extend.AI.createModel("hunyuan-exp");

    // RAG检索相关知识
    const relevantKnowledge = retrieveRelevantKnowledge(userMessage, 3);
    const knowledgeContext = formatKnowledgeAsString(relevantKnowledge);

    // 构建增强的提示词
    const enhancedPrompt = buildEnhancedPrompt(userMessage, knowledgeContext);

    const aiCallPromise = (async () => {
      const result = await model.streamText({
        data: {
          model: "hunyuan-turbos-latest",
          messages: [{ role: "user", content: enhancedPrompt }],
        },
      });

      let fullText = "";
      for await (let event of result.eventStream) {
        if (event.data === "[DONE]") {
          break;
        }
        const data = JSON.parse(event.data);

        const think = data?.choices?.[0]?.delta?.reasoning_content;
        if (think) {
          console.log(think);
        }

        const text = data?.choices?.[0]?.delta?.content;
        if (text) {
          console.log(text);
          fullText += text;
        }
      }
      return fullText;
    })();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), TIMEOUT);
    });

    const text = await Promise.race([aiCallPromise, timeoutPromise]);

    if (!text || text.trim() === "") {
      throw new Error("AI返回内容为空");
    }

    // 添加知识库引用
    if (relevantKnowledge.length > 0) {
      const links = getRelevantLinks(relevantKnowledge);
      if (links.length > 0) {
        const linksText =
          "\n\n【相关功能】\n" +
          links.map((link) => `• ${link.icon} ${link.name}`).join("\n");
        return text + linksText;
      }
    }

    return text;
  } catch (error) {
    console.error(
      `callAIModel 错误 (重试 ${retryCount}/${MAX_RETRIES}):`,
      error,
    );

    if (retryCount < MAX_RETRIES && shouldRetry(error)) {
      console.log(`正在重试第 ${retryCount + 1} 次...`);
      await delay(1000 * (retryCount + 1));
      return callAIModel(userMessage, retryCount + 1);
    }

    throw error;
  }
}

/**
 * 构建增强的提示词（RAG）
 * @param {string} userMessage - 用户消息
 * @param {string} knowledgeContext - 知识库上下文
 * @returns {string} 增强后的提示词
 */
function buildEnhancedPrompt(userMessage, knowledgeContext) {
  const systemPrompt = `你是"医伴"，一位温暖贴心的AI健康陪伴助手。正在陪伴用户看病就医。

【回答要求】
1. 简短亲切：每次回复控制在2-3句话，像朋友聊天一样自然
2. 专业温暖：医学信息准确，语气温柔关切
3. 对话感强：先回应用户情绪，再给出建议，最后可问"还有什么想了解的？"
4. 逐步展开：用户追问时再详细解释，不一次性说太多
5. 安全提醒：急重症必须建议立即就医
6. 知识库优先：如果知识库中有相关信息，优先使用知识库内容并引导用户使用相关功能

【示例风格】
- "别担心，这种情况很常见。可能是轻微感冒，多喝温水休息就好。还有哪里不舒服吗？"
- "理解您的担心。这个指标稍微偏高，建议复查确认。您最近饮食如何？"

【禁忌】
- 不长篇大论
- 不罗列123条
- 不冷冰冰说教

请像朋友一样简短回复：`;

  if (knowledgeContext) {
    return `${systemPrompt}\n\n【知识库参考】\n${knowledgeContext}\n\n用户问题：${userMessage}\n\n医伴：`;
  }

  return `${systemPrompt}\n\n用户问题：${userMessage}\n\n医伴：`;
}
