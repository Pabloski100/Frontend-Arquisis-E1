import React, { useState, useEffect, useRef } from 'react';
import styles from './viewsCss/groupstocks.module.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});

function Group_stocks()  {
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [transbankToken, setTransbankToken] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fraction, setFraction] = useState(1);
  const hasFetchedStocks = useRef(false);

  const cognitoUser = userPool.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (cognitoUser !== null) {
      cognitoUser.getSession((err, session) => {
          if (err) {
            alert(err.message || JSON.stringify(err));
            return;
          }
          const newToken = session.getIdToken().getJwtToken();
          setToken(newToken);
          const newUserDetails = session.getIdToken().payload;
          setUser(newUserDetails);
          console.log(newUserDetails);
          
          if (newUserDetails['cognito:groups'] && newUserDetails['cognito:groups'].includes('Admin')) {
            setIsAdmin(true);
          }

          axios.get(`https://api.asyncfintech.me/getUser?auth0Id=${newUserDetails.sub}`, {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        })
        .then(response => {
          if (response.data.success) {
            setUserData(response.data.data);
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
    , []);

  const handleBuyFractions = async (stock_id, stock_price, stock_symbol, stock_shortName, fraction) => {
    try {
      // const ipResponse = await axios.get('https://ipinfo.io/json?token=f27743517e5212');
      // const location = ipResponse.data.country + ' - ' + ipResponse.data.region + ' - ' + ipResponse.data.city;
      const location = "Chile - Region Metropolitana - Santiago"; // Para test
  
      const response = await axios.post('https://nicostocks.me/buyIntentionFraction', {
        userId: user.sub,
        stockId: stock_id,
        stockPrice: Math.round(stock_price * fraction),
        stockSymbol: stock_symbol,
        stockShortName: stock_shortName,
        location: location,
        fraction: fraction
      }, {
        timeout: 300000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const result = response.data;
      console.log(result)
      if (result.success) {
        setTransbankToken(result.token);
        navigate('/confirm-purchase-fraction', { state: { token: result.token, url: result.url, userId: user.sub, stockId: stock_id, stockPrice: stock_price, stockSymbol: stock_symbol, stockShortName: stock_shortName, location: location, fraction: fraction } });
    
      } else {
        console.log("Success error");
        setPopupMessage(result.message);
        setShowPopup(true);
      }
    } catch (error) {
      console.log("Buy error");
      console.log(error);
      setPopupMessage(error.message);
      setShowPopup(true);
    }
  };

  useEffect(() => {
    if (hasFetchedStocks.current || !token) {
      return;
    }
    hasFetchedStocks.current = true;
    
    if (token) {
      const fetchStocks = async () => {
        try {
          const response = await axios.get(`https://api.asyncfintech.me/getUser?auth0Id=${'d6cec5cf-8f89-49b4-b8d9-31699db0a052'}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
    
          console.log(response.data.data);
          if (response.data.success) {
            setStocks(response.data.data.stocks);
            console.log(response.data.data.stocks);
          } else {
            console.error(response.data.message);
          }
        } catch (error) {
          console.error("API call failed:", error);
        }
      };
    
      fetchStocks();
    }
  }
  , [token]);

  const handleOfferStock = async (stock_id, stock_price, stock_symbol, stock_shortName, fraction) => {

    try {

      if (isAdmin) {
       const response = await axios.post('http://localhost:3002/offerStock', {
        auction_id: uuid(),
        proposal_id: "",
        stock_id: stock_symbol,
        quantity: fraction,
        group_id: 28,
        type: "offer"
      }, {
        timeout: 300000,
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      const result = response.data;
      console.log(result)
      if (result.success) {
        setPopupMessage("Stock offered successfully");
        setShowPopup(true);
      } else {
        console.log("Success error");
        setPopupMessage(result.message);
        setShowPopup(true);
      }
    }
    }
    catch (error) {
      console.log("Offer error");
      console.log(error);
      setPopupMessage(error.message);
      setShowPopup(true);
    }
  }

  const closePopup = () => {
    setShowPopup(false);
  };

  return (

    stocks ?

    <div className={styles.container}>
      <h2>Our Group Stocks</h2>
      {stocks.map(stock => (
        <div key={stock.stockId} className={styles.stockItem}>
          <h3 className={styles.stockTitle}>{stock.stockShortName} ({stock.stockSymbol})</h3>
          <div className={styles.stockDetails}>
            <p>Price: <span>${stock.stockPrice}</span></p>
            <p>Date: <span>{new Date(stock.date).toLocaleDateString()}</span></p>
            <p>Fraction: <span>{stock.fractions}</span></p>
          </div>
          {!isAdmin && (
            <div className={styles.buyStockSection}>
              <input 
                type="number" 
                min="0.1" 
                max={stock.fractions} 
                step="0.1"
                className={styles.fractionInput} 
                onChange={(e) => setFraction(parseFloat(e.target.value))}
                aria-label="Fraction to buy"
              />
              <button 
                className={styles.buyStockButton} 
                onClick={() => handleBuyFractions(stock.stockId, stock.stockPrice, stock.stockSymbol, stock.stockShortName, fraction)}
              >
                Buy Fractions
              </button>
            </div>
          )}
          {isAdmin && (
            <div className={styles.buyStockSection}>
              <input 
                type="number" 
                min="1" 
                step="1" 
                defaultValue="1" 
                className={styles.fractionInput} 
                onChange={(e) => setFraction(parseFloat(e.target.value))}
                aria-label="Fraction to buy"
              />
              <button 
                className={styles.buyStockButton} 
                onClick={() => handleOfferStock(stock.stockId, stock.stockPrice, stock.stockSymbol, stock.stockShortName, fraction)}
              >
                Offer Stock
              </button>
            </div>
          )}
          {showPopup && (
        <div className={styles.popup}>
          <div className={styles.popupHeader}>
            <h2>Status</h2>
            <span className={styles.popupClose} onClick={closePopup}>
              &times;
            </span>
          </div>
          <div className={styles.popupContent}>
            <p>{popupMessage}</p>
          </div>
        </div>
      )}
        </div>
      ))}
    </div>
    :
    <div className={styles.container}>
      <h1 className={styles.header}>Your Group doesn't have any stocks yet.</h1>
    </div>
  );

}

export default Group_stocks;
