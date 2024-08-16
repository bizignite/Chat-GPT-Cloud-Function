# OpenAI Assistants API Firebase Cloud Function

## Overview

This Firebase Cloud Function (`kolaGpt`) is designed to interact with OpenAI's API, enabling conversations with an AI assistant. The function manages the creation of conversation threads, sends user messages, and retrieves the AI's responses. Secrets, such as API keys and assistant IDs, are securely stored and accessed via Google Cloud's Secret Manager.

## Features

- **Secure Secret Management:** Utilizes Google Cloud's Secret Manager to securely handle the OpenAI API key and assistant ID.
- **Thread Management:** Handles both the creation of new threads and the continuation of existing ones based on the provided thread ID.
- **Message Handling:** Posts user messages to the AI assistant and manages the AI's response retrieval process.
- **Retry Mechanism:** Implements a retry mechanism to ensure the AI's response is retrieved even if it takes multiple attempts.
- **Error Handling:** Includes comprehensive error handling to ensure smooth operation and proper logging.

## Prerequisites

Before deploying and running this Cloud Function, ensure the following:

- **Firebase Project:** You must have an active Firebase project.
- **Google Cloud Secret Manager:** The OpenAI API key and assistant ID must be stored in the Google Cloud Secret Manager under the following names:
  - `projects/<project-id>/secrets/openAiKeyKola/versions/latest`
  - `projects/<project-id>/secrets/assistantKola/versions/latest`
- **OpenAI Account:** An active OpenAI account with access to the Assistant API.

## Deployment

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies:**
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Deploy the Function:**
   Deploy the Cloud Function to Firebase:
   ```bash
   firebase deploy --only functions:kolaGpt
   ```

## Usage

The function expects an HTTP POST request with the following JSON structure:

```json
{
  "threadId": "<optional-existing-thread-id>",
  "userMessage": "<your-message-here>"
}
```

### Response

The function responds with the AI's reply in JSON format.

- **Success:** Returns the AI's response with a `200` status.
- **Error:** Returns an error message with a `500` status if something goes wrong during the process.

## Error Handling

The function includes error logging for issues related to:

- Secret retrieval from Google Cloud Secret Manager.
- Thread creation or continuation.
- Message posting.
- Run creation and retrieval.
- AI response retrieval.

These errors are logged to Firebase, and a `500` status is returned with a descriptive error message.

## Configuration

Ensure that the secrets are correctly configured in Google Cloud Secret Manager. The names and paths should match those used in the function.

## Contributing

To contribute, fork the repository and submit a pull request. Ensure your code is well-documented and follows the existing coding standards.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

This README provides a basic understanding of how to use and deploy the `kolaGpt` Firebase Cloud Function. For further assistance, please consult the Firebase and OpenAI documentation.
