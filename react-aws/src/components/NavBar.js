import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import styles from './componentsCss/navBar.module.css';
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const navigate = useNavigate();

  const userPool = new CognitoUserPool({
    UserPoolId: process.env.REACT_APP_USERPOOL_ID,
    ClientId: process.env.REACT_APP_APPCLIENT_ID,
  });

  const cognitoUser = userPool.getCurrentUser();

  const signOut = () => {
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.signOut();
    }

    navigate("/");
    window.location.reload();
  };

  const authenticatedLinks = [
    { to: '/profile', label: 'Profile' },
    { to: '/stocks', label: 'Stocks' },
    { to: '/mystocks', label: 'My Stocks' },
    { to: '/', label: 'Sign Out', action: signOut }
  ];

  const unauthenticatedLinks = [
    { to: '/login', label: 'Log In' },
    { to: '/signup', label: 'Sign Up' }
  ];

  const linksToRender = cognitoUser ? authenticatedLinks : unauthenticatedLinks;

  return (
    <div className={styles.navContainer}>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/" className={styles.navbarBrand}>Home</Link>
          <button className={styles.navbarToggler} onClick={toggle}>☰</button>
          <div className={`${styles.collapse} ${isOpen ? styles.isOpen : ''}`}>
            <ul className={styles.navbarNav}>
              {linksToRender.map(link => (
                <li key={link.to} className={styles.navItem}>
                  <Link to={link.to} className={styles.navLink} onClick={link.action || null}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
