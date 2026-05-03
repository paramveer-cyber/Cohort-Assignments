import { useState, useEffect } from "react";

function App() {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);

    const url = `https://api.freeapi.app/api/v1/public/youtube/videos?page=${page}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch videos");

      const data = await response.json();
      setVideos(data.data.data);
      setTotalPages(data.data.totalPages);
      setLoading(false);
    } 
    catch (error) {
      setError(error);
      setLoading(false);
    } 
  };

  useEffect(() => {
    fetchVideos();
  }, [page]);

  return (
    <div className="container">
      <h1 className="title">Videos</h1>

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
        {videos.map((video) => {
          const v = video.items;
          return (
            <div key={v.id} className="card">
              <img
                src={v.snippet.thumbnails.medium.url}
                alt={v.snippet.title}
              />

              <div className="card-content">
                <h2>{v.snippet.title}</h2>

                <p className="meta">
                  {v.snippet.channelTitle}
                </p>

                <p className="desc">
                  👁 {v.statistics.viewCount} • 👍 {v.statistics.likeCount}
                </p>

                <a
                  href={`https://www.youtube.com/watch?v=${v.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  Watch Video
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;