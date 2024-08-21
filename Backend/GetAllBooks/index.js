const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    // Fetch book metadata from DynamoDB
    const params = {
      TableName: "BooksMetadata",
    };
    const data = await dynamodb.scan(params).promise();

    // Generate pre-signed URLs for cover images and PDFs
    const booksWithUrls = await Promise.all(
      data.Items.map(async (book) => {
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
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(booksWithUrls),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ error: "Failed to fetch books" }),
    };
  }
};
