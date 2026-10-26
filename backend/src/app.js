
const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chat.routes");

const {
  notFound,
  errorHandler,
} = require("./middleware/error.middleware");

const app = express();

// Frontend URLs allowed to access this backend.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",

  // Production frontend
  "https://hireme-ai-eight.vercel.app",

  // Vercel deployment URLs
  "https://hireme-ai-git-main-mdrehan096s-projects.vercel.app",
  "https://hireme-9w5dt2j8k-mdrehan096s-projects.vercel.app",
  "https://hireme-k0v47dgyr-mdrehan096s-projects.vercel.app",

  // Other existing frontend URL
  "https://hire-me-ai.vercel.app",

  // Optional frontend URL configured in Render
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header, such as server-to-server requests.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,
};

// Register CORS before routes so preflight requests are handled.
app.use(cors(corsOptions));

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HireMe AI Backend Running",
  });
});

// Chat API
app.use("/api/v1/chat", chatRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
