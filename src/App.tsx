import React, { useState } from 'react';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';
import { calculateBazi, BaziData } from './utils/baziHelper';

export default function App() {
  const [baziData, setBaziData] = useState<BaziData | null>(null);
  const [accessCode, setAccessCode] = useState('');

  const handleFormSubmit = (data: any) => {
    const calculated = calculateBazi(data.date, data.isLunar);
    setBaziData(calculated);
    setAccessCode(data.accessCode);
  };

  const handleBack = () => {
    setBaziData(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        {!baziData ? (
          <InputForm onSubmit={handleFormSubmit} />
        ) : (
          <ResultsView 
            baziData={baziData} 
            initialAccessCode={accessCode} 
            onBack={handleBack} 
          />
        )}
      </main>
    </div>
  );
}
