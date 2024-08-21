import axios from "axios";
import React, { useContext, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AccountContext } from "./Account";

const AddBook = () => {
  const [bookName, setBookName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [genre, setGenre] = useState("");
  const [bookPdf, setBookPdf] = useState(null);
  const [bookCover, setBookCover] = useState(null);
  const [generateAudio, setGenerateAudio] = useState(false); // New state for audio generation checkbox
  const [formKey, setFormKey] = useState(Date.now());

  const { getSession } = useContext(AccountContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const session = await getSession();
      const token = session.idToken.jwtToken;
      const userEmail = session.email;

      const bookPdfBase64 = await fileToBase64(bookPdf);
      const bookCoverBase64 = await fileToBase64(bookCover);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/books`,
        {
          userEmail,
          bookName,
          authorName,
          genre,
          bookPdf: bookPdfBase64,
          bookCover: bookCoverBase64,
          generateAudio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Book added:", response.data);
      toast.success("Book added successfully!", { autoClose: 3000 });

      // If generateAudio is true, initiate the audio generation process
      if (generateAudio) {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/generateAudio`,
          {
            userEmail,
            bookId: response.data.book_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.info("Audio generation initiated.", { autoClose: 3000 });
      }

      resetForm();
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Error adding book!", { autoClose: 3000 });
    }
  };

  const resetForm = () => {
    setBookName("");
    setAuthorName("");
    setGenre("");
    setBookPdf(null);
    setBookCover(null);
    setGenerateAudio(false); // Reset the audio generation checkbox
    setFormKey(Date.now());
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className=" text-center text-3xl font-bold text-gray-900">
            Add Book
          </h2>
        </div>
        <form
          key={formKey}
          onSubmit={handleSubmit}
          className="max-w-md mx-auto mt-8"
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label>Book name</label>
              <input
                type="text"
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                placeholder="Book Name"
                className="w-full p-2 mb-4 border rounded"
              />
            </div>
            <div>
              <label>Author name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Author Name"
                className="w-full p-2 mb-4 border rounded"
              />
            </div>
            <div>
              <label>Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Genre"
                className="w-full p-2 mb-4 border rounded"
              />
            </div>
            <div>
              <label>Book Pdf</label>
              <input
                type="file"
                onChange={(e) => setBookPdf(e.target.files[0])}
                accept=".pdf"
                className="w-full p-2 mb-4 border rounded"
              />
            </div>
            <div>
              <label>Book Cover</label>
              <input
                type="file"
                onChange={(e) => setBookCover(e.target.files[0])}
                accept="image/*"
                className="w-full p-2 mb-4 border rounded"
              />
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="generateAudio"
                checked={generateAudio}
                onChange={(e) => setGenerateAudio(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="generateAudio">
                Generate audio for this book
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="button w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white"
            >
              Add Book
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddBook;
