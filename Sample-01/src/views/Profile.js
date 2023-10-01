import React, {useState, useEffect} from "react";
import { Container, Row, Col } from "reactstrap";

import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import ErrorMessage from '../components/ErrorMessage'
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import styles from "./viewsCss/profile.module.css";
import axios from 'axios';

export const Profile = () => {
  const { user, isLoading} = useAuth0();
  const [depositAmount, setDepositAmount] = useState('');
  const [data, setData] = useState(null);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    if (user) {
      console.log("User.sub is:", user.sub);
      axios.get(`https://asyncfintech.me/getUser?auth0Id=${user.sub}`)
        .then(response => {
          if (response.data.success) {
            setData(response.data.data);
            setUserBalance(response.data.data.balance);
          } else {
            console.error(response.data.message);
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [user]);

  const handleDeposit = async () => {
    try {
      const response = await fetch('https://asyncfintech.me/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          auth0Id: user.sub,
          amount: depositAmount
        })
      });
  
      const result = await response.json();

      if (result.success) {
        setUserBalance((prevBalance) => prevBalance + parseFloat(depositAmount));
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('Failed to deposit:', error);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      {user && (
        <div className={styles.profileContainer}>
          <Row className={styles.profileHeader}>
            <Col md={2}>
              <img
                src={user.picture}
                alt={`${user.name}'s Profile`}
                className={`${styles.profilePicture} rounded-circle img-fluid`}
                decode="async"
              />
            </Col>
            <Col md>
              <h2 className={styles.userName}>{user.name}</h2>
              <p className={styles.textMuted}>{user.email}</p>
              <p className={styles.textMuted}>Balance: ${userBalance}</p>
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

export default withAuthenticationRequired(Profile, {
  onRedirecting: () => <Loading />,
  onError: (error) => <ErrorMessage>{error.message}</ErrorMessage>,
});