import React, { useState, useEffect } from 'react';
import styles from './viewsCss/stocks.module.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
import UserPhoto from '../utils/UserPhoto.png';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser'

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});

const Stocks = () => {
  const [data, setData] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null);
  const [stockDetails, setStockDetails] = useState([]);
  const [detailsPage, setDetailsPage] = useState(1);
  const [viewHistory, setViewHistory] = useState(false);
  const [hasMoreStocks, setHasMoreStocks] = useState(true);
  const [hasMoreDetails, setHasMoreDetails] = useState(true);
  const [token, setToken] = useState(null);
  const [transbankToken, setTransbankToken] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const cognitoUser = userPool.getCurrentUser();

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

  const handleBuyStock = async (stock_id, stock_price, stock_symbol, stock_shortName) => {
    try {
      const ipResponse = await axios.get('https://ipinfo.io/json?token=f27743517e5212');
      const location = ipResponse.data.country + ' - ' + ipResponse.data.region + ' - ' + ipResponse.data.city;

      const response = await axios.post('https://nicostocks.me/buyIntention', {
        userId: user.sub,
        stockId: stock_id,
        stockPrice: Math.round(stock_price),
        stockSymbol: stock_symbol,
        stockShortName: stock_shortName,
        location: location
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
        navigate('/confirm-purchase', { state: { token: result.token, url: result.url, userId: user.sub, stockId: stock_id, stockPrice: stock_price, stockSymbol: stock_symbol, stockShortName: stock_shortName, location: location } });
  
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
    const fetchStocks = async () => {
      try {
        const response = await axios.get(
          'https://api.asyncfintech.me/stocks',
          {params: {
            size: 1
          },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        setHasMoreStocks(data.length > 0);
        setStocks(data);
        setIsLoading(false);
      } catch (error) {
        console.log("Function error")
        setError(error);
        setIsLoading(false);
      }
    };
  
    if (token) {
      fetchStocks();
    }
  }, [page, token]);  

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        const response = await axios.get(`https://api.asyncfintech.me/stocks/${selectedStockSymbol}`, {
          params: {
            page: detailsPage,
            size: 1
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data;
        setHasMoreDetails(data.length > 0);
        setStockDetails(data);
      } catch (error) {
        setError(error);
      }
    };

    if (selectedStockSymbol) {
      fetchStockDetails();
    }
  }, [selectedStockSymbol, detailsPage]);

  const handleNext = async () => {
      try {
        const response = await axios.get(`https://api.asyncfintech.me/stocks`, {
          params: {
            page: detailsPage + 1,
            size: 1
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data;
        if (data.length > 0) {
          setPage(prevPage => prevPage + 1);
        } else {
          setHasMoreStocks(false);
        }
      } catch (error) {
        setError(error);
      }
    };

const closePopup = () => {
    setShowPopup(false);
  };

const handleBack = () => {
    setPage(prevPage => Math.max(prevPage - 1, 1));
    setHasMoreStocks(true);
  };

const handleDetailsNext = async () => {
    try {
      const response = await axios.get(`https://api.asyncfintech.me/stocks/${selectedStockSymbol}`, {
        params: {
          page: detailsPage + 1,
          size: 1
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = response.data;
      if (data.length > 0) {
        setDetailsPage(prev => prev + 1);
      } else {
        setHasMoreDetails(false);
      }
    } catch (error) {
      setError(error);
    }
  };

  const selectStock = symbol => {
    setSelectedStockSymbol(symbol);
    setDetailsPage(1);
  };

  const viewStockHistory = symbol => {
    setSelectedStockSymbol(symbol);
    setDetailsPage(1);
    setViewHistory(true);
  };

  const backToList = () => {
    setViewHistory(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Stocks</h1>
      {error && <p>Error: {error.message}</p>}

      {!viewHistory ? (
        <>
          {!isLoading && (
            <div className={styles.navigation}>
              <button onClick={handleBack} disabled={page === 1}>
                Back
              </button>
              <button onClick={handleNext} disabled={!hasMoreStocks}>
                Next
              </button>
            </div>
          )}
          {!isLoading && stocks ? (
            stocks.map((stockSet, index) => (
              <div key={index} className={styles.stockSet}>
                <h2>Stock Set {page}</h2>
                {stockSet.stocks.map(stock => (
                  <div key={stock.id} className={styles.stockItem}>
                    <p>Symbol: {stock.symbol}</p>
                    <p>Short Name: {stock.shortName}</p>
                    <p>Price: {stock.price}</p>
                    <p>Currency: {stock.currency}</p>
                    <p>Source: {stock.source}</p>
                    <button className={styles.stockItemButton} onClick={() => viewStockHistory(stock.symbol)}>
                      View History
                    </button>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p>Loading...</p>
          )}
          {!isLoading && (
            <div className={styles.navigation}>
              <button onClick={handleBack} disabled={page === 1}>
                Back
              </button>
              <button onClick={handleNext} disabled={!hasMoreStocks}>
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div>
          <button className={styles.backToListButton} onClick={backToList}>
            Back to List
          </button>
          <h2>
            Historical Details for {selectedStockSymbol} - Stock {detailsPage}
          </h2>
          {stockDetails.map((detail, index) => (
            <div key={index}>
              <p>Date: {new Date(detail.datetime).toLocaleDateString()}</p>
              <p>Short Name: {detail.shortName}</p>
              <p>Price: {detail.price}</p>
              <p>Currency: {detail.currency}</p>
              <p>Source: {detail.source}</p>
              <p>Id: {detail.stock_id}</p>
              <p>Is purchased?: {new String(detail.isBought).toUpperCase()}</p>
              {!detail.isBought && (
                <button
                  className={styles.buyStockButton}
                  onClick={() => handleBuyStock(detail.stock_id, detail.price, detail.symbol, detail.shortName)}
                >
                  Buy Stock
                </button>
              )}
              {detail.isBought && (
                <button
                  className={styles.buyStockButton}
                  onClick={() => handleBuyStock(detail.stock_id, detail.price, detail.symbol, detail.shortName)}
                  disabled
                >
                  Already Purchased
                </button>
              )}
            </div>
          ))}
          <div className={styles.navigation}>
            <button onClick={() => setDetailsPage(prev => Math.max(prev - 1, 1))} disabled={detailsPage === 1}>
              Back
            </button>
            <button onClick={handleDetailsNext} disabled={!hasMoreDetails}>
              Next
            </button>
          </div>
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
  );
};

export default Stocks;