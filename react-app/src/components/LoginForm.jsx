import { useState } from "react"; //component can store and update state values

function LoginForm() {
  //creating state variables
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  //using async and await. function handles submission function
  //runs when form is submitted
  async function handleSubmit(e) {
    e.preventDefault();

    // request sent to server
    // await pauses this function until the server responds.
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ //convert form data into JSON text
        username: username,
        password: password
      })
    });

    //receiving server response,  server response is converted from JSON text into a JavaScript object.
    // await pauses until conversion finishes
    const data = await response.json();//await pauses until response conversion to 
    setMessage(data.message); //updates state variable message
  }

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}> {/* Function reference. When the form is submitted, run handleSubmit() */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)} 
        /> {/* when user types username, update state - username */}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />{/* when user types password, update state - password */}

        <button type="submit">Login</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default LoginForm;