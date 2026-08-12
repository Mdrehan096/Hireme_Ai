const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chat.routes");

const {
  notFound,
  errorHandler,
} = require("./middleware/error.middleware");

const app = express();

app.use(cors());

app.use(express.json());


// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HireMe AI Backend Running",
  });
});


// API routes
app.use("/api/v1/chat", chatRoutes);


// Error handling
app.use(notFound);

app.use(errorHandler);


module.exports = app;