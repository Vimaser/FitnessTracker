require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require("morgan");


//const PORT = 3034;
// Setup your Middleware and API Router here
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());


// Routes

app.use('/api/users', require('./api/users'));
app.use('/api/activities', require('./api/activities'));
app.use('/api/routines', require('./api/routines'));

app.get('/health', async (req, res, next) => {
    res.status(200).json({ message: "Server is healthy!" });
});

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
