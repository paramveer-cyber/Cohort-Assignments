import { useState, useEffect } from "react";

function App() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const url = `https://api.freeapi.app/api/v1/public/randomproducts?page=${page}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data.data.data);
      setTotalPages(data.data.totalPages);
      setLoading(false);
    } 
    catch (error) {
      setError(error);
      setLoading(false);
    } 
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  return (
    <div className="container">
      <h1 className="title">Products</h1>

      <div className="pagination">
        <button
          className="btn"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
        >
          Previous
        </button>

        <span>Page {page}</span>

        <button
          className="btn"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        >
          Next
        </button>
      </div>

      {loading && <p className="status">Loading...</p>}
      {error && <p className="error">{error.message}</p>}

      <div className="grid">
        {products.map((product) => (
          <div key={product.id} className="card">
            <img src={product.thumbnail} alt={product.title} />

            <div className="card-content">
              <h2>{product.title}</h2>

              <p className="meta">{product.category}</p>

              <p className="desc">Price: ${product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;