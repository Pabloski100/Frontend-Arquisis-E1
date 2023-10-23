import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "reactstrap";
import NavBar from "./components/NavBar"; // Import Navbar
import Loading from "./components/Loading";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Profile from "./views/Profile";
import Stocks from "./views/Stocks";
import MyStocks from "./views/MyStocks";
import ConfirmPurchase from "./views/ConfirmPurchase";
import PurchaseCompleted from "./views/PurchaseCompleted";
import { SignUp } from "./aws/SignUp"; // Import SignUp
import Login from "./aws/Login"; // Import Login

// styles
import "./app.module.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
  return (
    <Router>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/mystocks" element={<MyStocks />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/confirm-purchase" element={<ConfirmPurchase />} />
            <Route path="/purchase-completed" element={<PurchaseCompleted />} />
          </Routes>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
