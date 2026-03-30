// brings in the express framework so we can create a web server
import express from 'express';

// brings in dotenv so we can read our .env file
import dotenv from 'dotenv';

// dotenv loads our .env file so process.env variables are available throughout the app
dotenv.config();

// creates our express application instance
const app = express();

// uses the PORT env variable if set, otherwise defaults to 3001
const PORT = process.env.PORT || 3001;

// tells express to automatically parse incoming JSON request bodies
app.use(express.json());

// registers a GET endpoint at /health that returns a simple json response
// used to check the server is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// starts the server and tells it to listen for incoming requests on our port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
