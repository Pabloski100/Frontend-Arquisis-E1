import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import styles from './viewsCss/myStocks.css';
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

  useEffect(() => {
    if (user) {
      axios
        .post('http://localhost:3001/api/getToken')
        .then(function (response) {
          const token = response.data.access_token;
          setToken(token);
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  }, [user]);

  useEffect(() => {
    if (user && token) {
      var options = {
        method: 'GET',
        url: 'https://dev-c6qwwrh4suoknli2.us.auth0.com/api/v2/users',
        params: { q: user.email, search_engine: 'v3' },
        headers: {
          Authorization: 'Bearer ' + token
        }
      };

      axios
        .request(options)
        .then(function (response) {
          const data = response.data;
          console.log(data);
          setData(data);
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  }, [user, token]);

  useEffect(() => {
    if (data && data[0].user_metadata.stocks) {
      const stocks = data[0].user_metadata.stocks;
      const promises = stocks.map(stock => fetchAllStockHistory(stock.stockSymbol));

      Promise.all(promises)
        .then(responses => {
          const newHistoricalData = {};
          responses.forEach((response, index) => {
            newHistoricalData[stocks[index].stockSymbol] = response;
          });
          setHistoricalData(newHistoricalData);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [data]);

  const fetchAllStockHistory = async (symbol, page = 1, size = 25, allData = []) => {
    try {
      const response = await axios.get(`https://bc58dyc2of.execute-api.us-east-1.amazonaws.com/Dev/stocks/${symbol}?page=${page}&size=${size}`);
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
    if (!data || !data[0].user_metadata.stocks) {
      return <p className={styles.text}>No stocks available.</p>;
    }

    const stocks = data[0].user_metadata.stocks;
    console.log(stocks);
    return (
      <ul className={styles.stockList}>
        {stocks.map((stock, index) => (
          <div className={styles.stockItem} key={index}>
            <p className={styles.text}>Company: {stock.stockShortName}</p>
            <p className={styles.text}>Symbol: {stock.stockSymbol}</p>
            <p className={styles.text}>Price: {stock.stockPrice}</p>
            <p className={styles.text}>Date: {formatDate(stock.date)}</p>
            <p className={styles.text}>Location: {stock.location}</p>
            {renderChart(stock.stockSymbol)}
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