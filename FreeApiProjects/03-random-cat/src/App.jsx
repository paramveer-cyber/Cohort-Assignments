import { useState, useEffect } from "react";

function App() {
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCat = async () => {
    setLoading(true);
    setError(null);

    const url = "https://api.freeapi.app/api/v1/public/cats/cat/random";

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch cat");

      const data = await response.json();
      setCat(data.data);
      setLoading(false);
    } 
    catch (error) {
      setError(error);
      setLoading(false);
    } 
  };

  useEffect(() => {
    fetchCat();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Random Cat</h1>

      {loading && <p className="status">Loading...</p>}
      {error && <p className="error">{error.message}</p>}

      {cat && (
        <div className="card">
          <img src={cat.image} alt={cat.name} className="avatar" />

          <h2>{cat.name}</h2>

          <p><b>Origin:</b> {cat.origin}</p>
          <p><b>Life Span:</b> {cat.life_span} years</p>
          <p><b>Weight:</b> {cat.weight.metric} kg</p>

          <hr />

          <h3>Temperament</h3>
          <p>{cat.temperament}</p>

          <hr />

          <h3>Description</h3>
          <p>{cat.description}</p>

          <hr />

          <h3>Traits</h3>
          <p>Affection: {cat.affection_level}/5</p>
          <p>Energy: {cat.energy_level}/5</p>
          <p>Intelligence: {cat.intelligence}/5</p>
          <p>Child Friendly: {cat.child_friendly}/5</p>

          <button className="btn" onClick={fetchCat}>
            New Cat
          </button>
        </div>
      )}
    </div>
  );
}

export default App;