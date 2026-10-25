require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { parseResume, askCandidate } = require("./services/aiService");
const { readPDF } = require("./services/pdfService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Resume location
const resumePath = path.join(__dirname, "Md_Rehan_Resume.pdf");

// Store parsed resume
let resumeData = null;

// Load resume when server starts
async function loadResume() {
  try {
    console.log("Loading Resume...");

    const resumeText = await readPDF(resumePath);

    resumeData = await parseResume(resumeText);

    console.log("Resume Loaded Successfully");
  } catch (error) {
    console.error("Resume Loading Failed:", error.message);
  }
}

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HireMe AI Backend Running",
  });
});

// Chat route
app.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: "Question is required",
      });
    }

    if (!resumeData) {
      return res.status(500).json({
        error: "Resume not loaded",
      });
    }

    const answer = await askCandidate(question, resumeData);

    res.json({
      answer,
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// Start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  await loadResume();
});
