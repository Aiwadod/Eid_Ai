import React, { useState, useRef } from 'react';
import NameInput from '../components/NameInput';
import styles from '../styles/Home.module.css';

const aiImages = [
  'البلد_page-0001.jpg',
  'البلد-مع-اضحيات_page-0001.jpg',
  'النافورة_page-0001.jpg',
  'دوار-الكرة-الارضية_page-0001 (1).jpg',
  'دوار-الكره-الارضية-مع-اضحيات_page-0001.jpg',
  'ميدان-الفوانيس_page-0001.jpg',
];

const otherImages = [
  '../others/البلد_page-0001 (1).jpg',
  '../others/البلد-٢_page-0001.jpg',
  '../others/الدوار_page-0001.jpg',
  '../others/الدوار-٢_page-0001.jpg',
  '../others/الفوانيس_pages-to-jpg-0001.jpg',
  '../others/النافورة_page-0001 (1).jpg',
  // Add all your "other" image filenames here
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<'ai' | 'other' | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setStep(2);
  };

  const handleSuggestion = (type: 'ai' | 'other') => {
    setSuggestion(type);
    setStep(3);
  };

  const handleImageSelect = (img: string) => {
    setSelectedImage(img);
    setStep(4);
  };

  const handleOtherImageSelect = (img: string) => {
    setSelectedImage(img);
    setStep(4);
  };

  // Download handler
  const handleDownload = () => {
    const img = imgRef.current;
    if (!img) return;

    // Create a canvas with the same size as the image
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw the text (customize position, font, color as needed)
    ctx.font = `${Math.floor(canvas.height / 12)}px Tahoma, Arial, sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 8;
    ctx.fillText(userName, canvas.width / 2, canvas.height - 40);

    // Download the canvas as an image
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'eid-card.png';
    link.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <img src="/bg/bg.png" alt="Background" className={styles.bgImage} />
        {(step === 1 || step === 2 || step === 3) && (
          <img src="/bg/logo.png" alt="Logo" className={styles.logo} />
        )}
      </div>

      {step === 1 && <NameInput onNameSubmit={handleNameSubmit} />}

      {/* Step 2: Show two suggestions */}
      
      {step === 2 && (
        <div className={styles.suggestionBox}>
          <h2>اختر نوع البطاقة</h2>
          <div className={styles.suggestionButtons}>
            <button onClick={() => handleSuggestion('ai')}>بطاقة من الذكاء الاصطناعي</button>
            <button onClick={() => handleSuggestion('other')}>بطاقة أخرى</button>
          </div>
        </div>
      )}

      {/* Step 3: If AI was picked, show AI images */}
      
      {step === 3 && suggestion === 'ai' && (
        <div className={styles.aiGallery}>
          <h2>اختر صورة من الذكاء الاصطناعي</h2>
          <div className={styles.imageGrid}>
            {aiImages.map(img => (
              <img
                key={img}
                src={`/ai/${img}`}
                alt={img}
                className={styles.aiImage}
                onClick={() => handleImageSelect(img)}
                style={{
                  cursor: 'pointer',
                  width: 250,
                  margin: 8,
                  borderRadius: 8,
                  border: '2px solid #eee'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: If Other was picked, show OTHER images */}
      {step === 3 && suggestion === 'other' && (
        <div className={styles.aiGallery}>
          <h2>اختر صورة أخرى</h2>
          <div className={styles.imageGrid}>
            {otherImages.map(img => (
              <img
                key={img}
                src={`/other/${img}`}
                alt={img}
                className={styles.aiImage}
                onClick={() => handleOtherImageSelect(img)}
                style={{
                  cursor: 'pointer',
                  width: 250,
                  margin: 8,
                  borderRadius: 8,
                  border: '2px solid #eee'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Show selected image */}
      {step === 4 && selectedImage && (
        <div className={styles.result}>
          <img
            ref={imgRef}
            src={suggestion === 'ai' ? `/ai/${selectedImage}` : `/other/${selectedImage}`}
            alt="Selected"
            className={styles.generatedCard}
          />
          <p className={styles.userName}>{userName}</p>
          <button className={styles.downloadButton} onClick={handleDownload}>
            تحميل الصورة مع الاسم
          </button>
        </div>
      )}
    </div>
  );
}