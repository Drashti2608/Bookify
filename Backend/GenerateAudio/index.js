const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const polly = new AWS.Polly();

const CHUNK_SIZE = 1500; // Reduced chunk size
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

exports.handler = async (event, context) => {
  const { userEmail, bookId, textKey } = event;
  const audioKey = `${userEmail}/${bookId}/book.mp3`;
  const tempAudioKey = `${userEmail}/${bookId}/book_temp.mp3`;

  try {
    const textData = await s3
      .getObject({ Bucket: "my-books-bucket", Key: textKey })
      .promise();
    const text = textData.Body.toString("utf-8");

    const textChunks = splitTextIntoChunks(text, CHUNK_SIZE);
    const totalChunks = textChunks.length;

    let processedChunks = 0;
    let audioStreams = [];

    for (const chunk of textChunks) {
      const audioStream = await retryOperation(() => synthesizeSpeech(chunk));
      audioStreams.push(audioStream);
      processedChunks++;

      // Save progress every 10 chunks or at the end
      if (processedChunks % 10 === 0 || processedChunks === totalChunks) {
        const progressAudioBuffer = Buffer.concat(audioStreams);
        await appendAudioToS3(tempAudioKey, progressAudioBuffer);

        // Clear processed audio streams to free up memory
        audioStreams = [];
      }

      // Check remaining execution time
      const remainingTime = getRemainingExecutionTime(context);
      if (remainingTime < 60000) {
        // Less than 1 minute remaining
        throw new Error("Insufficient time to complete");
      }
    }

    // Merge all audio chunks into the final audio file
    const finalAudioBuffer = await mergeFinalAudio(tempAudioKey);

    await s3
      .putObject({
        Bucket: "my-books-bucket",
        Key: audioKey,
        Body: finalAudioBuffer,
        ContentType: "audio/mpeg",
      })
      .promise();

    // Clean up temporary files
    await s3
      .deleteObject({
        Bucket: "my-books-bucket",
        Key: tempAudioKey,
      })
      .promise();

    return { userEmail, bookId, audioKey };
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
};

// Function to split text into smaller chunks
function splitTextIntoChunks(text, chunkSize) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    // Ensure we don't split words
    while (end < text.length && text[end] !== " " && text[end] !== "\n") {
      end++;
    }
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

// Function to synthesize speech using Polly
async function synthesizeSpeech(text) {
  const pollyParams = {
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Joanna",
  };
  const result = await polly.synthesizeSpeech(pollyParams).promise();
  return result.AudioStream;
}

// Function to retry operations in case of failure
async function retryOperation(operation, retries = MAX_RETRIES) {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
}

// Function to append audio data to an existing file in S3
async function appendAudioToS3(key, audioBuffer) {
  const existingData = await s3
    .getObject({ Bucket: "my-books-bucket", Key: key })
    .promise()
    .catch(() => null); // Ignore error if file doesn't exist yet

  const newAudioBuffer = existingData
    ? Buffer.concat([existingData.Body, audioBuffer])
    : audioBuffer;

  await s3
    .putObject({
      Bucket: "my-books-bucket",
      Key: key,
      Body: newAudioBuffer,
      ContentType: "audio/mpeg",
    })
    .promise();
}

// Function to merge final audio from progress file
async function mergeFinalAudio(tempAudioKey) {
  const progressData = await s3
    .getObject({ Bucket: "my-books-bucket", Key: tempAudioKey })
    .promise();
  return progressData.Body;
}

// Function to get the remaining execution time
function getRemainingExecutionTime(context) {
  return context.getRemainingTimeInMillis();
}
