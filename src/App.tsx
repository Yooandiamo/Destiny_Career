import React, { useState } from 'react';
import InputForm from './components/InputForm';
import AssessmentView, { AssessmentData } from './components/AssessmentView';
import ResultsView from './components/ResultsView';
import { calculateBazi, BaziData } from './utils/baziHelper';

export default function App() {
  const [step, setStep] = useState<'input' | 'assessment' | 'results'>('input');
  const [baziData, setBaziData] = useState<BaziData | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [accessCode, setAccessCode] = useState('');

  const handleFormSubmit = (data: any) => {
    const calculated = calculateBazi(data.date, data.isLunar);
    setBaziData(calculated);
    setAccessCode(data.accessCode);
    setStep('assessment');
  };

  const handleAssessmentComplete = (data: AssessmentData) => {
    setAssessmentData(data);
    setStep('results');
  };

  const handleBack = () => {
    setStep('input');
    setBaziData(null);
    setAssessmentData(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        {step === 'input' && (
          <InputForm onSubmit={handleFormSubmit} />
        )}
        
        {step === 'assessment' && (
          <AssessmentView 
            onComplete={handleAssessmentComplete} 
            onBack={handleBack} 
          />
        )}

        {step === 'results' && baziData && assessmentData && (
          <ResultsView 
            baziData={baziData} 
            assessmentData={assessmentData}
            initialAccessCode={accessCode} 
            onBack={handleBack} 
          />
        )}
      </main>
    </div>
  );
}
