import React, { useState } from 'react';
import styles from './NameInput.module.css';
import HeaderLogo from './HeaderLogo';

interface NameInputProps {
  onNameSubmit: (name: string) => void;
}

const NameInput: React.FC<NameInputProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  const validateName = (value: string) => {
    const hasContent = value.trim().length > 0;
    const isArabic = /^[\u0600-\u06FF\s]+$/.test(value.trim());
    if (!hasContent) {
      setError('الرجاء إدخال الاسم');
      setIsValid(false);
    } else if (!isArabic) {
      setError('يرجى كتابة الاسم باللغة العربية فقط');
      setIsValid(false);
    } else {
      setError('');
      setIsValid(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateName(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className={styles.container}>
      <HeaderLogo />
      <div className={styles.card}>
        <h2 className={styles.title}>أدخل الاسم الثنائي</h2>
        <p className={styles.subtitle}>Enter your full name</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={name}
              onChange={handleChange}
              className={`${styles.input} ${isValid ? styles.valid : ''} ${error ? styles.invalid : ''}`}
              placeholder=" اسمك يهمنا! / Full Name "
              dir="auto"
              autoFocus
            />
            {isValid && <span className={styles.checkmark}>✓</span>}
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button 
            type="submit" 
            className={`${styles.button} ${!isValid ? styles.buttonDisabled : ''}`}
            disabled={!isValid}
          >
             التالي/ Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameInput;