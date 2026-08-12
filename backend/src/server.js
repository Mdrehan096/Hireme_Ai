require("dotenv").config();

const path = require("path");

const app = require("./app");

const { readPDF } = require("./services/pdf.service");
const { parseResume } = require("./services/ai.service");
const { setResumeData } = require("./controllers/chat.controller");

const PORT = process.env.PORT || 8000;

const resumePath = path.join(__dirname, "../data/resume.pdf");

async function startServer() {
  try {
    console.log("Loading resume...");

    const resumeText = await readPDF(resumePath);

    console.log("Resume text extracted.");

    const resumeData = await parseResume(resumeText);

    setResumeData(resumeData);

    console.log("Resume parsed successfully.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();