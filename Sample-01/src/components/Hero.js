import React from 'react';
import Logojpeg from '../utils/logo.jpeg';

const Hero = () => (

  <div className="container">
    <div className="row">
      <div className="col-12 col-md-6 offset-md-3 text-center">
      <img src={Logojpeg} alt="EquityEmpire Logo" className="img-fluid" style={{ width: '150px' }} />
      </div>
    </div>
  
    <div className="hero my-5 text-center" data-testid="hero" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="mb-4" data-testid="hero-title">
        EquityEmpire: Your Gateway to the Stock Market
      </h1>

      <p className="lead" data-testid="hero-lead">
        Welcome to EquityEmpire, the premier platform for exploring, seeing, and buying stocks with ease and confidence.
        Our user-friendly interface and real-time market data ensure you have all the tools at your fingertips to make
        informed decisions. Start your journey to financial empowerment today with us!
      </p>
    </div>
  </div>
);

export default Hero;
