const dialogflow = require('@google-cloud/dialogflow');

const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const projectId = process.env.DIALOGFLOW_PROJECT_ID;

module.exports = { sessionClient, projectId };