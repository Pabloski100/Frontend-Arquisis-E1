import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import styles from './viewsCss/predictions.module.css';
import ErrorMessage from '../components/ErrorMessage'
import axios from 'axios';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});


function My_predictions() {
  const [token, setToken] = useState(null);
  const [predictions, setPredictions] = useState(null);
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
              setPredictions(response.data.data.predictions);
              console.log(response.data.data.predictions);
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

  // useEffect(() => {
  //   if (predictions) {
  //     const fetchAllPredictions = async () => {
  //       const allPromises = fetchPredictions();
  //       const allData = await Promise.all(allPromises);

  //       setHistoricalData(newHistoricalData);
  //     };
  //     fetchAllHistories();
  //   }
  // }, [predictions]);  

  useEffect(() => {
    if (predictions) {
      const fetchAllPredictions = async () => {
        const allPromises = fetchPredictions();
        const allData = await Promise.all(allPromises);
      };
      fetchAllPredictions();
    } 
  }, [predictions]);


  const fetchPredictions = async () => {
    try {
      const response = await axios.get(`https://api.asyncfintech.me/predictions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(error);
      return;
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

  const renderPredictions = () => {
    if (!predictions) {
      // return <p className={styles.text}>No predictions available.</p>;

    }
  
    const predictionGroups = {};

    // ---------------------------------------------

    // Coment out this section when API is working

    predictionGroups["AAPL"] = [];
    predictionGroups["AMZN"] = [];

    predictionGroups["AAPL"].push({
      stockshortName: "Apple",
      stocksymbol: "AAPL",
      date: "2021-05-01T00:00:00.000Z",
      value: 100,
      status: "pending"
    });

    predictionGroups["AAPL"].push({
      stockshortName: "Apple",
      stocksymbol: "AAPL",
      date: "2021-05-01T00:00:00.000Z",
      value: 100,
      status: "pending"
    });

    predictionGroups["AMZN"].push({
      stockshortName: "Amazon",
      stocksymbol: "AMZN",
      date: "2021-05-01T00:00:00.000Z",
      value: 100,
      status: "pending"
    });

    predictionGroups["AMZN"].push({
      stockshortName: "Amazon",
      stocksymbol: "AMZN",
      date: "2021-05-01T00:00:00.000Z",
      value: 100,
      status: "pending"
    });

    // Comment out this section when API is working

    // ---------------------------------------------


   // ---------------------------------------------
   
   // Uncomment this section when API is working

    // predictions.forEach(prediction => {
    //   if (!predictionGroups[prediction.symbol]) {
    //     predictionGroups[prediction.stocksymbol] = [];
    //   }
    //   predictionGroups[prediction.stocksymbol].push(prediction);
    // });

    // Uncomment this section when API is working

    // ---------------------------------------------

    
  
    return (
      <ul className={styles.predictionList}>
        {Object.keys(predictionGroups).map((symbol, index) => (
          <div className={styles.predictionItem} key={index}>
            <h1 className={styles.header}>Predictions of {symbol} that you own</h1>
            {predictionGroups[symbol].map((prediction, subIndex) => (
              <div key={subIndex}>
                <h2 className={styles.header}>Prediction {subIndex + 1}</h2>
                <p className={styles.text}>Company: {prediction.stockshortName}</p>
                <p className={styles.text}>Symbol: {prediction.stocksymbol}</p>
                <p className={styles.text}>Date: {formatDate(prediction.date)}</p>
                <p className={styles.text}>Value: {prediction.value}</p>
                <p className={styles.text}>Status: {prediction.status}</p>
              </div>
            ))}
          </div>
        ))}
      </ul>
    );
  };  

  

  return (
    <>
      {user ? (
        <div className={styles.predictionsContainer}>
          <Row>
            <Col md={12}>
              <h1 className={styles.header}>Your Predictions</h1>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <ul className={styles.predictionList}>{renderPredictions()}</ul>
            </Col>
          </Row>
        </div>
      ) : (
        <ErrorMessage>Failed to load user data. Please try again later.</ErrorMessage>
      )}
    </>
  );
}

export default My_predictions;