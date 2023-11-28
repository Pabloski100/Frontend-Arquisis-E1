import React, { useState, useEffect, useRef } from 'react';
import styles from './viewsCss/offers.module.css';
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

    const fetchAuctions = async () => {
        try {
            const response = await axios.get(
                'https://api.asyncfintech.me/auctions',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = response.data;

            // Separate offers and proposals
            const offers = data.filter(auction => auction.group_id === 28 && auction.type === 'offer');
            const proposals = data.filter(auction => auction.type === 'proposal');
            console.log(proposals);

            // Associate proposals with their respective offers
            const offersWithProposals = offers.map(offer => {
                return {
                    ...offer,
                    proposals: proposals.filter(proposal => proposal.auction_id === offer.auction_id)
                };
            });

            setAuctions(offersWithProposals);
            setIsLoading(false);

        } catch (error) {
            console.log("Function error")
            setError(error);
            setIsLoading(false);
        }
    };

    fetchAuctions();
  }, [token]);

  const handleResponse = async (auction_id, stock_id, proposal_id, quantity, group_id, type) => {
    try {

      if (isAdmin) {
      const response = await axios.post(
        'https://api.asyncfintech.me/responseOffer',
        {
          auction_id: auction_id,
          proposal_id: proposal_id,
          stock_id: stock_id,
          quantity: quantity,
          group_id: group_id,
          type: type
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
  }
    catch (error) {
      console.log("Function error")
      setError(error);
    }
  }

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    isAdmin ? (
      <div className={styles.container}>
        <h2>My Offers and Proposals</h2>
        {auctions.map(offer => (
          <div key={offer} className={styles.stockItem}>
            <h1>Stock Offered: {offer.stock_id}</h1>
            <p>Id Auction: {offer.auction_id}</p>
            <p>Type: {offer.type}</p>
            <p>Group ID: {offer.group_id}</p>
            <p>Quantity: {offer.quantity}</p>
            {offer.proposalId && <p>Proposal ID: {offer.proposalId}</p>}
            <h1>Related Proposals</h1>
            {offer.proposals.map(proposal => (
              <div key={proposal.auction_id} className={styles.stockItem}>
                <h2>Proposal by group: {proposal.group_id}</h2>
                  <h3>Stock proposal: {proposal.stock_id}</h3>
                  <p>Id Auction: {proposal.auction_id}</p>
                  <p>Id Proposal: {proposal.proposal_id}</p>
                  <p>Type: {proposal.type}</p>
                  <p>Group ID: {proposal.group_id}</p>
                  <p>Quantity: {proposal.quantity}</p>
                  {proposal.proposalId && <p>Proposal ID: {proposal.proposalId}</p>}
                  <div className={styles.buyStockSection}>
                    <button 
                    className={styles.buyStockButtonAccept}
                    onClick={() => handleResponse(proposal.auction_id, proposal.stock_id, proposal.proposal_id, proposal.quantity, proposal.group_id, 'acceptance')}
                  >
                    Accept
                  </button>
                  <button 
                    className={styles.buyStockButtonReject}
                    onClick={() => handleResponse(proposal.auction_id, proposal.stock_id, proposal.proposal_id, proposal.quantity, proposal.group_id, 'rejection')}
                  >
                    Reject
                    </button>
                  </div>
              </div>
            ))}
          </div>
        ))}
        {showPopup && (
        <div className={styles.popup}>
          <div className={styles.popupHeader}>
            <h2>Status</h2>
            <span className={styles.popupClose} onClick={closePopup}>
              &times;
            </span>
          </div>
          <div className={styles.popupContent}>
            <p>{popupMessage}</p>
          </div>
        </div>
      )}
      </div>
      ) : (
        <div className={styles.container}>
          <h2>You are not an admin</h2>
        </div>
      )
  );
};  

export default Offers;
