import "../styles/Navbar.css"

function Navbar({ role }) {
    const browseButtonText = (role=="employer") ? "View Listing" : "Browse Jobs";

    const handleRedirect = (page) => {
        // Redirect to page
        alert(page);
    };

  return (
    <div className="navbar">
        <button onClick={() => handleRedirect("job board")} className="navbar-button">
            Job Board
        </button>

        <span>
            <div className="buttons-right">
                {!role && (<div><button onClick={() => handleRedirect("register")} className="navbar-button" id="gray-button">
                    Register
                </button>
                <button onClick={() => handleRedirect("login")} className="navbar-button" id="gray-button">
                    Login
                </button></div>)}

                {role && (<button onClick={() => handleRedirect("logout")} className="navbar-button" id="gray-button">
                    Logout
                </button>)}

                {role=="jobSeeker" && (<button onClick={() => handleRedirect("profile")} className="navbar-button" id="gray-button">
                    Profile
                </button>)}


                {role=="admin" && (<div><button onClick={() => handleRedirect("analytics")} className="navbar-button" id="gray-button">
                    Analytics
                </button>
                <button onClick={() => handleRedirect("users")} className="navbar-button" id="gray-button">
                    Users
                </button></div>)}

                <button onClick={() => handleRedirect("browse jobs")} className="navbar-button">
                    {browseButtonText}
                </button>
            </div>
        </span>
    </div>
  )
}

export default Navbar
