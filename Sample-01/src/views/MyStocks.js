import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import styles from './viewsCss/myStocks.module.css';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage'
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

Chart.register(...registerables);

function My_stocks() {
  const { user, isLoading } = useAuth0();
  const [data, setData] = useState(null);
  const [token, setToken] = useState(null);
  const [historicalData, setHistoricalData] = useState({});
  const [stocks, setStocks] = useState(null);

  useEffect(() => {
    if (user) {
      axios.get(`https://asyncfintech.me/getUser?auth0Id=${user.sub}`)
        .then(response => {
          if (response.data.success) {
            setStocks(response.data.data.stocks);
          } else {
            console.error(response.data.message);
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [user]);

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
      const response = await axios.get(`https://asyncfintech.me/stocks/${symbol}?page=${page}&size=${size}`);
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
      {isLoading && <Loading />}
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

export default withAuthenticationRequired(My_stocks, {
  onRedirecting: () => <Loading />,
  onError: error => <ErrorMessage>{error.message}</ErrorMessage>
});