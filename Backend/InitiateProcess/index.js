const AWS = require("aws-sdk");
const stepfunctions = new AWS.StepFunctions();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const { userEmail, bookId } = JSON.parse(event.body);
  const stateMachineArn = process.env.STEP_FUNCTION_ARN;

  // Check if audio file already exists
  const s3Params = {
    Bucket: "my-books-bucket", // Replace with your actual bucket name
    Key: `${userEmail}/${bookId}/book.mp3`, // Adjust the path as necessary
  };

  try {
    // Check if the audio file exists
    await s3.headObject(s3Params).promise();

    // If we reach here, the audio file exists
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({ message: "Audio already exists" }),
    };
  } catch (error) {
    if (error.code === "NotFound") {
      // Audio doesn't exist, proceed with generation
      const params = {
        stateMachineArn: stateMachineArn,
        input: JSON.stringify({ userEmail, bookId }),
      };

      try {
        await stepfunctions.startExecution(params).promise();
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          },
          body: JSON.stringify({ message: "Process started" }),
        };
      } catch (error) {
        console.error(error);
        return {
          statusCode: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          },
          body: JSON.stringify({ message: "Error starting process" }),
        };
      }
    } else {
      // Some other error occurred
      console.error(error);
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: JSON.stringify({ message: "Error checking audio existence" }),
      };
    }
  }
};
