import React from 'react';
import styles from './componentsCss/footer.module.css'; // Import the styles object from your CSS Module

const Footer = () => (
  <footer className={styles.footer} data-testid="footer">
    <p data-testid="footer-text">© 2023 EquityEmpire. All rights reserved.</p>
    <p>
      <a href="https://equityempire.com/terms-of-service" className={styles.footerLink}>Terms of Service</a> |
      <a href="https://equityempire.com/privacy-policy" className={styles.footerLink}> Privacy Policy</a> |
      <a href="https://equityempire.com/contact" className={styles.footerLink}> Contact Us</a>
    </p>
  </footer>
);

export default Footer;

