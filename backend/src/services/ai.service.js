const groq = require("../config/ai");

const recruiterPrompt = require("../prompts/recruiter.prompt");
const resumeParserPrompt = require("../prompts/resume-parser.prompt");

const MODEL = "llama-3.1-8b-instant";

async function parseResume(resumeText) {
  try {
    if (!resumeText || !resumeText.trim()) {
      throw new Error("Resume text is empty.");
    }

    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0,
      max_tokens: 1000,

      messages: [
        {
          role: "system",
          content: resumeParserPrompt,
        },
        {
          role: "user",
          content: `
Here is the resume:

---------------- RESUME ----------------

${resumeText}

-------------- END RESUME --------------
`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response received from Groq.");
    }

    const cleanedContent = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error("Resume Parsing Error:", error);

    throw error;
  }
}

async function askCandidate(question, resumeData) {
  try {
    if (!question || !question.trim()) {
      throw new Error("Question is required.");
    }

    if (!resumeData) {
      throw new Error("Resume data is not available.");
    }

    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 500,

      messages: [
        {
          role: "system",
          content: recruiterPrompt,
        },
        {
          role: "user",
          content: `
Here is my resume information:

---------------- RESUME ----------------

${JSON.stringify(resumeData, null, 2)}

-------------- END RESUME --------------

Recruiter's Question:

${question}
`,
        },
      ],
    });

    const answer = response.choices[0]?.message?.content;

    if (!answer) {
      throw new Error("No answer received from Groq.");
    }

    return answer.trim();
  } catch (error) {
    console.error("Chat Error:", error);

    throw error;
  }
}

async function streamCandidate(question, resumeData, onChunk) {
  try {
    if (!question || !question.trim()) {
      throw new Error("Question is required.");
    }

    if (!resumeData) {
      throw new Error("Resume data is not available.");
    }

    console.log("Sending question to Groq:", question);

    const stream = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 500,
      stream: true,

      messages: [
        {
          role: "system",
          content: recruiterPrompt,
        },
        {
          role: "user",
          content: `
Here is my resume information:

---------------- RESUME ----------------

${JSON.stringify(resumeData, null, 2)}

-------------- END RESUME --------------

Recruiter's Question:

${question}
`,
        },
      ],
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;

      if (content) {
        console.log("GROQ CHUNK:", JSON.stringify(content));
        onChunk(content);
      }
    }
  } catch (error) {
    console.error("Streaming Chat Error:", error);
    throw error;
  }
}

module.exports = {
  parseResume,
  askCandidate,
  streamCandidate,
};