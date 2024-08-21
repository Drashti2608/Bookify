const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const { bookId, userEmail } = event.queryStringParameters;
  const bucketName = "my-books-bucket";
  const key = `${userEmail}/${bookId}/book.mp3`;

  try {
    // Check if the object exists in S3
    await s3.headObject({ Bucket: bucketName, Key: key }).promise();

    // If it exists, generate a signed URL that's valid for 1 hour
    const audioUrl = s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: key,
      Expires: 3600,
    });

    // Return the signed URL
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({ audioUrl }),
    };
  } catch (error) {
    // If the file doesn't exist, return a 404 error
    if (error.code === "NotFound") {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: JSON.stringify({ message: "Audio not found for this book" }),
      };
    }
    // For any other error, return a 500 error
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
