import { useState } from "react"; //component can store and update state values

function SearchBar() {
  const [searchData, setSearchData] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    // request sent to server
    // await pauses this function until the server responds.
    const response = await fetch("http://localhost:3000/search", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ //convert form data into JSON text
        searchData: searchData,
      })
    }); 

    const data = await response.json();//await pauses until response conversion to 
  }

  return (
    <div style={{ margin: "20px 0" }}>
      <input
        type="text"
        placeholder="Search..."
        style={{
          padding: "10px",
          width: "300px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />
    </div>
  );
}

export default SearchBar;
