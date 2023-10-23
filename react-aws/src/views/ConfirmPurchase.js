import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './viewsCss/confirmPurchase.module.css';

const ConfirmPurchase = () => {
  const locationRouter = useLocation();
  const { token, url, userId, stockId, stockPrice, stockSymbol, stockShortName, location} = locationRouter.state;

  if (!token || !url) {
    return <p>Invalid payment data.</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Are you sure you want to buy this stock?</h1>
      <h2 className={styles.subHeader}>Stock Details</h2>
      <p className={styles.details}><strong>Stock Name:</strong> {stockShortName}</p>
      <p className={styles.details}><strong>Stock Symbol:</strong> {stockSymbol}</p>
      <p className={styles.details}><strong>Stock Price:</strong> {stockPrice}</p>
      <form className={styles.form} action={url} method="POST">
        <input type="hidden" value={token} name="token_ws" />
        <button className={styles.confirmButton} type="submit">
          Confirm Purchase
        </button>
      </form>
    </div>
  );
};

export default ConfirmPurchase;
