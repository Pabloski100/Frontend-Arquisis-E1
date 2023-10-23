import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import styles from './viewsCss/myStocks.module.css';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage'
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useNavigate } from "react-router-dom";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});

Chart.register(...registerables);

function My_stocks() {
  const [data, setData] = useState(null);
  const [token, setToken] = useState(null);
  const [historicalData, setHistoricalData] = useState({});
  const [stocks, setStocks] = useState(null);
  const [user, setUser] = useState(null);
  const [isApiCalled, setIsApiCalled] = useState(false);

  const cognitoUser = userPool.getCurrentUser();
  
  useEffect(() => {
    if (!isApiCalled) {
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
              setIsApiCalled(true);
              setStocks(response.data.data.stocks);
              console.log(response.data.data.stocks);
            } else {
              console.error(response.data.message);
            }
          }).catch(error => {
            console.error("API call failed:", error);
          });
        });
      }
    }
  }, [setIsApiCalled, isApiCalled]);

  useEffect(() => {
    if (stocks) {
      const fetchAllHistories = async () => {
        const uniqueSymbols = [...new Set(stocks.map(stock => stock.stockSymbol))];
        const allPromises = uniqueSymbols.map(symbol => fetchAllStockHistory(symbol));
        const allData = await Promise.all(allPromises);
        const newHistoricalData = {};
        uniqueSymbols.forEach((symbol, index) => {
          newHistoricalData[symbol] = allData[index];
        });
        setHistoricalData(newHistoricalData);
      };
      fetchAllHistories();
    }
  }, [stocks]);  

  const fetchAllStockHistory = async (symbol, page = 1, size = 25, allData = []) => {
    try {
      const response = await axios.get(`https://api.asyncfintech.me/stocks/${symbol}?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
        
      if (response.data.length === 0) {
        return allData;
      }
      allData.push(...response.data);
      return fetchAllStockHistory(symbol, page + 1, size, allData);
    } catch (error) {
      console.error(error);
      return allData;
    }
  };

  const formatDate = dateString => {
    const dateObj = new Date(dateString);
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = dateObj.toLocaleTimeString();
    return `${formattedDate} ${formattedTime}`;
  };

  const renderStocks = () => {
    if (!stocks) {
      return <p className={styles.text}>No stocks available.</p>;
    }
  
    const stockGroups = {};
  
    stocks.forEach(stock => {
      if (!stockGroups[stock.stockSymbol]) {
        stockGroups[stock.stockSymbol] = [];
      }
      stockGroups[stock.stockSymbol].push(stock);
    });
  
    return (
      <ul className={styles.stockList}>
        {Object.keys(stockGroups).map((symbol, index) => (
          <div className={styles.stockItem} key={index}>
            <h1 className={styles.header}>Stocks of {symbol} that you own</h1>
            {stockGroups[symbol].map((stock, subIndex) => (
              <div key={subIndex}>
                <h2 className={styles.header}>Stock {subIndex + 1}</h2>
                <p className={styles.text}>Company: {stock.stockShortName}</p>
                <p className={styles.text}>Symbol: {stock.stockSymbol}</p>
                <p className={styles.text}>Price: {stock.stockPrice}</p>
                <p className={styles.text}>Date: {formatDate(stock.date)}</p>
                <p className={styles.text}>Location: {stock.location}</p>
              </div>
            ))}
            <h2 className={styles.header}>Chart</h2>
            {renderChart(symbol)}
          </div>
        ))}
      </ul>
    );
  };  

  const renderChart = symbol => {
    const stockData = historicalData[symbol];
    if (!stockData) return null;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const filteredData = stockData.filter(point => {
      const pointDate = new Date(point.datetime);
      return pointDate >= oneWeekAgo;
    });

    const resampledData = [];
    let lastDateTime = null;

    filteredData.forEach(point => {
      const pointDate = new Date(point.datetime);
      if (!lastDateTime || pointDate - lastDateTime >= 3600000) {
        resampledData.push(point);
        lastDateTime = pointDate;
      }
    });

    const labels = resampledData.map(point => new Date(point.datetime).toLocaleTimeString());
    const dataPoints = resampledData.map(point => point.price);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: `${symbol} Price`,
          data: dataPoints,
          fill: false,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)'
        }
      ]
    };

    return <Line data={chartData} />;
  };

  return (
    <>
      {user ? (
        <div className={styles.stocksContainer}>
          <Row>
            <Col md={12}>
              <h1 className={styles.header}>Your Stocks</h1>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <ul className={styles.stockList}>{renderStocks()}</ul>
            </Col>
          </Row>
        </div>
      ) : (
        <ErrorMessage>Failed to load user data. Please try again later.</ErrorMessage>
      )}
    </>
  );
}

export default My_stocks;