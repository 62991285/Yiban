// AI 工具函数

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

    const aiCallPromise = (async () => {
      const result = await model.streamText({
        data: {
          model: "hunyuan-turbos-latest",
          messages: [{ role: "user", content: userMessage }],
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
