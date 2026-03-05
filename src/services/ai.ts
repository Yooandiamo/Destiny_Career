import { BaziData } from "../utils/baziHelper";
import { AssessmentData } from "../components/AssessmentView";

export interface CareerRecommendation {
  favorableElements: string[];
  unfavorableElements: string[];
  pattern: string;
  personality: string;
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

export async function analyzeCareer(baziData: BaziData, assessmentData: AssessmentData, accessCode: string): Promise<CareerRecommendation> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ baziData, assessmentData, accessCode }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '分析请求失败');
  }

  return response.json();
}
