const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const bookId = event.queryStringParameters.bookId;

  const params = {
    TableName: "BookLikes",
    KeyConditionExpression: "book_id = :bookId",
    ExpressionAttributeValues: {
      ":bookId": bookId,
    },
  };

  try {
    const data = await docClient.query(params).promise();
    const users = data.Items.map((item) => ({ email: item.user_email }));
    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not fetch users" }),
    };
  }
};
