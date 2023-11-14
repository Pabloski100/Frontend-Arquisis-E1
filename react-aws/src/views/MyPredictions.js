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
          console.log(token);
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
              // setPredictions(response.data.data.predictions);
              // console.log(response.data.data.predictions);
            } else {
              console.error(response.data.message);
            }
          }).catch(error => {
            console.error("API call failed:", error);
          });
        });
      }
    }
  }, [setIsApiCalled, isApiCalled, token, setToken]);

  useEffect(() => {
    // Configuración del encabezado con el token de portador
    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Realizar la solicitud GET a la API con el encabezado
    axios.get('https://api.asyncfintech.me/prediction', { headers })
      .then(response => {
        // Actualizar el estado con los datos de la respuesta
        console.log(response.data);
        setPredictions(response.data);
      })
      .catch(error => {
        console.error('Error al obtener predicciones:', error);
      });
  }, [token]);

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
      return <p className={styles.text}>No predictions available.</p>;

    }
    console.log(user.sub);
  
    const predictionGroups = {};

    predictions
      .filter(prediction => prediction.userId === user.sub) // Filtra las predicciones por userId igual a user.sub
      .forEach(prediction => {
        if (!predictionGroups[prediction.symbol]) {
          predictionGroups[prediction.symbol] = [];
        }
        predictionGroups[prediction.symbol].push(prediction);
      });

    return (
      <ul className={styles.predictionList}>
        {Object.keys(predictionGroups).map((symbol, index) => (
          <div className={styles.predictionItem} key={index}>
            <h1 className={styles.header}>Predictions of {symbol} that you own</h1>
            {predictionGroups[symbol].map((prediction, subIndex) => (
              <div key={subIndex}>
                <p className={styles.text}>Prediction {subIndex + 1}</p>
                <p className={styles.text}>Symbol: {prediction.symbol}</p>
                <p className={styles.text}>Earnings: {prediction.ganancia}</p>
                <p className={styles.text}>Time of Investment: {prediction.tiempoInversionDias}</p>
                <p className={styles.text}>Status: Ready</p>
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