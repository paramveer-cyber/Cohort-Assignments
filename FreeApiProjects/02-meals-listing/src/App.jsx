import { useState, useEffect } from "react";

function App() {
  const [meals, setMeals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeals = async () => {
    setLoading(true);
    setError(null);

    const url = `https://api.freeapi.app/api/v1/public/meals?page=${page}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch meals");

      const data = await response.json();
      setMeals(data.data.data);
      setTotalPages(data.data.totalPages);
      setLoading(false);
    } 
    catch (error) {
      setError(error);
      setLoading(false);
    } 
  };

  useEffect(() => {
    fetchMeals();
  }, [page]);

  return (
    <div className="container">
      <h1 className="title">Meals</h1>

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
        {meals.map((meal) => (
          <div key={meal.idMeal} className="card">
            <img src={meal.strMealThumb} alt={meal.strMeal} />

            <div className="card-content">
              <h2>{meal.strMeal}</h2>

              <p className="meta">
                {meal.strCategory} • {meal.strArea}
              </p>

              <p className="desc">
                {meal.strInstructions?.slice(0, 120)}...
              </p>

              {meal.strYoutube && (
                <a
                  href={meal.strYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  Watch Recipe
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;