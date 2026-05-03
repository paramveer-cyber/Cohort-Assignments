import { useState, useEffect } from "react";

function App() {
  const [quotes, setQuotes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);

    const url = `https://api.freeapi.app/api/v1/public/quotes?page=${page}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch quotes");

      const data = await response.json();
      setQuotes(data.data.data);
      setTotalPages(data.data.totalPages);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [page]);

  return (
    <div className="container">
      <h1 className="title">Random Quotes</h1>

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

      {quotes.map((quote) => (
        <div key={quote.id} className="card">
          <h2>Quote by {quote.author}</h2>

          {quote.tags?.length > 0 && (
            <p><b>Tags:</b> {quote.tags?.join(", ")}</p>
          )}

          <hr />

          <p>"{quote.content}"</p>
        </div>
      ))}
    </div>
  );
}

export default App;