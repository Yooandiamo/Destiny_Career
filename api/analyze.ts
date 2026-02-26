export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const { baziData, accessCode } = body || {};

  // Simple paywall check (supports multiple comma-separated codes)
  const validCodes = (process.env.ACCESS_CODE || "888888").split(',').map(c => c.trim().toUpperCase());
  if (!validCodes.includes((accessCode || "").trim().toUpperCase())) {
    return res.status(403).json({ error: "无效的解锁码" });
  }

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API Key not configured" });
    }

    const prompt = `
作为一位精通中国传统八字命理（滴天髓、子平真诠）与现代职业规划的顶级专家，请根据以下用户的八字数据，进行最专业、深度的推演，并为其推荐最适合的职业方向。

【用户基础数据】
性别：${baziData.gender === 'M' ? '乾造 (男)' : '坤造 (女)'}
出生地：${baziData.location?.province || ''} ${baziData.location?.city || ''}
日主：${baziData.dayMaster} (${baziData.dayMasterElement})
八字排盘：${baziData.bazi.join(' ')}

【任务要求】
1. 重新精准判定喜用神与忌神：忽略系统初步给出的喜用神，请你根据八字的旺衰、格局（如正格、从格、化气格等）、调候、通关等专业命理原则，重新判定该八字的真正“喜用神”和“忌神”，以及所属“格局”。
2. 完善职业匹配逻辑：绝不能仅仅依据五行（如喜火就推荐IT）。必须深度结合“十神”（如伤官配印、食神生财、七杀化印、建禄格等）和“格局”来匹配职业。例如：七杀为用适合公检法或企业高管；伤官生财适合创业、演艺或营销；正印为用适合教育、科研等。
3. 详细的推荐理由：每个职业的推荐理由必须详细、有深度，结合该八字的十神、五行、格局进行专业解释。每个理由字数【至少50字】。
4. 备选职业数量：除了1个“天选职业”外，必须提供【至少4个】备选职业。
5. 必须返回合法的 JSON 格式数据。

请返回以下 JSON 结构：
{
  "favorableElements": ["木", "火"], 
  "unfavorableElements": ["金", "水"], 
  "pattern": "伤官生财格", 
  "summary": "对用户八字格局、性格特质与职业天赋的深度解析（约150字，语气神秘、专业、笃定）",
  "topCareer": {
    "name": "天选职业/行业名称",
    "matchScore": 98,
    "reason": "为什么这个职业最适合？请深度结合十神、五行、格局进行专业解释，字数至少80字。",
    "keywords": ["关键词1", "关键词2", "关键词3"]
  },
  "otherCareers": [
    {
      "name": "备选职业1",
      "matchScore": 92,
      "reason": "详细推荐理由，结合命理分析，字数至少50字。"
    }
  ]
}
    `;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个精通八字命理与现代职业规划的专家。请务必返回合法的 JSON 格式数据。" },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API Error:", errorData);
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const result = JSON.parse(resultText || "{}");
    res.status(200).json(result);
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "天机推演失败，请稍后再试" });
  }
}
