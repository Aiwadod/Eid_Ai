import React, { useState, useRef, useEffect } from 'react';
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
  const [showLogo, setShowLogo] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (step !== 3) {
      setShowLogo(true);
      return;
    }
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setShowLogo(false); // reversed: hide logo when scrolling down
      } else {
        // Scrolling up
        setShowLogo(true); // reversed: show logo when scrolling up
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [step]);

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setStep(2);
  };

  const handleSuggestion = (type: 'ai' | 'other') => {
    setSuggestion(type);
    // Remove setStep(3) from here
  };

  const handleImageSelect = (img: string) => {
    setSelectedImage(img);
    // setStep(4); // REMOVE THIS LINE
  };

  const handleOtherImageSelect = (img: string) => {
    setSelectedImage(img);
    // Remove setStep(4); so it matches handleImageSelect
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

    // Draw the text (centered, smaller font)
    const fontSize = Math.floor(canvas.height / 25); // smaller font size
    ctx.font = `${fontSize}px Tahoma, Arial, sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 8;
    // Example: Move text to 1/6th from the top
    ctx.fillText(userName, canvas.width / 2, canvas.height / 3);

    // Download the canvas as an image
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'eid-card.png';
    link.click();

    // After download, show the "Download Complete" step
    setStep(5);
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <img src="/bg/bg.png" alt="Background" className={styles.bgImage} />
        {(step === 1 || step === 2 || (step === 3 && showLogo)) && (
          <img src="/bg/logo.png" alt="Logo" className={styles.logo} />
        )}
      </div>

      {step === 1 && <NameInput onNameSubmit={handleNameSubmit} />}

      {/* Step 2: Show two suggestions */}
      {step === 2 && (
        <div className={styles.suggestionBox}>
          <h2>هل انت من مستفيدين / اعضاء</h2>
          <div className={styles.suggestionButtons}>
            <button
              className={suggestion === 'ai' ? styles.selected : ''}
              onClick={() => handleSuggestion('ai')}
              type="button"
            >
              نادي الذكاء الاصطناعي
            </button>
            <button
              className={suggestion === 'other' ? styles.selected : ''}
              onClick={() => handleSuggestion('other')}
              type="button"
            >
              غير ذالك
            </button>
          </div>
          <div className={styles.step2Nav}>
            <button
              onClick={() => setStep(1)}
              className={styles.button}
              type="button"
            >
              السابق
            </button>
            <button
              onClick={() => {
                if (suggestion) setStep(3);
              }}
              className={styles.button}
              type="button"
              disabled={!suggestion}
              style={{
                opacity: suggestion ? 1 : 0.5,
                cursor: suggestion ? 'pointer' : 'not-allowed'
              }}
            >
              التالي
            </button>
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
          <div className={styles.step3Nav}>
            <button
              className={`${styles.button} ${styles.step3Prev}`}
              type="button"
              onClick={() => setStep(2)}
            >
              السابق
            </button>
            <button
              className={`${styles.button} ${styles.step3Next}`}
              type="button"
              onClick={() => setStep(4)}
              disabled={!selectedImage}
              style={{
                opacity: selectedImage ? 1 : 0.5,
                cursor: selectedImage ? 'pointer' : 'not-allowed'
              }}
            >
              التالي
            </button>
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
          <div className={styles.step3Nav}>
            <button
              className={`${styles.button} ${styles.step3Prev}`}
              type="button"
              onClick={() => setStep(2)}
            >
              السابق
            </button>
            <button
              className={`${styles.button} ${styles.step3Next}`}
              type="button"
              onClick={() => setStep(4)}
              disabled={!selectedImage}
              style={{
                opacity: selectedImage ? 1 : 0.5,
                cursor: selectedImage ? 'pointer' : 'not-allowed'
              }}
            >
              التالي
            </button>
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

      {/* Step 5: Download complete */}
      {step === 5 && (
        <div className={styles.downloadComplete}>
          <img src="/bg/logo.png" alt="Logo" className={styles.logo} />
          <h2>🤍 كل عام وانت/ي الخير </h2>
          <p>شكرًا جزيلًا لدعمكم لنا<br />🤖 مع تحيات: فريق نادي الذكاء الاصطناعي </p>
          <button className={styles.button} onClick={() => setStep(1)}>
            إنشاء بطاقة جديدة
          </button>
        </div>
      )}
    </div>
  );
}