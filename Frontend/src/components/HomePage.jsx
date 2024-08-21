import React, { useContext, useEffect, useState } from "react";
import { AccountContext } from "./Account"; // Import the AccountContext
import BooksList from "./GetBooks"; // Import the BooksList component
import "../styles.css";

const HomePage = () => {
  const { getSession } = useContext(AccountContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const session = await getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, [getSession]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <BooksList />
    </div>
  );
};

export default HomePage;
