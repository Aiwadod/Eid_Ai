import React from 'react';
import styles from './HeaderLogo.module.css';

const HeaderLogo: React.FC = () => (
  <div className={styles.headerLogo}>
    <img src="/bg/logo.png" alt="Logo" className={styles.logo} />
  </div>
);

export default HeaderLogo;