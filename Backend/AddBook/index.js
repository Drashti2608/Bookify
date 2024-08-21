const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
  };
  function generateUserId() {
    return Math.random().toString(36).substring(2, 10);
  }

  const body = JSON.parse(event.body);

  const userEmail = body.userEmail;
  const bookName = body.bookName;
  const authorName = body.authorName;
  const genre = body.genre;
  const bookPdfBase64 = body.bookPdf;
  const bookCoverBase64 = body.bookCover;

  const bookId = generateUserId();

  // Save PDF to S3
  const pdfKey = `${userEmail}/${bookId}/book.pdf`;
  await s3
    .putObject({
      Bucket: "my-books-bucket",
      Key: pdfKey,
      Body: Buffer.from(bookPdfBase64, "base64"),
      ContentType: "application/pdf",
    })
    .promise();

  // Save cover image to S3
  const coverKey = `${userEmail}/${bookId}/cover.jpg`;
  await s3
    .putObject({
      Bucket: "my-books-bucket",
      Key: coverKey,
      Body: Buffer.from(bookCoverBase64, "base64"),
      ContentType: "image/jpeg",
    })
    .promise();

  // Save metadata to DynamoDB
  try {
    await dynamodb
      .put({
        TableName: "BooksMetadata",
        Item: {
          book_id: bookId,
          userEmail: userEmail,
          bookName: bookName,
          authorName: authorName,
          genre: genre,
          likes: 0,
        },
      })
      .promise();
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: "Failed to save to DynamoDB" }),
    };
  }
  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify({
      message: "Book added successfully",
      book_id: bookId,
    }),
  };
};
