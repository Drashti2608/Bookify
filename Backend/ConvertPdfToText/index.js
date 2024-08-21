const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const pdf = require("pdf-parse");

const CHUNK_SIZE = 3000;

exports.handler = async (event) => {
  const { userEmail, bookId } = event;
  const pdfKey = `${userEmail}/${bookId}/book.pdf`;
  const textKey = `${userEmail}/${bookId}/book.txt`;

  try {
    const pdfData = await s3
      .getObject({ Bucket: "my-books-bucket", Key: pdfKey })
      .promise();

    const data = await pdf(pdfData.Body);
    const fullText = data.text;

    const textChunks = splitTextIntoChunks(fullText, CHUNK_SIZE);
    const finalText = textChunks.join("\n--- CHUNK BREAK ---\n");

    await s3
      .putObject({
        Bucket: "my-books-bucket",
        Key: textKey,
        Body: finalText,
        ContentType: "text/plain",
      })
      .promise();

    return { userEmail, bookId, textKey };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to convert PDF to text");
  }
};

function splitTextIntoChunks(text, chunkSize) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}
