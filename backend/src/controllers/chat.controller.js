const {
  askCandidate,
  streamCandidate,
} = require("../services/ai.service");

let resumeData = null;

function setResumeData(data) {
  resumeData = data;
}

async function chat(req, res, next) {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    if (!resumeData) {
      return res.status(500).json({
        success: false,
        message: "Resume is not loaded yet.",
      });
    }

    const answer = await askCandidate(question, resumeData);

    res.status(200).json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    console.error("CHAT CONTROLLER ERROR:", error);
    next(error);
  }
}

async function streamChat(req, res, next) {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    if (!resumeData) {
      return res.status(500).json({
        success: false,
        message: "Resume is not loaded yet.",
      });
    }

    console.log("STREAM REQUEST:", question);

    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await streamCandidate(
      question,
      resumeData,
      (chunk) => {
        res.write(chunk);
      }
    );

    res.end();
  } catch (error) {
    console.error("STREAM CONTROLLER ERROR:", error);

    if (!res.headersSent) {
      next(error);
    } else {
      res.end();
    }
  }
}

module.exports = {
  chat,
  setResumeData,
  streamChat,
};