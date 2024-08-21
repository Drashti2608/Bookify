import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { AccountContext } from "./Account";
import BookCard from "./BookCard";

const FavoriteBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getSession } = useContext(AccountContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchFavoriteBooks = async () => {
      try {
        const session = await getSession();
        const token = session.idToken.jwtToken; // Get the ID token
        const userEmail = session.idToken.payload.email;
        setIsLoggedIn(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/favouritebooks?email=${userEmail}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching favorite books:", error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteBooks();
  }, [getSession]);

  const handleLikeUpdate = (bookId, newLikes) => {
    setBooks(
      books.map((book) =>
        book.book_id === bookId ? { ...book, likes: newLikes } : book
      )
    );
  };

  if (loading) {
    return <div className="mt-4 text-3xl text-center">Loading Your Favourites...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold m-4 text-center">My Favourite Books</h1>
      {books.length === 0 ? (
        <div className="text-center">
          <p className="text-2xl font-semibold m-4 text-center">
            You haven't liked any books yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => (
            <BookCard
              key={book.book_id}
              book={book}
              isLoggedIn={isLoggedIn}
              onLikeUpdate={handleLikeUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteBooks;
