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
import MyPredictions from "./views/MyPredictions";
import ConfirmPurchase from "./views/ConfirmPurchase";
import PurchaseCompleted from "./views/PurchaseCompleted";
import ConfirmPurchaseFraction from "./views/ConfirmPurchaseFraction";
import PurchaseCompletedFraction from "./views/PurchaseCompletedFraction";
import GroupStocks from "./views/GroupStocks";
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
            <Route path="/mypredictions" element={<MyPredictions />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/confirm-purchase" element={<ConfirmPurchase />} />
            <Route path="/purchase-completed" element={<PurchaseCompleted />} />
            <Route path="/groupstocks" element={<GroupStocks />} />
            <Route path="/confirm-purchase-fraction" element={<ConfirmPurchaseFraction />} />
            <Route path="/purchase-completed-fraction" element={<PurchaseCompletedFraction />} />
          </Routes>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
