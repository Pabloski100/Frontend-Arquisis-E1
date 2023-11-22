import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './viewsCss/confirmPurchase.module.css';

const ConfirmPurchaseFraction = () => {
  const locationRouter = useLocation();
  const { token, url, userId, stockId, stockPrice, stockSymbol, stockShortName, location, fraction} = locationRouter.state;

  if (!token || !url) {
    return <p>Invalid payment data.</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Are you sure you want to buy this fraction for this stock?</h1>
      <h2 className={styles.subHeader}>Stock Details</h2>
      <p className={styles.details}><strong>Stock Name:</strong> {stockShortName}</p>
      <p className={styles.details}><strong>Stock Symbol:</strong> {stockSymbol}</p>
      <p className={styles.details}><strong>Fraction Price:</strong> {stockPrice * fraction}</p>
      <form className={styles.form} action={url} method="POST">
        <input type="hidden" value={token} name="token_ws" />
        <button className={styles.confirmButton} type="submit">
          Confirm Purchase of {fraction} fraction
        </button>
      </form>
    </div>
  );
};

export default ConfirmPurchaseFraction;
