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

  const { baziData, assessmentData, accessCode } = body || {};

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
十神排盘：${baziData.tenGods?.join(' ') || '未提供'}
系统初步判定喜用神：${baziData.favorableElements.join('、')}
系统初步判定忌神：${baziData.unfavorableElements.join('、')}

【后天心理与职业兴趣测试】
现实型(R)-动手/机械：${assessmentData?.scores?.R || 0}分
研究型(I)-分析/逻辑：${assessmentData?.scores?.I || 0}分
艺术型(A)-创意/表达：${assessmentData?.scores?.A || 0}分
社会型(S)-助人/社交：${assessmentData?.scores?.S || 0}分
企业型(E)-领导/商业：${assessmentData?.scores?.E || 0}分
常规型(C)-组织/细节：${assessmentData?.scores?.C || 0}分
最高得分维度：${assessmentData?.topTraits?.join('、') || '未提供'}

【任务要求】
1. 精准判定喜用神与格局：请参考系统初步判定的喜用神，结合“十神排盘”和八字的旺衰、调候、通关等专业命理原则，给出最终的“喜用神”、“忌神”以及所属“格局”（如伤官生财格、建禄格、从弱格等）。
2. 深度性格剖析：
   - **八字命理分析**：根据日主天干、十神、格局等，分析其先天性格特质（如：七杀旺主果断、食神旺主温和）。
   - **职业兴趣分析**：根据测试结果（R/I/A/S/E/C），分析其后天职业兴趣倾向。
   - **综合推导逻辑**：对比先天命理与后天兴趣，分析二者是“相辅相成”还是“内在冲突”，并说明如何结合两者得出职业推荐。
3. 职业匹配逻辑：必须基于【先天命理】+【后天兴趣】的双重验证。例如：八字喜火且测试结果为“艺术型”，则强烈推荐设计、传媒；若八字喜金但测试结果为“社会型”，则推荐金融顾问或管理咨询（金的逻辑+S的社交）。
4. 详细的推荐理由：每个职业的推荐理由必须详细，明确说明该职业为何契合其【性格特质】、【命理格局】以及【职业兴趣】。每个理由字数【至少50字】。
5. 备选职业数量：除了1个“天选职业”外，必须提供【至少4个】备选职业。
6. 必须返回合法的 JSON 格式数据。

请返回以下 JSON 结构：
{
  "favorableElements": ["木", "火"], 
  "unfavorableElements": ["金", "水"], 
  "pattern": "格局名称", 
  "personality": "综合性格描述（200字左右）",
  "baziAnalysis": "八字命理视角的性格与天赋分析（100字左右）",
  "testAnalysis": "职业兴趣测试视角的性格与倾向分析（100字左右）",
  "synthesisLogic": "结合八字与测试结果的推导逻辑，说明为何推荐以下职业（100字左右）",
  "summary": "一句富有哲理的命运批语（30字以内）",
  "topCareer": {
    "name": "天选职业/行业名称",
    "matchScore": 98,
    "reason": "为什么这个职业最适合？请深度结合性格特质、十神、五行、格局进行专业解释，字数至少80字。",
    "keywords": ["关键词1", "关键词2", "关键词3"]
  },
  "otherCareers": [
    {
      "name": "备选职业1",
      "matchScore": 92,
      "reason": "详细推荐理由，结合性格与命理分析，字数至少50字。"
    }
  ]
}
    `;

    // Generate a deterministic seed based on the Bazi string so the same person gets the exact same result
    const baziString = baziData.bazi.join('');
    let seed = 0;
    for (let i = 0; i < baziString.length; i++) {
      seed = ((seed << 5) - seed) + baziString.charCodeAt(i);
      seed |= 0;
    }
    seed = Math.abs(seed);

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
        temperature: 0.5,
        seed: seed
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
