import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = 'https://api.freeapi.app/api/v1/public/randomusers/user/random';
      const options = { method: 'GET', headers: { accept: 'application/json' } };

      const response = await fetch(url, options);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setUser(data.data);
      setLoading(false);
    } 
    catch (error) {
      setError(error);
      setLoading(false);
    } 
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Random User</h1>
      <button className="btn" onClick={fetchUser}>
        Generate New User
      </button>
      {loading && <p className="status">Loading...</p>}
      {error && <p className="error">Error: {error.message}</p>}

      {user && (
        <div className="card">
          <img src={user?.picture?.large} alt="User" className="avatar" />
          <h2>
            {user.name.title} {user.name.first} {user.name.last}
          </h2>

          <p><b>Gender:</b> {user.gender}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Phone:</b> {user.phone}</p>
          <p><b>Cell:</b> {user.cell}</p>
          <p><b>Nationality:</b> {user.nat}</p>

          <hr />

          <h3>Location</h3>
          <p>
            {user.location.street.number}, {user.location.street.name}
          </p>
          <p>
            {user.location.city}, {user.location.state}
          </p>
          <p>
            {user.location.country} - {user.location.postcode}
          </p>
          <p>
            Lat: {user.location.coordinates.latitude},
            Lng: {user.location.coordinates.longitude}
          </p>
          <p>
            Timezone: {user.location.timezone.offset} (
            {user.location.timezone.description})
          </p>

          <hr />

          <h3>Login</h3>
          <p><b>Username:</b> {user.login.username}</p>
          <p><b>UUID:</b> {user.login.uuid}</p>

          <hr />

          <h3>DOB</h3>
          <p>{new Date(user.dob.date).toLocaleString()}</p>
          <p>Age: {user.dob.age}</p>

          <h3>Registered</h3>
          <p>{new Date(user.registered.date).toLocaleString()}</p>
          <p>Years: {user.registered.age}</p>
        </div>
      )}
    </div>
  );
}

export default App;