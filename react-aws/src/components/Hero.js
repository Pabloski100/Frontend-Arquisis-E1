import React from 'react';
import Logojpeg from '../utils/logo.jpeg';
import styles from './componentsCss/hero.module.css';

const Hero = () => (
  <div className={styles.container}>
    <div className={styles.row}>
      <div className={styles['col-12']} className={styles['col-md-6']} className={styles['offset-md-3']} className={styles['text-center']}> {/* Use styles object to replace class names */}
        <img src={Logojpeg} alt="EquityEmpire Logo" className={styles['img-fluid']} style={{ width: '150px' }} />
      </div>
    </div>
    <div className={styles.hero} className={styles['my-5']} className={styles['text-center']} data-testid="hero" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className={styles['mb-4']} data-testid="hero-title">
        EquityEmpire: Your Gateway to the Stock Market
      </h1>
      <p className={styles.lead} data-testid="hero-lead">
        Welcome to EquityEmpire, the premier platform for exploring, seeing, and buying stocks with ease and confidence.
        Our user-friendly interface and real-time market data ensure you have all the tools at your fingertips to make
        informed decisions. Start your journey to financial empowerment today with us!
      </p>
    </div>
  </div>
);

export default Hero;
