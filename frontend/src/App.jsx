import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import WasteDepositPage from "./pages/WasteDepositPage";
import ProductScanPage from "./pages/ProductScanPage";
import RedeemPage from "./pages/RedeemPage";
import TransactionsPage from "./pages/TransactionsPage";
import DepositHistoryPage from "./pages/DepositHistoryPage";

function App() {
  const [token, setToken] = React.useState(localStorage.getItem("kadham_token"));

  const handleLogin = (jwt) => {
    localStorage.setItem("kadham_token", jwt);
    setToken(jwt);
  };

  const handleLogout = () => {
    localStorage.removeItem("kadham_token");
    setToken(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/deposit"
            element={isAuthenticated ? <WasteDepositPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/scan-product"
            element={isAuthenticated ? <ProductScanPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/redeem"
            element={isAuthenticated ? <RedeemPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/transactions"
            element={isAuthenticated ? <TransactionsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/history"
            element={isAuthenticated ? <DepositHistoryPage /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
