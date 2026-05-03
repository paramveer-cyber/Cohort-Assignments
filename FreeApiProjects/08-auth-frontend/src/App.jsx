import { useState, useEffect } from "react";

function App() {
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_KA_BASE = "https://api.freeapi.app/api/v1/users";

  const register = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_KA_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          username: username,
          password: password,
          role: "USER",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("Registered successfully. Now login.");
      setLoading(false);
      setMode("login");
    } 
    catch (err) {
      setLoading(false);
      setMessage(err.message);
    }
  };

  const login = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_KA_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const token = data.data.accessToken;

      localStorage.setItem("token", token);
      setLoading(false);
      setUser(data.data.user);
      setMessage("Login successful");
    } catch (err) {
      setLoading(false);
      setMessage(err.message);
    }

  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMessage("Logged out");
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_KA_BASE}/current-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) setUser(data.data);
    } catch {}
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Auth App</h1>

      {user ? (
        <div className="card">
          <h2>Welcome, {user.username}</h2>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>

          <button className="btn" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="card">
          <h2>{mode === "login" ? "Login" : "Register"}</h2>

          {mode === "register" && (
            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          <input
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="btn"
            onClick={mode === "login" ? login : register}
            disabled={loading}
          >
            {loading ? "Loading..." : mode === "login" ? "Login" : "Register"}
          </button>

          <p className="switch">
            {mode === "login" ? "No account?" : "Already have 1?"}
            <span onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? " Register" : " Login"}
            </span>
          </p>
        </div>
      )}

      {message && <p className="status">{message}</p>}
    </div>
  );
}

export default App;