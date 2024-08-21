import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { AccountContext } from "./Account";
import BookCard from "./BookCard";

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const { getSession } = useContext(AccountContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/books`
        );
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    const checkLoginStatus = async () => {
      try {
        const session = await getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    fetchBooks();
    checkLoginStatus();
  }, [getSession]);

  if (loading) {
    return <div className="mt-4 text-3xl text-center">Loading Books...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto m-6 px-4 sm:px-6 lg:px-8">
      {books.length === 0 ? (
        <div className="text-center">
          <p className="text-2xl font-semibold m-4 text-center">
            Nothing to Show...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => (
            <BookCard key={book.book_id} book={book} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BooksList;