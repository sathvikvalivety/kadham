import React from "react";
import { Link, useNavigate } from "react-router-dom";
import WalletConnect from "./WalletConnect";

function Navbar({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-primary">
          Kadham
        </Link>
        <nav className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              <Link to="/" className="text-sm text-gray-700 hover:text-primary">
                Dashboard
              </Link>
              <Link to="/deposit" className="text-sm text-gray-700 hover:text-primary">
                Deposit
              </Link>
              <Link to="/scan-product" className="text-sm text-gray-700 hover:text-primary">
                Product
              </Link>
              <Link to="/redeem" className="text-sm text-gray-700 hover:text-primary">
                Redeem
              </Link>
              <Link to="/transactions" className="text-sm text-gray-700 hover:text-primary">
                History
              </Link>
            </>
          )}
          <WalletConnect />
          {isAuthenticated ? (
            <button
              onClick={handleLogoutClick}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-sm text-primary">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
