import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { Account } from "./components/Account";
import AddBook from "./components/AddBook";
import FavoriteBooks from "./components/FavouriteBooks";
import GetBooks from "./components/GetBooks";
import HomePage from "./components/HomePage";
import LogIn from "./components/LogIn";
import MyBooks from "./components/MyBooks";
import Navbar from "./components/Navbar";
import NotFound from "./components/PageNotFound";
import SignUp from "./components/SignUp";
import Verification from "./components/Verification";

function App() {
  return (
    <Router>
      <Account>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/addbook" element={<AddBook />} />
          <Route path="/getbooks" element={<GetBooks />} />
          <Route path="/mybooks" element={<MyBooks />} />
          <Route path="/favoritebooks" element={<FavoriteBooks />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Account>
    </Router>
  );
}

export default App;
