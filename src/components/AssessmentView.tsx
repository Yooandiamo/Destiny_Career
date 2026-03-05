import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export interface AssessmentData {
  scores: {
    R: number; // Realistic
    I: number; // Investigative
    A: number; // Artistic
    S: number; // Social
    E: number; // Enterprising
    C: number; // Conventional
  };
  topTraits: string[];
}

interface AssessmentViewProps {
  onComplete: (data: AssessmentData) => void;
  onBack: () => void;
}

const QUESTIONS = [
  // Set 1
  {
    id: 'R1',
    category: 'R',
    type: '现实型 (Realistic)',
    desc: '动手操作、机械、户外',
    text: '我喜欢动手操作、修理物品、使用工具或在户外工作，而不是整天坐在办公室里。'
  },
  {
    id: 'I1',
    category: 'I',
    type: '研究型 (Investigative)',
    desc: '逻辑分析、科学、探索',
    text: '我喜欢深入研究复杂的问题，探索事物背后的逻辑、科学原理和真相。'
  },
  {
    id: 'A1',
    category: 'A',
    type: '艺术型 (Artistic)',
    desc: '创意、表达、审美',
    text: '我喜欢通过写作、绘画、音乐、设计等方式来表达自己的创意和个性。'
  },
  {
    id: 'S1',
    category: 'S',
    type: '社会型 (Social)',
    desc: '助人、教育、人际交往',
    text: '我喜欢与人打交道，乐于倾听他人的烦恼、帮助他人成长或传授知识。'
  },
  {
    id: 'E1',
    category: 'E',
    type: '企业型 (Enterprising)',
    desc: '领导、商业、说服',
    text: '我喜欢带领团队达成目标，在商业活动中说服他人，追求成就感和影响力。'
  },
  {
    id: 'C1',
    category: 'C',
    type: '常规型 (Conventional)',
    desc: '组织、细节、规则',
    text: '我喜欢有条理地整理数据、管理文件，做事严谨、注重细节和规则。'
  },
  // Set 2
  {
    id: 'R2',
    category: 'R',
    type: '现实型 (Realistic)',
    desc: '机械、技术、制造',
    text: '我喜欢使用精密仪器或重型机械，看到它们运转正常会很有成就感。'
  },
  {
    id: 'I2',
    category: 'I',
    type: '研究型 (Investigative)',
    desc: '数理、思考、求知',
    text: '我对自然科学（如物理、生物、天文）很感兴趣，喜欢阅读相关书籍或纪录片。'
  },
  {
    id: 'A2',
    category: 'A',
    type: '艺术型 (Artistic)',
    desc: '直觉、想象、创新',
    text: '我对美感有很高的要求，喜欢欣赏艺术作品、摄影或进行室内装饰。'
  },
  {
    id: 'S2',
    category: 'S',
    type: '社会型 (Social)',
    desc: '服务、咨询、同理心',
    text: '在团队中，我通常充当协调者的角色，善于化解矛盾，让大家合作愉快。'
  },
  {
    id: 'E2',
    category: 'E',
    type: '企业型 (Enterprising)',
    desc: '竞争、营销、管理',
    text: '我喜欢推销想法或产品，享受说服别人接受我的观点的过程。'
  },
  {
    id: 'C2',
    category: 'C',
    type: '常规型 (Conventional)',
    desc: '财务、数据、执行',
    text: '我做事喜欢按部就班，遵守既定的流程和规范，不喜欢突如其来的变化。'
  },
  // Set 3
  {
    id: 'R3',
    category: 'R',
    type: '现实型 (Realistic)',
    desc: '动植物、自然、体力',
    text: '我喜欢户外活动，比如种植花草、饲养动物或进行野外考察。'
  },
  {
    id: 'I3',
    category: 'I',
    type: '研究型 (Investigative)',
    desc: '分析、推理、解决问题',
    text: '遇到不懂的问题，我会刨根问底，直到弄清楚来龙去脉为止。'
  },
  {
    id: 'A3',
    category: 'A',
    type: '艺术型 (Artistic)',
    desc: '自由、感性、非传统',
    text: '我思维跳跃，经常会有一些天马行空的想法，不喜欢受传统观念的束缚。'
  },
  {
    id: 'S3',
    category: 'S',
    type: '社会型 (Social)',
    desc: '沟通、合作、关怀',
    text: '我很擅长察言观色，能敏锐地感知到他人的情绪变化并给予安慰。'
  },
  {
    id: 'E3',
    category: 'E',
    type: '企业型 (Enterprising)',
    desc: '决策、风险、收益',
    text: '我有野心，希望在工作中获得晋升、权力和更高的社会地位。'
  },
  {
    id: 'C3',
    category: 'C',
    type: '常规型 (Conventional)',
    desc: '计划、记录、准确',
    text: '我擅长制定计划和预算，并严格执行，确保每一分钱都花在刀刃上。'
  }
];

const OPTIONS = [
  { value: 5, label: '非常符合' },
  { value: 4, label: '比较符合' },
  { value: 3, label: '部分符合' },
  { value: 2, label: '不太符合' },
  { value: 1, label: '完全不符合' }
];

export default function AssessmentView({ onComplete, onBack }: AssessmentViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleSelect = (value: number) => {
    const currentQ = QUESTIONS[currentIndex];
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    if (currentIndex < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    } else {
      // Calculate results
      const scores: Record<string, number> = {
        R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
      };

      // Aggregate scores by category
      Object.entries(newAnswers).forEach(([qId, score]) => {
        const question = QUESTIONS.find(q => q.id === qId);
        if (question && question.category) {
          scores[question.category] = (scores[question.category] || 0) + score;
        }
      });

      // Find top 2 traits
      const sortedTraits = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .map(([category]) => {
          const q = QUESTIONS.find(q => q.category === category);
          return q ? q.type.split(' ')[0] : category;
        });

      setTimeout(() => {
        onComplete({
          scores: scores as AssessmentData['scores'],
          topTraits: sortedTraits.slice(0, 2)
        });
      }, 400);
    }
  };

  const currentQ = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto w-full p-4 pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-amber-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-amber-500 tracking-widest">职业兴趣测试</h2>
        <div className="w-9"></div> {/* Spacer for centering */}
      </div>

      <div className="glass-card p-6 md:p-8 space-y-8 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>职业兴趣测试</span>
            <span>{currentIndex + 1} / {QUESTIONS.length}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-amber-400 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          {currentQ.type}
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold text-slate-100 leading-relaxed">
            {currentQ.text}
          </h3>
          <p className="text-slate-400 text-sm">
            考察维度：{currentQ.desc}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-4">
          {OPTIONS.map((opt) => {
            const isSelected = answers[currentQ.id] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="font-medium">{opt.label}</span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-600'
                }`}>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-slate-900" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-slate-800/50">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors"
          >
            上一题
          </button>
          
          {answers[currentQ.id] && currentIndex < QUESTIONS.length - 1 && (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors"
            >
              下一题 <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
