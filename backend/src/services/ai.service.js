const groq = require("../config/ai");

const recruiterPrompt = require("../prompts/recruiter.prompt");
const resumeParserPrompt = require("../prompts/resume-parser.prompt");

const MODEL = "openai/gpt-oss-20b";


async function parseResume(resumeText) {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty.");
  }

  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0,
    max_tokens: 2000,
    response_format: {
      type: "json_object"
    },
    messages: [
      {
        role: "system",
        content: resumeParserPrompt +
          "\nReturn one valid JSON object with exactly the specified keys. " +
          "All string values must be valid JSON strings. Do not include markdown."
      },
      {
        role: "user",
        content: `Parse this resume into the required JSON structure:\n\n${resumeText}`
      }
    ]
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response received from Groq.");
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    console.error("Invalid JSON returned by Groq:", content);
    throw new Error("Groq returned invalid resume JSON.");
  }

  const requiredKeys = [
    "name",
    "summary",
    "education",
    "skills",
    "technicalSkills",
    "projects",
    "experience",
    "certifications",
    "strengths"
  ];

  for (const key of requiredKeys) {
    if (!(key in parsed)) {
      parsed[key] = ["education", "skills", "technicalSkills",
        "projects", "experience", "certifications", "strengths"
      ].includes(key) ? [] : "";
    }
  }

  return parsed;
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