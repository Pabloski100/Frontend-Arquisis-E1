import React, { useState, useEffect, useRef } from 'react';
import styles from './viewsCss/auctions.module.css';
import axios from 'axios';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});

const Offers = () => {
  const [auctions, setAuctions] = useState([]);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [relatedProposals, setRelatedProposals] = useState([]);
  const hasFetchedAuctions = useRef(false);

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
    if (hasFetchedAuctions.current || !token) {
      return;
    }
    hasFetchedAuctions.current = true;

    if (token) {
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
        console.log(data);
        setAuctions(data);
        setIsLoading(false);
        const filtered = data.filter(auction => 
          auction.group_id === 28 && auction.type === 'offer'
        );
        setFilteredOffers(filtered);
        const proposals = data.filter(auction => 
          auction.type === 'proposal' && 
          filtered.some(offer => offer.auction_id === auction.auction_id)
        );
        setRelatedProposals(proposals);
      } catch (error) {
        console.log("Function error")
        setError(error);
        setIsLoading(false);
      }
    };
     fetchAuctions();
  }}, [token]);

  const handleResponseOffer = async (auction_id, stock_id, quantity, group_id) => {
    try {
      const response = await axios.post(
        'http://localhost:3002/makeResponseOffer',
        {
          auction_id: auction_id,
          proposal_id: uuid(),
          stock_id: stock_id,
          quantity: quantity,
          group_id: group_id,
          type: 'proposal'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      console.log(data);
      setShowPopup(true);
      setPopupMessage("Offer made successfully!");
    }
    catch (error) {
      console.log("Function error")
      setError(error);
    }
  }

  return (
    isAdmin ? (
      <div className={styles.container}>
        <h2>My Offers</h2>
        {filteredOffers.map(offer => (
          <div key={offer.auction_id} className={styles.stockItem}>
              <h3>Stock: {offer.stock_id}</h3>
              <p>Id Auction: {offer.auction_id}</p>
              <p>Type: {offer.type}</p>
              <p>Group ID: {offer.group_id}</p>
              <p>Quantity: {offer.quantity}</p>
              {offer.proposalId && <p>Proposal ID: {offer.proposalId}</p>}
          </div>
        ))}
        <h2>Related Proposals</h2>
        {relatedProposals.map(proposal => (
          <div key={proposal.auction_id} className={styles.stockItem}>
            <h2>Proposal by group: {proposal.group_id}</h2>
              <h3>Stock: {proposal.stock_id}</h3>
              <p>Id Auction: {proposal.auction_id}</p>
              <p>Type: {proposal.type}</p>
              <p>Group ID: {proposal.group_id}</p>
              <p>Quantity: {proposal.quantity}</p>
              {proposal.proposalId && <p>Proposal ID: {proposal.proposalId}</p>}
          </div>
        ))}
      </div>
      ) : (
        <div className={styles.container}>
          <h2>You are not an admin</h2>
        </div>
      )
  );
};  

export default Offers;
