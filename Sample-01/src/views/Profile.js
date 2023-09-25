import React, {useState, useEffect} from "react";
import { Container, Row, Col } from "reactstrap";

import Highlight from "../components/Highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import styles from "./viewsCss/profile.css";
import axios from 'axios';

export const ProfileComponent = () => {
  const { user, isLoading} = useAuth0();
  const [depositAmount, setDepositAmount] = useState('');
  const [data, setData] = useState(null);
  const [token, setToken] = useState(null);

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
          setData(data);
        })
        .catch(function (error) {
          console.error(error);
        });
    }
  }, [user, token]);

  console.log(data);

  const handleDeposit = async () => {
    try {
      const response = await fetch('https://bc58dyc2of.execute-api.us-east-1.amazonaws.com/Dev/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.sub,
          amount: depositAmount,
          token: token
        })
      });

      const result = await response.json();
      if (result.success) {
        window.location.reload();
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('Failed to deposit:', error);
    }
  };

  return (
    <Container className="mb-5">
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={2}>
          <img
            src={user.picture}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
          />
        </Col>
        <Col md>
          <h2>{user.name}</h2>
          <p className="lead text-muted">{user.email}</p>
          <p className={styles.textMuted}>Balance: ${data ? data[0].user_metadata.balance : 0}</p>
        </Col>
      </Row>
      <Row>
        <Highlight>{JSON.stringify(user, null, 2)}</Highlight>
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
                  onChange={e => setDepositAmount(Number(e.target.value))}
                  className="form-control"
                />
              </div>
              <button onClick={handleDeposit} className={`btn btn-primary mt-2 ${styles.depositButton}`}>
                Deposit
              </button>
            </Col>
          </Row>
    </Container>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});
