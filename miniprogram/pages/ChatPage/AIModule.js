// ChatPage AI 模块
// 包含 ChatPage 专用的 AI 功能

const {
  retrieveRelevantKnowledge,
  formatKnowledgeAsString,
  getRelevantLinks,
} = require("../utils/knowledgeBase.js");

/**
 * 获取聊天上下文
 * @param {Array} messages - 聊天消息数组
 * @param {number} maxHistory - 最大记录条数，默认20条
 * @returns {string} 格式化的聊天上下文
 */
export function getChatContext(messages, maxHistory = 20) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return "";
  }

  const chatMessages = messages.filter(
    (msg) => msg.speaker === "user" || msg.speaker === "ai",
  );

  const recentMessages = chatMessages.slice(-maxHistory);

  if (recentMessages.length === 0) {
    return "";
  }

  return recentMessages
    .map((msg) => {
      const role = msg.speaker === "user" ? "用户" : "医伴";
      const content = msg.content?.substring(0, 100) || "";
      return `${role}：${content}`;
    })
    .join("\n");
}

/**
 * 构建增强的提示词（RAG + 聊天上下文）
 * @param {string} userMessage - 用户消息
 * @param {string} knowledgeContext - 知识库上下文
 * @param {string} chatContext - 聊天上下文
 * @returns {string} 增强后的提示词
 */
function buildEnhancedPromptWithContext(
  userMessage,
  knowledgeContext,
  chatContext,
) {
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

  let prompt = `${systemPrompt}\n\n用户问题：${userMessage}\n\n医伴：`;

  if (chatContext) {
    prompt = `${systemPrompt}\n\n对话历史：\n${chatContext}\n\n用户问题：${userMessage}\n\n医伴：`;
  }

  if (knowledgeContext) {
    prompt = `${systemPrompt}\n\n【知识库参考】\n${knowledgeContext}\n\n用户问题：${userMessage}\n\n医伴：`;
  }

  if (chatContext && knowledgeContext) {
    prompt = `${systemPrompt}\n\n【知识库参考】\n${knowledgeContext}\n\n对话历史：\n${chatContext}\n\n用户问题：${userMessage}\n\n医伴：`;
  }

  return prompt;
}

/**
 * 调用 AI 模型获取回复（带聊天上下文）
 * @param {string} userMessage - 用户输入的消息
 * @param {Array} messages - 聊天历史消息
 * @param {number} retryCount - 重试次数
 * @returns {Promise<Object>} AI 回复内容和相关链接
 *   {
 *     text: string,        // AI回复的文本内容
 *     pagelinks: Array,    // 相关链接数组
 *   }
 */
export async function callAIModelWithContext(
  userMessage,
  messages,
  retryCount = 0,
) {
  const MAX_RETRIES = 2;
  const TIMEOUT = 15000;

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

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    if (!wx.cloud || !wx.cloud.extend || !wx.cloud.extend.AI) {
      throw new Error("AI服务未初始化，请检查云开发配置");
    }

    const model = wx.cloud.extend.AI.createModel("hunyuan-exp");

    const relevantKnowledge = retrieveRelevantKnowledge(userMessage, 3);
    const knowledgeContext = formatKnowledgeAsString(relevantKnowledge);
    const chatContext = getChatContext(messages, 20);
    const enhancedPrompt = buildEnhancedPromptWithContext(
      userMessage,
      knowledgeContext,
      chatContext,
    );

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
      return {
        text: fullText,
        links: getRelevantLinks(relevantKnowledge),
      };
    })();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), TIMEOUT);
    });

    const result = await Promise.race([aiCallPromise, timeoutPromise]);

    if (!result.text || result.text.trim() === "") {
      throw new Error("AI返回内容为空");
    }

    return {
      text: result.text,
      pagelinks: result.links.length > 0 ? result.links : null,
    };
  } catch (error) {
    console.error(
      `callAIModelWithContext 错误 (重试 ${retryCount}/${MAX_RETRIES}):`,
      error,
    );

    if (retryCount < MAX_RETRIES && shouldRetry(error)) {
      console.log(`正在重试第 ${retryCount + 1} 次...`);
      await delay(1000 * (retryCount + 1));
      return callAIModelWithContext(userMessage, messages, retryCount + 1);
    }

    throw error;
  }
}
