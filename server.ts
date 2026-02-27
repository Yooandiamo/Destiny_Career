import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/analyze", async (req, res) => {
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
作为一位精通中国传统八字命理（滴天髓、子平真诠）与现代职业规划的顶级专家，请根据以下用户的八字数据，进行最专业、深度的推演，并为其推荐最适合的职业方向。

【用户基础数据】
性别：${baziData.gender === 'M' ? '乾造 (男)' : '坤造 (女)'}
出生地：${baziData.location?.province || ''} ${baziData.location?.city || ''}
日主：${baziData.dayMaster} (${baziData.dayMasterElement})
八字排盘：${baziData.bazi.join(' ')}
十神排盘：${baziData.tenGods?.join(' ') || '未提供'}
系统初步判定喜用神：${baziData.favorableElements.join('、')}
系统初步判定忌神：${baziData.unfavorableElements.join('、')}

【任务要求】
1. 精准判定喜用神与格局：请参考系统初步判定的喜用神，结合“十神排盘”和八字的旺衰、调候、通关等专业命理原则，给出最终的“喜用神”、“忌神”以及所属“格局”（如伤官生财格、建禄格、从弱格等）。
2. 深度性格剖析：根据日主天干特性、八字中旺相的五行以及透出的“十神”（如七杀显露主威严冲动，食神旺相主温和享受等），深度剖析用户的内在性格、处事风格、核心优势与性格盲区。
3. 完善职业匹配逻辑（性格+命理双重驱动）：绝不能仅仅依据五行或喜用神。必须将“性格特质”作为核心考量因素，结合“十神”和“格局”来匹配职业。例如：即使喜火，但如果性格极度内向、印星重，就不适合做销售或公关（火），而更适合做后台研发、研究员或设计。
4. 详细的推荐理由：每个职业的推荐理由必须详细、有深度，明确说明该职业为何契合其【性格特质】以及【命理格局】。每个理由字数【至少50字】。
5. 备选职业数量：除了1个“天选职业”外，必须提供【至少4个】备选职业。
6. 必须返回合法的 JSON 格式数据。

请返回以下 JSON 结构：
{
  "favorableElements": ["木", "火"], 
  "unfavorableElements": ["金", "水"], 
  "pattern": "伤官生财格", 
  "personality": "性格特质深度解析（约100字，分析其内在性格、处事风格、优缺点等）",
  "summary": "对用户八字格局与职业天赋的综合解析（约150字，语气神秘、专业、笃定）",
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
      res.json(result);
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: "天机推演失败，请稍后再试" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
