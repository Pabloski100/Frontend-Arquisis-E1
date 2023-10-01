import React from 'react';

const Footer = () => (
  <footer className="bg-light p-3 text-center" data-testid="footer">
    <p data-testid="footer-text">© 2023 EquityEmpire. All rights reserved.</p>
    <p>
      <a href="https://equityempire.com/terms-of-service">Terms of Service</a> |
      <a href="https://equityempire.com/privacy-policy"> Privacy Policy</a> |
      <a href="https://equityempire.com/contact"> Contact Us</a>
    </p>
  </footer>
);

export default Footer;
