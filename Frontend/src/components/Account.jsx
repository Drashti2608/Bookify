import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import React, { createContext } from "react";
import { useNavigate } from "react-router-dom";
import Pool from "../UserPool";

const AccountContext = createContext();

const Account = (props) => {
  const navigate = useNavigate();
  const getSession = async () => {
    return await new Promise((resolve, reject) => {
      const user = Pool.getCurrentUser();
      if (user) {
        user.getSession(async (error, session) => {
          if (error) {
            reject();
          } else {
            const attributes = await new Promise((resolve, reject) => {
              user.getUserAttributes((error, attributes) => {
                if (error) {
                  reject(error);
                } else {
                  const results = {};

                  for (let attribute of attributes) {
                    const { Name, Value } = attribute;
                    results[Name] = Value;
                  }
                  resolve(results);
                }
              });
            });
            resolve({ user, ...session, ...attributes });
          }
        });
      } else {
        reject();
      }
    });
  };

  const authenticate = async (Username, Password) => {
    return await new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username, Pool });
      const authDetails = new AuthenticationDetails({ Username, Password });

      user.authenticateUser(authDetails, {
        onSuccess: (data) => {
          console.log("onSuccess: ", data);
          resolve(data);
        },
        onFailure: (error) => {
          console.error("onFailure: ", error);
          let errorMessage =
            "An unexpected error occurred. Please try again later.";
          if (error.code === "NotAuthorizedException") {
            errorMessage = "Incorrect password. Please try again.";
          } else if (error.code === "UserNotFoundException") {
            errorMessage = "Email does not exist. Please check your email.";
          } else if (error.code === "InvalidParameterException") {
            errorMessage = "Invalid parameters. Please check your input.";
          }
          reject(new Error(errorMessage));
        },
        newPasswordRequired: (data) => {
          console.log("newPasswordRequired: ", data);
          resolve(data);
        },
      });
    });
  };


  const confirmRegistration = async (Username, Code) => {
    return await new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username, Pool });
      user.confirmRegistration(Code, true, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  };

  const signOut = () => {
    const user = Pool.getCurrentUser();
    if (user) {
      if (window.confirm("Are you sure you want to sign out?")) {
        user.signOut();
        sessionStorage.removeItem("previousLocation");
        navigate("/");
      }
    }
  };

  return (
    <AccountContext.Provider
      value={{ authenticate, getSession, confirmRegistration, signOut }}
    >
      {props.children}
    </AccountContext.Provider>
  );
};

export { Account, AccountContext };
