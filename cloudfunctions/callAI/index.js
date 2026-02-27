// cloudfunctions/callAI/index.js
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

console.log('CODEBUDDY_DEBUG cloud init done')

// 支持两种调用方式：
// 1. 通过云开发AI大模型（推荐）
// 2. 直接调用混元API
let aiModel = null
console.log('CODEBUDDY_DEBUG before getAIModel, cloud.DYNAMIC_CURRENT_ENV=', cloud.DYNAMIC_CURRENT_ENV)
try {
  aiModel = cloud.getAIModel()
  console.log('CODEBUDDY_DEBUG getAIModel success aiModel=', aiModel ? 'exists' : 'null')
  console.log('CODEBUDDY_DEBUG aiModel type=', typeof aiModel)
  console.log('CODEBUDDY_DEBUG aiModel has chat?', typeof aiModel?.chat === 'function')
} catch (err) {
  console.error('CODEBUDDY_DEBUG getAIModel failed err=', err)
  console.error('CODEBUDDY_DEBUG getAIModel failed err.message=', err.message)
  console.error('CODEBUDDY_DEBUG getAIModel failed err.stack=', err.stack)
}

exports.main = async (event, context) => {
  console.log('CODEBUDDY_DEBUG cloudfunction called event=', event)
  console.log('CODEBUDDY_DEBUG cloudfunction aiModel=', aiModel ? 'exists' : 'null')

  const { type = 'chat', messages = [], dialogueRecord = [] } = event

  try {
    console.log('CODEBUDDY_DEBUG type=', type, 'messages.length=', messages.length, 'dialogueRecord.length=', dialogueRecord.length)

    if (type === 'chat') {
      // 简单对话模式
      console.log('CODEBUDDY_DEBUG calling aiModel.chat with messages=', messages)
      console.log('CODEBUDDY_DEBUG aiModel before chat=', aiModel ? 'exists' : 'null')

      if (!aiModel) {
        console.error('CODEBUDDY_DEBUG aiModel is null, cannot call chat')
        return {
          success: false,
          error: 'AI模型未初始化，请检查云开发环境配置'
        }
      }

      const result = await aiModel.chat({
        model: 'hunyuan-lite',
        messages: messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 500
      })

      console.log('CODEBUDDY_DEBUG aiModel.chat result=', result)

      return {
        success: true,
        reply: result.choices?.[0]?.message?.content || '抱歉，AI暂时无法回复'
      }
    }
    else if (type === 'triage') {
      // 分诊模式：基于对话记录生成分诊建议
      console.log('CODEBUDDY_DEBUG triage mode aiModel=', aiModel ? 'exists' : 'null')

      if (!aiModel) {
        console.error('CODEBUDDY_DEBUG triage mode aiModel is null, cannot call chat')
        return {
          success: false,
          error: 'AI模型未初始化，请检查云开发环境配置'
        }
      }

      let prompt = `你是一名专业医生，请根据以下患者问诊记录给出分诊建议：\n\n`
      dialogueRecord.forEach((item, index) => {
        prompt += `第${item.stage}问：${item.question}\n患者回答：${item.answer}\n\n`
      })
      prompt += `请用简明扼要的中文给出：\n1. 症状评估\n2. 建议就医级别\n3. 推荐科室\n4. 注意事项\n\n最后请提醒：此建议仅供参考，不能替代专业医生的诊断。如有紧急情况，请立即前往急诊科就诊。`

      console.log('CODEBUDDY_DEBUG triage prompt length=', prompt.length)

      const result = await aiModel.chat({
        model: 'hunyuan-lite',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 800
      })

      console.log('CODEBUDDY_DEBUG triage aiModel.chat result=', result)

      const advice = result.choices?.[0]?.message?.content || '未能获取AI建议'

      return {
        success: true,
        advice: advice
      }
    }

    return { success: false, error: '不支持的调用类型' }

  } catch (err) {
    console.error('CODEBUDDY_DEBUG cloudfunction catch err=', err)
    return {
      success: false,
      error: err.message || 'AI调用失败'
    }
  }
}