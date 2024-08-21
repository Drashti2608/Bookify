const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ message: "CORS preflight response" }),
    };
  }

  const userEmail = event.queryStringParameters.email;

  try {
    // Scan the BooksMetadata table to find books liked by the user
    const params = {
      TableName: "BooksMetadata",
      FilterExpression: "contains(likedUsers, :userEmail)",
      ExpressionAttributeValues: {
        ":userEmail": userEmail,
      },
    };

    const result = await dynamodb.scan(params).promise();

    // Generate pre-signed URLs for cover images and PDFs
    const booksWithUrls = await Promise.all(
      result.Items.map(async (book) => {
        const coverKey = `${book.userEmail}/${book.book_id}/cover.jpg`;
        const pdfKey = `${book.userEmail}/${book.book_id}/book.pdf`;

        const coverUrl = await s3.getSignedUrlPromise("getObject", {
          Bucket: "my-books-bucket",
          Key: coverKey,
          Expires: 3600, // URL expires in 1 hour
        });

        const pdfUrl = await s3.getSignedUrlPromise("getObject", {
          Bucket: "my-books-bucket",
          Key: pdfKey,
          Expires: 3600, // URL expires in 1 hour
        });

        return {
          ...book,
          coverUrl,
          pdfUrl,
        };
      })
    );

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(booksWithUrls),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: "Failed to fetch liked books" }),
    };
  }
};
