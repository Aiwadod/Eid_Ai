import React, { useState } from 'react';
import NameInput from '../components/NameInput';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [isClubMember, setIsClubMember] = useState<boolean | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setStep(2);
  };

  const handleClubSelection = async (isMember: boolean) => {
    setIsClubMember(isMember);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName, isClubMember: isMember }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate card';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setGeneratedImageUrl(imageUrl);
      setStep(3);

    } catch (err: any) {
      console.error('Error fetching generated card:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <img src="/bg/bg.png" alt="Background" className={styles.bgImage} />
        <img src="/bg/logo.png" alt="Logo" className={styles.logo} />
      </div>

      {step === 1 && <NameInput onNameSubmit={handleNameSubmit} />}

      {step === 2 && (
        <div className={styles.clubSelection}>
          <h2>هل أنت من مستفيدي نادي الذكاء الاصطناعي؟</h2>
          <div className={styles.buttons}>
            <button onClick={() => handleClubSelection(true)} disabled={isLoading}>نعم</button>
            <button onClick={() => handleClubSelection(false)} disabled={isLoading}>لا</button>
          </div>
          {isLoading && <p className={styles.loading}>جاري إنشاء البطاقة...</p>}
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      {step === 3 && (
        <div className={styles.result}>
          {generatedImageUrl ? (
            <img src={generatedImageUrl} alt="Generated Card" className={styles.generatedCard} />
          ) : (
            <p>Loading or Error displaying image.</p>
          )}
        </div>
      )}
    </div>
  );
} 