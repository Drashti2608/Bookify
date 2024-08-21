import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AccountContext } from "./Account";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { authenticate } = useContext(AccountContext);

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(""); // Clear previous error message

    try {
      await authenticate(email, password);
      console.log("Logged in!");
      const previousLocation =
        sessionStorage.getItem("previousLocation") || "/";
      sessionStorage.removeItem("previousLocation");
      navigate(previousLocation);
    } catch (error) {
      console.error("Failed to Login", error);
      setErrorMessage(
        error.message || "An unexpected error occurred. Please try again later."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start items-center bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Log in to your account
          </h2>
        </div>
        {errorMessage && (
          <div className="text-red-500 text-center mb-4">{errorMessage}</div>
        )}
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="button w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white"
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
