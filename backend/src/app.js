
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
  "http://localhost:5174",
  "https://hireme-ai-eight.vercel.app",
  "https://hire-me-ai.vercel.app",
  "https://hireme-9w5dt2j8k-mdrehan096s-projects.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header, such as curl.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("CORS BLOCKED:", origin);
    return callback(new Error("Not allowed by CORS"));
  },

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,
};

app.use(cors(corsOptions));

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
