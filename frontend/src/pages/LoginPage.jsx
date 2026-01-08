import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createApiClient } from "../lib/api";

function LoginPage({ onLogin }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const api = createApiClient();
      const res = await api.post("/auth/login", { email, password });
      onLogin(res.data.token);
      navigate("/");
    } catch (_err) {
      setError("Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
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
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded text-sm font-medium"
        >
          Login
        </button>
      </form>
      <p className="text-xs text-gray-600 mt-3">
        New to Kadham?{" "}
        <Link to="/register" className="text-primary">
          Register
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
