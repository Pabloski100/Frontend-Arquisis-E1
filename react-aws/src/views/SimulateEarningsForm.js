import React, { useState, useEffect } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { faShuttleSpace } from '@fortawesome/free-solid-svg-icons';
import styles from "./viewsCss/profile.module.css";
import { Row, Col } from "reactstrap";

const userPool = new CognitoUserPool({
    UserPoolId: process.env.REACT_APP_USERPOOL_ID,
    ClientId: process.env.REACT_APP_APPCLIENT_ID,
  });

const SimulateEarnings = ({ simulateEarningsData }) => {
    const { stock_id, stock_price, stock_symbol, stock_shortName } = simulateEarningsData;
    const [quantity, setQuantity] = useState(0);
    const [tiempoInversion, setTiempoInversion] = useState(0);
    const [results, setResults] = useState(null);
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
		const [simulationStatus, setSimulationStatus] = useState('idle');

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

		const handleSubmit = (e) => {
			e.preventDefault(); // Prevenir la recarga de la página
			handleSimulateEarnings();
		};

		const closePopup = () => {
			setShowPopup(false);
		};

		const handleSimulateEarnings = async () => {
			try {
				console.log("Simulate earnings");
				console.log(stock_id);
				console.log(stock_price);
				console.log(stock_symbol);
				console.log(stock_shortName);
				console.log(quantity);
				console.log(tiempoInversion);
			

				const response = await axios.post('https://api.asyncfintech.me/job', {
					userId: user.sub,
					nAccionesCompra: quantity,
					tiempoInversion : tiempoInversion,
					symbol: stock_symbol,
				}, {
					timeout: 300000,
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
				});


				setSimulationStatus('success');
				

			} catch (error) {
				console.log("Simulate earnings error");
				console.log(error);
				setPopupMessage(error.message);
				setShowPopup(true);
				setSimulationStatus('error');
				console.log("popupMessage");
			}
		};


  return (
		<div className={styles.profileContainer}>
          <Row className={styles.profileHeader}>
            <Col md>
              <h2 className={styles.userName}>Simulate earnings for: {stock_shortName}</h2>
            </Col>
          </Row>
          <Row className={styles.depositSection}>
            <Col md={{ size: 4, offset: 4 }} className={styles.depositContainer}>
              <div className={styles.depositField}>
                <label htmlFor="quantity" className={styles.label}>
                  Cantidad de acciones:
                </label>
                <input
                  id="quantity"
                  type="number"
									value={quantity}
									onChange={(e) => setQuantity(e.target.value)}
                  className="form-control"
                />
              </div>
							<div className={styles.depositField}>
                <label htmlFor="tiempoInversion" className={styles.label}>
                  Tiempo de inversion (en dias):
                </label>
                <input
                  id="tiempoInversion"
                  type="number"
									value={tiempoInversion}
									onChange={(e) => setTiempoInversion(e.target.value)}
                  className="form-control"
                />
              </div>
              <button onClick={handleSubmit} className={`btn btn-primary mt-2 ${styles.depositButton}`}>
                Simulate
              </button>

							{/* Renderizar el contenido según el estado de la simulación */}
							{simulationStatus === 'success' && (
								<div>
									<h3>¡Simulación exitosa!</h3>
									{/* Puedes agregar más contenido aquí */}
								</div>
							)}

							{simulationStatus === 'error' && (
								<div>
									<h3>¡La simulación falló!</h3>
									{/* Puedes agregar más contenido aquí */}
								</div>
							)}

							{simulationStatus === 'idle' && (
								<div>
									{/* Contenido predeterminado si no se ha realizado ninguna simulación */}
								</div>
							)}
            </Col>
          </Row>
        </div>
  );
};

export default SimulateEarnings;
