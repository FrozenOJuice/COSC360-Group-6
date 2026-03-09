import { useState } from "react";

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch(
      `http://localhost:3000/search?q=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    setResults(data);
    setHasSearched(true);
    setSearchTerm("");
  }

  return (
    <div style={{ margin: "20px 0" }}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <button type="submit" style={{ marginLeft: "10px" }}>
          Search
        </button>
      </form>

      {results.map((item, index) => (
        <div key={`${item.title}-${item.company}-${index}`} style={{ marginTop: "10px" }}>
          {item.title} - {item.company}
        </div>
      ))}

      {hasSearched && results.length === 0 && (
        <p style={{ marginTop: "10px" }}>No results found</p>
      )}
    </div>
  );
}

export default SearchBar;
