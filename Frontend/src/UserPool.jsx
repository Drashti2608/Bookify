import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  // UserPoolId: "us-east-1_Y9cvdJjrU",
  // ClientId: "161jh87hkn9aku39gea7v31g65",
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
};

export default new CognitoUserPool(poolData);