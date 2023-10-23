
import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './viewsCss/purchaseCompleted.module.css';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import emailjs from '@emailjs/browser'

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});

const PurchaseCompleted = () => {
  const location = useLocation();
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isPostSent, setIsPostSent] = useState(false);

  const cognitoUser = userPool.getCurrentUser();

  useEffect(() => {
    if (cognitoUser !== null && !user) {
    cognitoUser.getSession((err, session) => {
        if (err) {
          alert(err.message || JSON.stringify(err));
          return;
        }
        const newToken = session.getIdToken().getJwtToken();
        setToken(newToken);
        const newUserDetails = session.getIdToken().payload;
        setUser(newUserDetails);

        axios.get(`https://api.asyncfintech.me/getUser?auth0Id=${newUserDetails.sub}`, {
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      })
      .then(response => {
        if (response.data.success) {
          setUserData(response.data.data.stocks)
        } else {
          console.error(response.data.message);
        }
      }).catch(error => {
        console.error("API call failed:", error);
      });
      }
    );
  }
  }
  , [user]);

  useEffect(() => {
    console.log('useEffect is running. Location:', location, 'User:', user, 'UserData:', userData, 'isPostSent:', isPostSent);
    if (!isPostSent && user) {
      const token_ws = new URLSearchParams(location.search).get('token_ws');

      if (token_ws) {
        axios.post('https://nicostocks.me/confirm-purchase', { token_ws: token_ws })
          .then((response) => {
          if (response.data.success) {
            setTransactionDetails(response.data.details);
            const emailParams = {
              from_name: "AsyncFintech",
              to_name: user.name,
              stock_name: userData[userData.length-1].stockSymbol,
              stock_price: userData[userData.length-1].stockPrice,
              user_email: 'nicolas10040@hotmail.com',
              buy_date: String(new Date()),
              }
            emailjs.send("service_t2n2ilp","template_b42hdfs", emailParams, 'nHk13LYZyg4X4xrvX');
            setIsPostSent(true);
          } else {
            setError('Your purchase was not successful. Please try again.');
          }
        })
        .catch((err) => {
          setError(`An error occurred: ${err.message}`);
        });
    }
    else {
      setError('User cancelled purchase...');
    }
  }
  }, [location, user, userData, isPostSent]);

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Purchase Completed!</h1>
      {transactionDetails ? (
        <div>
          <h2 className={styles.subHeader}>Transaction Details</h2>
          <p className={styles.details}><strong>VCI:</strong> {transactionDetails.vci}</p>
          <p className={styles.details}><strong>Amount:</strong> {transactionDetails.amount}</p>
          <p className={styles.details}><strong>Status:</strong> {transactionDetails.status}</p>
          <p className={styles.details}><strong>Buy Order:</strong> {transactionDetails.buy_order}</p>
          <p className={styles.details}><strong>Authorization Code:</strong> {transactionDetails.authorization_code}</p>
        </div>
      ) : error ? (
        <div>
          <h2 className={styles.subHeader}>Error</h2>
          <p className={styles.error}>{error}</p>
        </div>
      ) : (
        <p className={styles.loading}>Loading...</p>
      )}
    </div>
  );
};

export default PurchaseCompleted;
