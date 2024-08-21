const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ message: "CORS preflight response" }),
    };
  }

  const { bookId, userEmail } = JSON.parse(event.body);

  try {
    // Get the current book data
    const getBookParams = {
      TableName: "BooksMetadata",
      Key: { book_id: bookId },
    };
    const bookData = await dynamodb.get(getBookParams).promise();

    if (!bookData.Item) {
      return {
        statusCode: 404,
        headers: headers,
        body: JSON.stringify({ error: "Book not found" }),
      };
    }

    // Check if the user has already liked the book
    const likedUsers = bookData.Item.likedUsers || [];
    const userIndex = likedUsers.indexOf(userEmail);
    const isLiking = userIndex === -1;

    let updateParams;

    if (isLiking) {
      // User is liking the book
      updateParams = {
        TableName: "BooksMetadata",
        Key: { book_id: bookId },
        UpdateExpression:
          "SET likes = if_not_exists(likes, :zero) + :inc, likedUsers = list_append(if_not_exists(likedUsers, :emptyList), :user)",
        ExpressionAttributeValues: {
          ":inc": 1,
          ":zero": 0,
          ":user": [userEmail],
          ":emptyList": [],
        },
        ReturnValues: "UPDATED_NEW",
      };
    } else {
      // User is unliking the book
      updateParams = {
        TableName: "BooksMetadata",
        Key: { book_id: bookId },
        UpdateExpression:
          "SET likes = likes - :dec, likedUsers = :newLikedUsers",
        ExpressionAttributeValues: {
          ":dec": 1,
          ":newLikedUsers": likedUsers.filter((email) => email !== userEmail),
          ":zero": 0,
        },
        ConditionExpression: "likes > :zero",
        ReturnValues: "UPDATED_NEW",
      };
    }

    const result = await dynamodb.update(updateParams).promise();

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ likes: result.Attributes.likes }),
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: "Failed to update book likes" }),
    };
  }
};
