import React, { useState, useEffect, useRef } from 'react';
import styles from './viewsCss/stocks.module.css';
import axios from 'axios';
import UserPhoto from '../utils/UserPhoto.png';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useNavigate } from "react-router-dom";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [transbankToken, setTransbankToken] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedAuctions = useRef(false);

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
        
        if (newUserDetails['cognito:groups'] && newUserDetails['cognito:groups'].includes('Admin')) {
          setIsAdmin(true);
        }

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

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get(
          'http://localhost:3002/auctions',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        setAuctions(data);
        setIsLoading(false);
      } catch (error) {
        console.log("Function error")
        setError(error);
        setIsLoading(false);
      }
    };
  
    if (token) {
      fetchAuctions();
    }
  }, [token]);

  return (

    isAdmin ? (

    <div className={styles.container}>
      {auctions.length > 0 ? (
        auctions.map((auction) => (
          <div key={auction.id} className={styles.stockItem}>
            <h2>Auction by group: {auction.group_id}</h2>
            <h3>Stock: {auction.stock_id}</h3>
            <p>Id Auction: {auction.auction_id}</p>
            <p>Type: {auction.type}</p>
            <p>Group ID: {auction.group_id}</p>
            <p>Quantity: {auction.quantity}</p>
            {auction.proposalId && <p>Proposal ID: {auction.proposalId}</p>}
          </div>
        ))
      ) : error ? (
        <p>Failed to load auctions: {error.message}</p>
      ) : (
        <p>No auctions available.</p>
      )}
    </div> 
      ) : (
        <div className={styles.container}>
          <h1>Unauthorized</h1>
        </div>
      )
  );
}

export default Auctions;