import { Solar, Lunar } from 'lunar-javascript';

export interface BaziData {
  bazi: string[];
  wuxing: string[];
  dayMaster: string;
  dayMasterElement: string;
  elementsCount: Record<string, number>;
  elementsPercentage: Record<string, number>;
  favorableElements: string[];
  unfavorableElements: string[];
  summary: string;
}

const WU_XING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

const SHENG_MAP: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
const KE_MAP: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };

export function calculateBazi(date: Date, isLunar: boolean = false): BaziData {
  let solar;
  if (isLunar) {
    const lunar = Lunar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
    solar = lunar.getSolar();
  } else {
    solar = Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
  }

  const lunar = solar.getLunar();
  const baZi = lunar.getEightChar();

  const bazi = [
    baZi.getYearGan(), baZi.getYearZhi(),
    baZi.getMonthGan(), baZi.getMonthZhi(),
    baZi.getDayGan(), baZi.getDayZhi(),
    baZi.getTimeGan(), baZi.getTimeZhi()
  ];

  const wuxing = bazi.map(char => WU_XING_MAP[char]);

  const elementsCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  wuxing.forEach(el => {
    if (elementsCount[el] !== undefined) {
      elementsCount[el]++;
    }
  });

  const total = 8;
  const elementsPercentage: Record<string, number> = {};
  for (const el in elementsCount) {
    elementsPercentage[el] = Math.round((elementsCount[el] / total) * 100);
  }

  const dayMaster = bazi[4];
  const dayMasterElement = WU_XING_MAP[dayMaster];

  // Simplified Strong/Weak calculation
  const motherElement = Object.keys(SHENG_MAP).find(key => SHENG_MAP[key] === dayMasterElement)!;
  
  let supportScore = 0;
  wuxing.forEach(el => {
    if (el === dayMasterElement || el === motherElement) {
      supportScore++;
    }
  });

  const monthZhiElement = wuxing[3];
  if (monthZhiElement === dayMasterElement || monthZhiElement === motherElement) {
    supportScore += 1; // Extra weight for month
  }

  const isStrong = supportScore >= 4.5;

  let favorableElements: string[] = [];
  let unfavorableElements: string[] = [];

  const childElement = SHENG_MAP[dayMasterElement];
  const wealthElement = KE_MAP[dayMasterElement];
  const officerElement = Object.keys(KE_MAP).find(key => KE_MAP[key] === dayMasterElement)!;

  if (isStrong) {
    favorableElements = [childElement, wealthElement, officerElement];
    unfavorableElements = [dayMasterElement, motherElement];
  } else {
    favorableElements = [dayMasterElement, motherElement];
    unfavorableElements = [childElement, wealthElement, officerElement];
  }

  return {
    bazi,
    wuxing,
    dayMaster,
    dayMasterElement,
    elementsCount,
    elementsPercentage,
    favorableElements,
    unfavorableElements,
    summary: `日主${dayMaster}${dayMasterElement}，生于${bazi[3]}月。五行${isStrong ? '身强' : '身弱'}，喜用神为${favorableElements.join('、')}。`
  };
}
