// Import necessary modules
import OpenAI from "openai";
const openai = new OpenAI();

// Define the Cloud Function
exports.kolaGpt = functions.https.onRequest(async (req, res) => {
  try {
    // Extract the thread ID and user message from the request body
    const threadId = req.body.threadId;
    const userMessage = req.body.userMessage;

    let thread;
    // If there's no thread ID, create a new thread
    if (!threadId) {
      thread = await openai.beta.threads.create();
    } else {
      // If there's a thread ID, use it
      thread = {data: {id: threadId}};
    }

    // Post the user's message to the thread
    await openai.beta.threads.messages.create(thread.data.id, {
      role: "user",
      content: userMessage,
    });

    // Create a new run with the assistant
    let run = await openai.beta.threads.runs.create(thread.data.id, {
      assistant_id: "asst_abc123",
    });

    // Retrieve the run until it's completed
    let retrieveRun;
    let retries = 0;
    const maxRetries = 1000; // Maximum number of retries
    do {
      retrieveRun = await openai.beta.threads.runs.retrieve(thread.data.id, run.data.id);
      retries++;
    } while (retrieveRun.data.status !== "completed" && retries < maxRetries);

    // If the maximum number of retries is exceeded, log an error
    if (retries === maxRetries) {
      console.error("Max retries exceeded");
    }

    // Retrieve the AI's reply
    let aiReply = await openai.beta.threads.messages.list(thread.data.id);

    // Send the AI's reply as the response
    res.status(200).send(aiReply.data);
  } catch (error) {
    // If there's an error in the function, log it and send a 500 response
    console.error(`Error in function: ${error.message}`);
    res.status(500).send({
      error: `Something went wrong: ${error.message}`,
    });
  }
});
