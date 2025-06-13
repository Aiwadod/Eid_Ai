import React, { useState } from 'react';
import styles from './NameInput.module.css';

interface NameInputProps {
  onNameSubmit: (name: string) => void;
}

const NameInput: React.FC<NameInputProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  const validateName = (value: string) => {
    const hasContent = value.trim().length > 0;
    
    if (!hasContent) {
      setError('الرجاء إدخال الاسم / Please enter your name');
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
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>أدخل اسمك الكامل</h2>
        <p className={styles.subtitle}>Enter your full name</p>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={name}
            onChange={handleChange}
            className={`${styles.input} ${isValid ? styles.valid : ''} ${error ? styles.invalid : ''}`}
            placeholder="الاسم الكامل / Full Name"
            dir="auto"
          />
          {isValid && <span className={styles.checkmark}>✓</span>}
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button 
          type="submit" 
          className={`${styles.button} ${!isValid ? styles.buttonDisabled : ''}`}
          disabled={!isValid}
        >
          متابعة / Continue
        </button>
      </form>
    </div>
  );
};

export default NameInput; 