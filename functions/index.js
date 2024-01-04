// Import necessary modules
const functions = require("firebase-functions");
const {SecretManagerServiceClient} = require("@google-cloud/secret-manager");
const axios = require("axios");

// Define the Cloud Function
exports.kolaGpt = functions.https.onRequest(async (req, res) => {
  try {
    // Create a new Secret Manager client
    const client = new SecretManagerServiceClient();

    // Retrieve the OpenAI key and assistant ID from Secret Manager
    const [openaiKey] = await client.accessSecretVersion({
      name: "projects/tiao-gpt/secrets/openAiKeyKola/versions/latest",
    });
    const [assistantId] = await client.accessSecretVersion({
      name: "projects/tiao-gpt/secrets/assistantKola/versions/latest",
    });

    // Extract the thread ID and user message from the request body
    const threadId = req.body.threadId;
    const userMessage = req.body.userMessage;

    let thread;
    // If there's no thread ID, create a new thread
    if (!threadId) {
      try {
        thread = await axios.post("https://api.openai.com/v1/threads", {}, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${
              openaiKey.payload.data.toString("utf8")}`,
            "OpenAI-Beta": "assistants=v1",
          },
        });
      } catch (error) {
        console.error(`Error in thread creation: ${
          error.response.status}
          ${error.response.statusText}`);
        throw error;
      }
    } else {
      // If there's a thread ID, use it
      thread = {data: {id: threadId}};
    }

    // Post the user's message to the thread
    try {
      await axios.post(`https://api.openai.com/v1/threads/${thread.data.id}/messages`, {
        role: "user",
        content: userMessage,
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey.payload.data.toString("utf8")}`,
          "OpenAI-Beta": "assistants=v1",
        },
      });
    } catch (error) {
      console.error("Error in message posting:", error);
      throw error;
    }

    // Create a new run with the assistant
    let run;
    try {
      run = await axios.post(`https://api.openai.com/v1/threads/${thread.data.id}/runs`, {
        assistant_id: assistantId.payload.data.toString("utf8"),
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey.payload.data.toString("utf8")}`,
          "OpenAI-Beta": "assistants=v1",
        },
      });
    } catch (error) {
      console.error("Error in run creation:", error);
      throw error;
    }

    // Retrieve the run until it's completed
    let retrieveRun;
    let retries = 0;
    const maxRetries = 1000; // Maximum number of retries
    do {
      try {
        retrieveRun = await axios.get(`https://api.openai.com/v1/threads/${
          thread.data.id}/runs/${
          run.data.id}`, {
          headers: {
            "Authorization": `Bearer ${
              openaiKey.payload.data.toString("utf8")}`,
            "OpenAI-Beta": "assistants=v1",
          },
        });
      } catch (error) {
        console.error("Error in run retrieval:", error);
        throw error;
      }
      retries++;
    } while (retrieveRun.data.status !== "completed" && retries < maxRetries);

    // If the maximum number of retries is exceeded, log an error
    if (retries === maxRetries) {
      console.error("Max retries exceeded");
    }

    // Retrieve the AI's reply
    let aiReply;
    try {
      aiReply = await axios.get(`https://api.openai.com/v1/threads/${thread.data.id}/messages`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey.payload.data.toString("utf8")}`,
          "OpenAI-Beta": "assistants=v1",
        },
      });
    } catch (error) {
      console.error("Error in reply retrieval:", error);
      throw error;
    }

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
