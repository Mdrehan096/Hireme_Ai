const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chat.routes");

const {
  notFound,
  errorHandler,
} = require("./middleware/error.middleware");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://hireme-ai.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from Postman, curl, etc.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS BLOCKED:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

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