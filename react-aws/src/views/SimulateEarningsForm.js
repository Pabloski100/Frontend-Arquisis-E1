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
    const [time, setTime] = useState(0);
    const [results, setResults] = useState(null);
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);

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

		const handleSimulateEarnings = async () => {
			try {
				console.log("Simulate earnings");
				console.log(stock_id);
				console.log(stock_price);
				console.log(stock_symbol);
				console.log(stock_shortName);
				console.log(quantity);
				console.log(time);
			

				const response = await axios.post('https://api.asyncfintech.me/job', {
					userId: user.sub,
					quantity: quantity,
					time: time,
					stockSymbol: stock_symbol,
				}, {
					timeout: 300000,
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
				});
				// const result = response.data;
				// if (result.success) {
				//   setTransbankToken(result.token);
				//   navigate('/confirm-purchase', { state: { token: result.token, url: result.url, userId: user.sub, stockId: stock_id, stockPrice: stock_price, stockSymbol: stock_symbol, stockShortName: stock_shortName, location: location } });
		
				// } else {
				//   console.log("Success error");
				//   setPopupMessage(result.message);
				//   setShowPopup(true);
				// }
			} catch (error) {
				console.log("Simulate earnings error");
				console.log(error);
				setPopupMessage(error.message);
				setShowPopup(true);
			}
		};

		const testhandleSimulateEarnings = async () => {
			try {
				console.log("Simulate earnings");
				console.log(stock_id);
				console.log(stock_price);
				console.log(stock_symbol);
				console.log(stock_shortName);
				console.log(quantity);
				console.log(time);
			} catch (error) {
				console.log("Simulate earnings error");
				console.log(error);
				setPopupMessage(error.message);
				setShowPopup(true);
			}
		};


  return (
    // <div className={styles.profileContainer}>
		// 	<div className={styles.depositSection}>
    //   <h2>Simulate Earnings</h2>
    //   <form onSubmit={handleSubmit}>
		// 		<div className={styles.depositField}>
		// 			<label>
		// 				Cantidad de acciones:
		// 				<input
		// 					type="number"
		// 					value={quantity}
		// 					onChange={(e) => setQuantity(e.target.value)}
		// 				/>
		// 			</label>
		// 		</div>
    //     <br />
    //     <label>
    //       Tiempo de ahorro (en semanas):
    //       <input
    //         type="number"
    //         value={time}
    //         onChange={(e) => setTime(e.target.value)}
    //       />
    //     </label>
    //     <br />
    //     <button type="submit">Simulate</button>
    //   </form>
    //   {results && (
    //     <div>
    //       <h3>Simulation Results:</h3>
    //       {/* Mostrar los resultados aquí */}
    //     </div>
    //   )}
		// 	</div>
    // </div>
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
                <label htmlFor="time" className={styles.label}>
                  Cantidad de acciones:
                </label>
                <input
                  id="time"
                  type="number"
									value={time}
									onChange={(e) => setTime(e.target.value)}
                  className="form-control"
                />
              </div>
              <button onClick={handleSubmit} className={`btn btn-primary mt-2 ${styles.depositButton}`}>
                Simulate
              </button>
            </Col>
          </Row>
        </div>
  );
};

export default SimulateEarnings;
