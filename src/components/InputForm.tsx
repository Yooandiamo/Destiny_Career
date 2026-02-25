import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Key, Sparkles, X, Check, ChevronDown } from 'lucide-react';
import { locationData } from '../utils/locationData';

interface InputFormProps {
  onSubmit: (data: any) => void;
}

function ScrollPicker({ options, value, onChange }: { options: {label: string, value: number}[], value: number, onChange: (v: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 44;
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const index = options.findIndex(o => o.value === value);
      if (index !== -1) {
        containerRef.current.scrollTop = index * itemHeight;
      }
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    scrollTimeout.current = setTimeout(() => {
      const index = Math.round(scrollTop / itemHeight);
      if (options[index] && options[index].value !== value) {
        onChange(options[index].value);
      }
    }, 100);
  };

  return (
    <div className="relative h-[220px] flex-1 overflow-hidden">
      <div className="absolute top-1/2 left-0 right-0 h-[44px] -translate-y-1/2 border-y border-slate-700/50 pointer-events-none bg-slate-800/30"></div>
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory hide-scrollbar scroll-smooth"
        onScroll={handleScroll}
      >
        <div style={{ height: '88px' }}></div>
        {options.map((opt) => (
          <div 
            key={opt.value}
            className={`h-[44px] flex items-center justify-center snap-center text-base transition-all duration-200 ${value === opt.value ? 'text-amber-500 font-bold scale-110' : 'text-slate-500'}`}
            onClick={() => {
              onChange(opt.value);
              const index = options.findIndex(o => o.value === opt.value);
              if (containerRef.current) {
                containerRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
              }
            }}
          >
            {opt.label}
          </div>
        ))}
        <div style={{ height: '88px' }}></div>
      </div>
    </div>
  );
}

function BottomSheet({ isOpen, onClose, title, onConfirm, children }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-[#0f172a] rounded-t-2xl border-t border-slate-800 w-full relative z-10 animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-center p-4 border-b border-slate-800/50">
          <button type="button" onClick={onClose} className="text-slate-400 p-2 hover:text-slate-300 transition-colors">
            <X size={24} strokeWidth={1.5} />
          </button>
          <h3 className="text-slate-200 font-medium text-sm">{title}</h3>
          <button type="button" onClick={onConfirm} className="text-amber-500 p-2 hover:text-amber-400 transition-colors">
            <Check size={24} strokeWidth={2} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const [isLunar, setIsLunar] = useState(false);
  
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  
  const [province, setProvince] = useState('北京');
  const [city, setCity] = useState('北京');
  
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [accessCode, setAccessCode] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [tempYear, setTempYear] = useState(year);
  const [tempMonth, setTempMonth] = useState(month);
  const [tempDay, setTempDay] = useState(day);
  
  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);

  const years = Array.from({ length: 100 }, (_, i) => ({ value: 2026 - i, label: `${2026 - i}年` }));
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }));
  const daysInMonth = new Date(tempYear, tempMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => ({ value: i + 1, label: `${i + 1}日` }));

  const hours = Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${i.toString().padStart(2, '0')}时` }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({ value: i, label: `${i.toString().padStart(2, '0')}分` }));

  useEffect(() => {
    if (tempDay > daysInMonth) {
      setTempDay(daysInMonth);
    }
  }, [tempYear, tempMonth, daysInMonth]);

  const openDatePicker = () => {
    setTempYear(year);
    setTempMonth(month);
    setTempDay(day);
    setShowDatePicker(true);
  };

  const confirmDatePicker = () => {
    setYear(tempYear);
    setMonth(tempMonth);
    setDay(tempDay);
    setShowDatePicker(false);
  };

  const openTimePicker = () => {
    setTempHour(hour);
    setTempMinute(minute);
    setShowTimePicker(true);
  };

  const confirmTimePicker = () => {
    setHour(tempHour);
    setMinute(tempMinute);
    setShowTimePicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const birthDate = new Date(year, month - 1, day, hour, minute);
    onSubmit({
      date: birthDate,
      isLunar,
      gender,
      location: { province, city },
      accessCode
    });
  };

  return (
    <div className="max-w-md mx-auto w-full p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gradient-gold mb-2 tracking-widest">天命职场</h1>
        <p className="text-slate-400 text-sm tracking-widest">输入出生信息，探寻你的本命磁场</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Calendar Type Toggle */}
        <div className="flex p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <button
            type="button"
            onClick={() => setIsLunar(false)}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${!isLunar ? 'bg-slate-700 text-amber-400 shadow-md' : 'text-slate-400 hover:text-slate-300'}`}
          >
            <Calendar className="inline-block w-4 h-4 mr-2" />
            公历 (阳历)
          </button>
          <button
            type="button"
            onClick={() => setIsLunar(true)}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${isLunar ? 'bg-slate-700 text-amber-400 shadow-md' : 'text-slate-400 hover:text-slate-300'}`}
          >
            <Calendar className="inline-block w-4 h-4 mr-2" />
            农历 (阴历)
          </button>
        </div>

        {/* Date Input */}
        <div className="space-y-2">
          <label className="block text-xs text-slate-400 text-center tracking-widest">出生日期 ({isLunar ? '农历' : '公历'})</label>
          <div 
            onClick={openDatePicker}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-center cursor-pointer hover:border-slate-600 transition-all flex items-center justify-between"
          >
            <span className="flex-1">{year}年 {month}月 {day}日</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* Time Input */}
        <div className="space-y-2">
          <label className="block text-xs text-slate-400 text-center tracking-widest">出生时间 (TIME)</label>
          <div 
            onClick={openTimePicker}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-center cursor-pointer hover:border-slate-600 transition-all flex items-center justify-between"
          >
            <span className="flex-1">{hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* Location Input */}
        <div className="space-y-2">
          <label className="block text-xs text-slate-400 text-center tracking-widest flex items-center justify-center gap-1">
            出生地点 (LOCATION)
          </label>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setCity(locationData[e.target.value]?.[0] || '');
                }}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all appearance-none text-center"
              >
                <option value="" disabled>省份/地区</option>
                {Object.keys(locationData).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            
            <div className="flex-1 relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all appearance-none text-center"
              >
                <option value="" disabled>城市</option>
                {(locationData[province] || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
          <label className="block text-xs text-slate-400 text-center tracking-widest">性别 (GENDER)</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setGender('M')}
              className={`flex-1 py-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${gender === 'M' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'}`}
            >
              <User className="w-6 h-6" />
              <span className="text-sm">乾造 (男)</span>
            </button>
            <button
              type="button"
              onClick={() => setGender('F')}
              className={`flex-1 py-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${gender === 'F' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'}`}
            >
              <User className="w-6 h-6" />
              <span className="text-sm">坤造 (女)</span>
            </button>
          </div>
        </div>

        {/* Access Code */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Key className="h-5 w-5 text-amber-500/50" />
          </div>
          <input
            type="text"
            placeholder="在此输入解锁码 (选填)"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-medium py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2"
        >
          开始免费排盘
          <Sparkles className="w-5 h-5" />
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-600">结果仅供娱乐与参考。</p>
      </div>

      {/* Date Picker Modal */}
      <BottomSheet 
        isOpen={showDatePicker} 
        onClose={() => setShowDatePicker(false)} 
        onConfirm={confirmDatePicker}
        title={`选择出生日期 (${isLunar ? '农历' : '公历'})`}
      >
        <div className="flex gap-2">
          <ScrollPicker options={years} value={tempYear} onChange={setTempYear} />
          <ScrollPicker options={months} value={tempMonth} onChange={setTempMonth} />
          <ScrollPicker options={days} value={tempDay} onChange={setTempDay} />
        </div>
      </BottomSheet>

      {/* Time Picker Modal */}
      <BottomSheet 
        isOpen={showTimePicker} 
        onClose={() => setShowTimePicker(false)} 
        onConfirm={confirmTimePicker}
        title="选择出生时间"
      >
        <div className="flex gap-2">
          <ScrollPicker options={hours} value={tempHour} onChange={setTempHour} />
          <ScrollPicker options={minutes} value={tempMinute} onChange={setTempMinute} />
        </div>
      </BottomSheet>
    </div>
  );
}
