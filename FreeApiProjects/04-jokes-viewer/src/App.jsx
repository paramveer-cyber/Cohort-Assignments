import { useState, useEffect } from "react";

function App() {
  const [jokes, setJokes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJokes = async () => {
    setLoading(true);
    setError(null);

    const url = `https://api.freeapi.app/api/v1/public/randomjokes?page=${page}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch jokes");

      const data = await response.json();
      setJokes(data.data.data);
      setTotalPages(data.data.totalPages);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJokes();
  }, [page]);

  return (
    <div className="container">
      <h1 className="title">Random Jokes</h1>

      <div className="pagination">
        <button
          className="btn"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
        >
          Previous
        </button>

        <span className="page">Page {page}</span>

        <button
          className="btn"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        >
          Next
        </button>
      </div>

      {loading && <p className="status">Loading...</p>}
      {error && <p className="error">{error.message}</p>}

      {jokes.map((joke) => (
        <div key={joke.id} className="card">
          <h2>Joke #{joke.id}</h2>

          {joke.categories.length > 0 && (
            <p><b>Category:</b> {joke.categories.join(", ")}</p>
          )}

          <hr />

          <p>"{joke.content}"</p>
        </div>
      ))}
    </div>
  );
}

export default App;