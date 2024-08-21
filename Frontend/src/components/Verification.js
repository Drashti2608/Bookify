import { CognitoUser } from "amazon-cognito-identity-js";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserPool from "../UserPool";

const Verification = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      // Redirect to 404 page if email is not available
      navigate("/404", { replace: true });
    }
  }, [location.state, navigate]);

  const onSubmit = (event) => {
    event.preventDefault();
    if (!email) return;

    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });

    user.confirmRegistration(verificationCode, true, (err, result) => {
      if (err) {
        console.error("Verification failed", err);
      } else {
        console.log("Verification successful", result);
        toast.success("Email verified Successfully!");
        navigate("/login");
      }
    });
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col justify-start items-center bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Verify your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="verificationCode" className="sr-only">
                Verification Code
              </label>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Verification Code"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="button w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Verification;
