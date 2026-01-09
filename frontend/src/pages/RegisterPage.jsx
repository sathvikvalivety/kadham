import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createApiClient } from "../lib/api";

function RegisterPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const api = createApiClient();
      await api.post("/auth/register", { email, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1000);
    } catch (_err) {
      setError("Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full border rounded px-2 py-1 text-sm"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="w-full border rounded px-2 py-1 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">Registration successful. Redirecting...</p>
        )}
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded text-sm font-medium"
        >
          Register
        </button>
      </form>
      <p className="text-xs text-gray-600 mt-3">
        Already registered?{" "}
        <Link to="/login" className="text-primary">
          Login
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
