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

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedAuctions = useRef(false);
  const [quantities, setQuantities] = useState({});
  const [ourAuctions, setOurAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState({ stock_id: '', quantity: 0 });
  const [maxQuantity, setMaxQuantity] = useState(0);

  const cognitoUser = userPool.getCurrentUser();

  const handleQuantityChange = (auctionId, value) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity >= 0) {
      setQuantities({ ...quantities, [auctionId]: quantity });
    }
  };

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
        setAuctions(data);

        const ourAuctions = data.filter(auction => auction.group_id === 28);
        setOurAuctions(ourAuctions);
        console.log(ourAuctions);
        setIsLoading(false);
      } catch (error) {
        console.log("Function error")
        setError(error);
        setIsLoading(false);
      }
    };

      fetchAuctions();
    }
  }, [token]);

  const handleMakeOffer = async (auction_id, stock_id, quantity, group_id) => {
    console.log(auction_id, stock_id, quantity, group_id);
    try {
      const response = await axios.post(
        'http://localhost:3002/makeOffer',
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSelectedAuction({ ...selectedAuction, [name]: value });

    // Update maxQuantity based on the selected stock
    const selectedStock = ourAuctions.find(auction => auction.stock_id === value);
    if (selectedStock) {
      setMaxQuantity(selectedStock.quantity);
    } else {
      setMaxQuantity(0); // Reset if no stock is selected
    }
  };

  return (

    isAdmin ? (

    <div className={styles.container}>
      <h2>Our Auctions</h2>
      {auctions.length > 0 ? (
        auctions.map((auction) => (
          auction.type === 'offer' && (
            <div key={auction.id} className={styles.stockItem}>
              <h2>Auction by group: {auction.group_id}</h2>
              <h3>Stock: {auction.stock_id}</h3>
              <p>Id Auction: {auction.auction_id}</p>
              <p>Type: {auction.type}</p>
              <p>Group ID: {auction.group_id}</p>
              <p>Quantity: {auction.quantity}</p>
              {auction.proposalId && <p>Proposal ID: {auction.proposalId}</p>}
              {auction.group_id !== '28' && (
                <div className={styles.buyStockSection}>
                  <select name="stock_id" onChange={handleChange}>
                    <option value="">Select stock</option>
                    {ourAuctions.map(auction => (
                      <option key={auction.auction_id} value={auction.stock_id}>{auction.stock_id}</option>
                    ))}
                  </select>

                  <input 
                    className={styles.quantityInput}
                    type="number" 
                    value={quantities[auction.id] || ''} 
                    onChange={(e) => handleQuantityChange(auction.id, e.target.value)}
                    max={maxQuantity}
                    min="0"
                  />

                  <button
                    className={styles.buyStockButton}
                    onClick={() => handleMakeOffer(auction.auction_id, selectedAuction.stock_id, quantities[auction.id], auction.group_id)}
                  >
                    Make offer
                  </button>     

                </div>
                )}
              </div>
            )
          ))
        ) : (
          <p>No auctions found</p>
        )}
    </div>
    ) : (
      <div className={styles.container}>
        <h2>You are not an admin</h2>
      </div>
    )
  );
}

export default Auctions;
