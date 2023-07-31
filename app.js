require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const { client } = require("./db/client");
const PORT = process.env.PORT || 3000;
// Setup your Middleware and API Router here
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.get('/health', async (req, res, next) => {
    res.status(200).json({ message: "Server is health!" })
});

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);Í
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  // On success, connect to the database
    await client.connect();
  try {
    console.log("Connected to the database");
  } catch (error) {
    console.error("Failed to connect to the database", error);
  }
});

module.exports = app;
