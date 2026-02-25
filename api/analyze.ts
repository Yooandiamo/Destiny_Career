export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { baziData, accessCode } = req.body;

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
作为一位精通中国传统八字命理与现代职业规划的专家，请根据以下用户的八字数据，为其推荐最适合的职业方向。

【用户八字数据】
日主：${baziData.dayMaster} (${baziData.dayMasterElement})
八字：${baziData.bazi.join('')}
喜用神：${baziData.favorableElements.join('、')}
忌神：${baziData.unfavorableElements.join('、')}
命理摘要：${baziData.summary}

【五行与行业映射规则】（必须严格遵守）
- 木（Wood）：教育、培训、文化、出版、设计、农业、林业、医疗、环保、木材家具。
- 火（Fire）：互联网、人工智能、电子科技、能源、餐饮、美容美发、娱乐演艺、照明。
- 土（Earth）：房地产、建筑工程、农业、传统零售、咨询顾问、中介、矿产、仓储。
- 金（Metal）：金融、银行、证券、军警、五金制造、汽车、机械、珠宝钟表。
- 水（Water）：物流、国际贸易、旅游、销售、媒体公关、航海、水产、交通运输。

【任务要求】
1. 严格基于用户的“喜用神”来推荐职业。例如，如果喜用神是“火和木”，必须推荐互联网、教育、设计等行业。
2. 结合用户的格局给出深度解析。
3. 必须返回合法的 JSON 格式数据。

请返回以下 JSON 结构：
{
  "summary": "对用户八字格局与职业天赋的深度解析（约100字，语气神秘、专业）",
  "topCareer": {
    "name": "天选职业/行业名称",
    "matchScore": 95,
    "reason": "为什么这个职业最适合（结合喜用神和行业属性解释）",
    "keywords": ["关键词1", "关键词2", "关键词3"]
  },
  "otherCareers": [
    {
      "name": "备选职业1",
      "matchScore": 88,
      "reason": "简短推荐理由"
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
