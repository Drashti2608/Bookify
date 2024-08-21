import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Logo } from "../assets";
import { AccountContext } from "./Account";
import AudioPlayer from "./ListenBook";

const BookCard = ({
  book,
  isLoggedIn,
  onLikeUpdate,
  onGenerateAudio,
  onDeleteBook,
  isMyBook,
}) => {
  const [likes, setLikes] = useState(book.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  const { getSession } = useContext(AccountContext);

  useEffect(() => {
    const checkIfLiked = async () => {
      if (isLoggedIn) {
        try {
          const session = await getSession();
          const userEmail = session.email;
          setIsLiked(book.likedUsers?.includes(userEmail) || false);
        } catch (error) {
          console.error("Failed to get session:", error);
        }
      }
    };
    checkIfLiked();
  }, [book, getSession, isLoggedIn]);

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    if (isLikeProcessing || !isLoggedIn) return;

    setIsLikeProcessing(true);

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes((prevLikes) => (newIsLiked ? prevLikes + 1 : prevLikes - 1));

    try {
      const session = await getSession();
      const token = session.idToken.jwtToken; // Get the ID token
      const userEmail = session.email;

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/likebook`,
        { bookId: book.book_id, userEmail: userEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.likes !== undefined) {
        setLikes(response.data.likes);
        if (onLikeUpdate) {
          onLikeUpdate(book.book_id, response.data.likes);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(!newIsLiked);
      setLikes((prevLikes) => (newIsLiked ? prevLikes - 1 : prevLikes + 1));
      alert("Failed to update like status. Please try again later.");
    } finally {
      setIsLikeProcessing(false);
    }
  };

  const handleListen = async (e) => {
    e.stopPropagation();
    try {
      let headers = {};
      if (isLoggedIn) {
        const session = await getSession();
        const token = session.idToken.jwtToken;
        headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/getAudioUrl`,
        {
          params: {
            bookId: book.book_id,
            userEmail: book.userEmail,
          },
          headers: headers,
        }
      );

      if (response.status === 200 && response.data.audioUrl) {
        setAudioUrl(response.data.audioUrl);
        setShowAudioPlayer(true);
      } else {
        alert("Audio not available for this book. It may still be processing.");
      }
    } catch (error) {
      console.error("Error with audio:", error);
      if (error.response && error.response.status === 404) {
        alert(
          "Audio not found for this book or It may not have been generated yet."
        );
      } else {
        alert("Error accessing audio. Please try again later.");
      }
    }
  };

  const handleGenerateAudio = (e) => {
    e.stopPropagation();
    onGenerateAudio();
  };

  const handleDeleteBook = (e) => {
    e.stopPropagation();
    onDeleteBook();
  };

  const handleBookClick = () => {
    window.open(book.pdfUrl, "_blank");
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = Logo; // Replace with a path to a default image
  };

  return (
    <>
      <div
        className="w-64 h-96 m-4 rounded-lg overflow-hidden shadow-lg cursor-pointer flex flex-col transform transition-transform duration-300 ease-in-out hover:shadow-xl hover:scale-105"
        onClick={handleBookClick}
      >
        <div className="h-48 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={book.coverUrl}
            alt={book.bookName}
            onError={handleImageError}
          />
        </div>
        <div className="px-4 py-4 flex-grow">
          <div className="font-bold text-lg mb-2 line-clamp-2">
            {book.bookName}
          </div>
          <p className="text-gray-700 text-sm mb-1">By: {book.authorName}</p>
          <p className="text-gray-700 text-sm">Genre: {book.genre}</p>
        </div>
        <div className="px-4 pb-4 flex justify-between items-center">
          {isMyBook ? (
            <>
              <button
                onClick={handleGenerateAudio}
                className="button font-bold text-sm"
              >
                Generate Audio
              </button>

              <button
                onClick={handleDeleteBook}
                className="login-button font-bold text-sm"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleListen}
                className="button font-bold rounded text-sm"
              >
                Listen
              </button>
              {isLoggedIn && (
                <button
                  onClick={handleLikeToggle}
                  className={`bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded text-sm flex items-center ${
                    isLiked ? "text-red-500" : ""
                  }`}
                  disabled={isLikeProcessing}
                >
                  <span className="mr-1">❤️</span> {likes}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {showAudioPlayer && audioUrl && (
        <AudioPlayer
          audioUrl={audioUrl}
          coverUrl={book.coverUrl}
          bookTitle={book.bookName}
          authorName={book.authorName}
          onClose={() => setShowAudioPlayer(false)}
        />
      )}
    </>
  );
};

export default BookCard;
