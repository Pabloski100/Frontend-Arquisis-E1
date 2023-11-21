import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import styles from './viewsCss/groupstocks.module.css';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage'
import axios from 'axios';
import { useSelector } from 'react-redux';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useNavigate } from "react-router-dom";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});

function Group_stocks()  {
  const [data, setData] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMoreStocks, setHasMoreStocks] = useState(true);
  const [hasMoreDetails, setHasMoreDetails] = useState(true);
  const [token, setToken] = useState(null);
  const [transbankToken, setTransbankToken] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApiCalled, setIsApiCalled] = useState(false);
  const [fraction, setFraction] = useState(1);

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

    if (token) {
      const fetchStocks = async () => {
        try {
          const response = await axios.get(`https://api.asyncfintech.me/getUser?auth0Id=${'75fa76c7-a551-4cb9-9f03-3c4472067f2d'}`, {
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

  return (
    <div className={styles.container}>
      {stocks.map(stock => (
        <div key={stock.stockId} className={styles.stockItem}>
          <h3 className={styles.stockTitle}>{stock.stockShortName} ({stock.stockSymbol})</h3>
          <div className={styles.stockDetails}>
            <p>Price: <span className={styles.stockPrice}>${stock.stockPrice}</span></p>
            <p>Date: <span className={styles.stockDate}>{new Date(stock.date).toLocaleDateString()}</span></p>
          </div>
          {!isAdmin && (
            <div className={styles.buyStockSection}>
              <input 
                type="number" 
                min="0.1" 
                max="1" 
                step="0.1" 
                defaultValue="1" 
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
        </div>
      ))}
    </div>
  );  

}

export default Group_stocks;
