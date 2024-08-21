import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AccountContext } from "./Account";
import BookCard from "./BookCard";

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getSession } = useContext(AccountContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const session = await getSession();
        const token = session.idToken.jwtToken;
        const userEmail = session.email;
        setIsLoggedIn(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/mybooks?email=${userEmail}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [getSession]);

  const handleGenerateAudio = async (bookId) => {
    try {
      const session = await getSession();
      const token = session.idToken.jwtToken; // Get the ID token
      const userEmail = session.email;

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/generateAudio`,
        { bookId, userEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "Process started") {
        toast.info("Audio generation initiated.", { autoClose: 3000 });
      } else if (response.data.message === "Audio already exists") {
        alert("Audio for this book already exists");
      } else {
        toast.error("Failed to start audio generation process", {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      toast.error("Failed to generate audio. Please try again later.", {
        autoClose: 3000,
      });
    }
  };

const handleDeleteBook = async (bookId) => {
  if (window.confirm("Are you sure you want to delete this book?")) {
    try {
      const session = await getSession();
      const token = session.idToken.jwtToken; // Get the ID token
      const userEmail = session.email;

      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/deletebook`,
        {
          data: { bookId, userEmail },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBooks(books.filter((book) => book.book_id !== bookId));
      toast.success("Book deleted successfully", {
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book. Please try again later.", {
        autoClose: 3000,
      });
    }
  }
};

  if (loading) {
    return <div className="mt-4 text-3xl text-center">Loading Your Books...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold m-4 text-center">My Books</h1>
      {books.length === 0 ? (
        <div className="text-center">
          <p className="text-2xl font-semibold m-4 text-center">
            No books added
          </p>
          <Link to="/addbook" className="button mt-2 inline-block font-bold">
            Add Book
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => (
            <BookCard
              key={book.book_id}
              book={book}
              isLoggedIn={isLoggedIn}
              onGenerateAudio={() => handleGenerateAudio(book.book_id)}
              onDeleteBook={() => handleDeleteBook(book.book_id)}
              isMyBook={true}
            />
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default MyBooks;
