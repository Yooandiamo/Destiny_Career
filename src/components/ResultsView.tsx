import React, { useState, useEffect } from 'react';
import { BaziData } from '../utils/baziHelper';
import { CareerRecommendation, analyzeCareer } from '../services/ai';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Lock, Unlock, Sparkles, MapPin, Briefcase, ArrowLeft, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ResultsViewProps {
  baziData: BaziData;
  initialAccessCode: string;
  onBack: () => void;
}

export default function ResultsView({ baziData, initialAccessCode, onBack }: ResultsViewProps) {
  const [accessCode, setAccessCode] = useState(initialAccessCode);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState<CareerRecommendation | null>(null);

  const radarData = Object.keys(baziData.elementsPercentage).map(key => ({
    subject: key,
    A: baziData.elementsPercentage[key],
    fullMark: 100,
  }));

  const handleUnlock = async () => {
    if (!accessCode) {
      setError('请输入解锁码');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await analyzeCareer(baziData, accessCode);
      setAiResult(result);
      setIsUnlocked(true);
    } catch (err: any) {
      setError(err.message || '解锁失败');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-unlock if code is provided initially
  useEffect(() => {
    if (initialAccessCode && !isUnlocked && !isLoading && !aiResult) {
      handleUnlock();
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto w-full p-4 pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-amber-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-amber-500 tracking-widest">命运罗盘</h2>
        <div className="text-xs text-slate-500">五行八字指南</div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-100 tracking-widest">命运启示</h1>
        <p className="text-slate-400 text-sm">日主 (本命): <span className="text-amber-500 font-bold text-lg">{baziData.dayMaster}</span></p>
      </div>

      {/* Bazi Pillars */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-2 text-amber-500 mb-4">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-medium">八字四柱 (基础盘)</h3>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {['年柱', '月柱', '日柱', '时柱'].map((label, i) => (
            <div key={label} className="bg-slate-800/50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-700/50">
              <span className="text-xs text-slate-500 mb-2">{label}</span>
              <span className={`text-2xl font-bold mb-1 ${getColorForElement(baziData.wuxing[i * 2])}`}>{baziData.bazi[i * 2]}</span>
              <span className={`text-2xl font-bold ${getColorForElement(baziData.wuxing[i * 2 + 1])}`}>{baziData.bazi[i * 2 + 1]}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <p className="text-sm text-slate-400 italic leading-relaxed">
            "{aiResult ? aiResult.summary : baziData.summary}"
          </p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 text-slate-300 mb-6">
          <div className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center text-xs">i</div>
          <h3 className="font-medium">五行能量平衡</h3>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="能量" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/2 space-y-3">
            {Object.keys(baziData.elementsPercentage).map(el => (
              <div key={el} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getBgColorForElement(el)}`}></div>
                  <span className="text-slate-300">{el}</span>
                </div>
                <span className="text-slate-400">{baziData.elementsPercentage[el]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Paywall / AI Results Section */}
      <div className="relative">
        {/* The Content (Blurred if locked) */}
        <div className={cn("transition-all duration-500 space-y-8", !isUnlocked && "blur-md opacity-50 select-none pointer-events-none")}>
          
          {/* Favorable/Unfavorable */}
          <div className="flex justify-center gap-4">
            <div className="px-6 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
              喜用: {aiResult ? aiResult.favorableElements.join(', ') : baziData.favorableElements.join(', ')}
            </div>
            <div className="px-6 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm">
              忌神: {aiResult ? aiResult.unfavorableElements.join(', ') : baziData.unfavorableElements.join(', ')}
            </div>
          </div>

          {aiResult && (
            <>
              <div className="text-center space-y-2 mt-12">
                <div className="inline-block px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-sm font-bold tracking-widest mb-2">
                  格局：{aiResult.pattern}
                </div>
                <div className="flex items-center justify-center gap-2 text-emerald-400 mb-4">
                  <MapPin className="w-5 h-5" />
                  <h3 className="font-medium text-lg">发现你的"天选职业"</h3>
                </div>
              </div>

              {/* Top Career Card */}
              <div className="glass-card p-8 border-emerald-500/30 bg-gradient-to-b from-slate-900/80 to-slate-900/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <Briefcase className="w-10 h-10 text-emerald-400" />
                  </div>
                  
                  <div>
                    <div className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 text-xs mb-3">
                      契合度
                    </div>
                    <div className="text-6xl font-bold text-emerald-400 mb-2 font-serif">
                      {aiResult.topCareer.matchScore}%
                    </div>
                    <h2 className="text-3xl font-bold text-slate-100 tracking-wider mt-4">
                      {aiResult.topCareer.name}
                    </h2>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {aiResult.topCareer.keywords.map(kw => (
                      <span key={kw} className="px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-sm">
                        {kw}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 p-5 bg-slate-800/40 rounded-xl border border-slate-700/50 text-left w-full">
                    <div className="text-emerald-500 font-bold mb-2 flex items-center gap-2">
                      <span className="text-2xl font-serif">"</span> 匹配理由
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {aiResult.topCareer.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Other Careers */}
              <div className="space-y-4">
                <h3 className="text-center text-slate-400 text-sm mb-6">其他适合你的职业</h3>
                
                {aiResult.otherCareers.map((career, idx) => (
                  <div key={idx} className="glass-card p-5 hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-bold text-slate-200">{career.name}</h4>
                      <span className="text-emerald-400 font-bold text-xl">{career.matchScore}%</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {career.reason}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Paywall Overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6">
            <div className="glass-card p-8 max-w-sm w-full text-center space-y-6 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-amber-500/50 flex items-center justify-center bg-amber-500/10">
                {isLoading ? (
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                ) : (
                  <Lock className="w-8 h-8 text-amber-500" />
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-amber-500 mb-2">正在连通天机</h3>
                <p className="text-sm text-slate-400">深度分析命局... 寻找本命职业...</p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="输入解锁码"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-center text-slate-200 focus:outline-none focus:border-amber-500/50 transition-all"
                />
                {error && <p className="text-rose-400 text-xs">{error}</p>}
                
                <button
                  onClick={handleUnlock}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? '解析中...' : '解锁天机'}
                  {!isLoading && <Unlock className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for colors
function getColorForElement(element: string) {
  switch (element) {
    case '金': return 'text-slate-300';
    case '木': return 'text-emerald-400';
    case '水': return 'text-blue-400';
    case '火': return 'text-rose-400';
    case '土': return 'text-amber-500';
    default: return 'text-slate-400';
  }
}

function getBgColorForElement(element: string) {
  switch (element) {
    case '金': return 'bg-slate-300';
    case '木': return 'bg-emerald-400';
    case '水': return 'bg-blue-400';
    case '火': return 'bg-rose-400';
    case '土': return 'bg-amber-500';
    default: return 'bg-slate-400';
  }
}
