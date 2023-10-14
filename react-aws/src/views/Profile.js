import React, {useState, useEffect} from "react";
import { Row, Col } from "reactstrap";
import Loading from "../components/Loading";
import ErrorMessage from '../components/ErrorMessage'
import styles from "./viewsCss/profile.module.css";
import axios from 'axios';
import { useSelector } from 'react-redux';
import UserPhoto from '../utils/UserPhoto.png';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useNavigate } from "react-router-dom";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});

export const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const cognitoUser = userPool.getCurrentUser();
  
  useEffect(() => {
    if (cognitoUser !== null) {
    cognitoUser.getSession((err, session) => {
        if (err) {
          alert(err.message || JSON.stringify(err));
          return;
        }
        const newToken = session.getIdToken().getJwtToken();
        console.log("token: ", newToken);
        setToken(newToken);
        const newUserDetails = session.getIdToken().payload;
        setUser(newUserDetails);
        console.log("user details: ", newUserDetails);

        console.log("user sub: ", newUserDetails.sub);

        axios.get(`https://api.asyncfintech.me/getUser?auth0Id=${newUserDetails.sub}`, {
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      })
      .then(response => {
        if (response.data.success) {
          setUserBalance(response.data.data.balance);
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

  const handleDeposit = async () => {
    if (cognitoUser !== null) {
      try {
        const response = await axios.post('https://api.asyncfintech.me/deposit', {
          auth0Id: user.sub,
          amount: depositAmount
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const result = response.data;
    
        if (result.success) {
          setUserBalance((prevBalance) => prevBalance + parseFloat(depositAmount));
        } else {
          console.error(result.message);
        }
      } catch (error) {
        console.error('Failed to deposit:', error);
      }
    };
  };

  return (
    <>
      {user && (
        <div className={styles.profileContainer}>
          <Row className={styles.profileHeader}>
            <Col md={2}>
              <img
                src={UserPhoto}
                alt={`${user.name}'s Profile`}
                className={`${styles.profilePicture} rounded-circle img-fluid`}
                decode="async"
                style={{ width: '150px' }}
              />
            </Col>
            <Col md>
              <h2 className={styles.userName}>Name: {user.name}</h2>
              <h2 className={styles.userEmail}>Email: {user.email}</h2>
              <h2 className={styles.userBalance}>Balance: ${userBalance}</h2>
            </Col>
          </Row>
          <Row className={styles.depositSection}>
            <Col md={{ size: 4, offset: 4 }} className={styles.depositContainer}>
              <div className={styles.depositField}>
                <label htmlFor="depositAmount" className={styles.label}>
                  Deposit Amount:
                </label>
                <input
                  id="depositAmount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="form-control"
                />
              </div>
              <button onClick={handleDeposit} className={`btn btn-primary mt-2 ${styles.depositButton}`}>
                Deposit
              </button>
            </Col>
          </Row>
        </div>
      )}
      {!user && <ErrorMessage>Failed to load user data. Please try again later.</ErrorMessage>}
    </>
  );
}

export default Profile;