import { BaziData } from "../utils/baziHelper";

export interface CareerRecommendation {
  summary: string;
  topCareer: {
    name: string;
    matchScore: number;
    reason: string;
    keywords: string[];
  };
  otherCareers: {
    name: string;
    matchScore: number;
    reason: string;
  }[];
}

export async function analyzeCareer(baziData: BaziData, accessCode: string): Promise<CareerRecommendation> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ baziData, accessCode }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '分析请求失败');
  }

  return response.json();
}
