import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../assets";
import { AccountContext } from "./Account";

const Navbar = () => {
  const [userRole, setUserRole] = useState(null);
  const { getSession, signOut } = useContext(AccountContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        setUserRole(session ? true : null);
      } catch (error) {
        setUserRole(null);
      }
    };

    checkSession();
  }, [getSession]);

  const handleSignInRedirect = () => {
    sessionStorage.setItem("previousLocation", location.pathname);
    navigate("/login");
  };

  return (
    <div className="flex h-20 w-full shrink-0 items-center px-4 md:px-6 bg-white border-b-2 border-gray shadow-lg">
      <Link to="/" className="flex items-center">
        <img
          src={Logo}
          alt="BookBuddy Logo"
          style={{ width: "75px", height: "75px" }}
        />
        <span
          className="text-2xl font-bold"
          style={{ color: "#195ea0", fontFamily: "'Lobster', cursive" }}
        >
          Bookify
        </span>
      </Link>
      <div className="ml-auto flex gap-2">
        {!userRole ? (
          <>
            {location.pathname !== "/login" && (
              <Link
                to="/login"
                onClick={handleSignInRedirect}
                className="login-button font-bold"
              >
                Log In
              </Link>
            )}
            {location.pathname !== "/signup" && (
              <Link to="/signup" className="button font-bold">
                Sign Up
              </Link>
            )}
          </>
        ) : (
          <>
            {location.pathname !== "/favoritebooks" && (
              <Link to="/favoritebooks" className="button font-bold">
                My Favourites
              </Link>
            )}
            {location.pathname !== "/mybooks" && (
              <Link to="/mybooks" className="button font-bold">
                My Books
              </Link>
            )}
            {location.pathname !== "/addbook" && (
              <Link to="/addbook" className="button font-bold">
                Add Book
              </Link>
            )}
            <button onClick={signOut} className="button font-bold">
              Sign Out
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;