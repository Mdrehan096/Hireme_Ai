
const groq = require("../config/ai");

const recruiterPrompt = require("../prompts/recruiter.prompt");
const resumeParserPrompt = require("../prompts/resume-parser.prompt");

const MODEL = "openai/gpt-oss-20b";

// Parse resume into structured JSON
async function parseResume(resumeText) {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty.");
  }

  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0,
    max_completion_tokens: 6000,
    reasoning_effort: "low",
    include_reasoning: false,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `${resumeParserPrompt}

Return one complete, valid JSON object.
Include all required keys:
"name", "summary", "education", "skills",
"technicalSkills", "projects", "experience",
"certifications", "strengths".

Use double quotes for keys and string values.
Use empty strings for missing text fields.
Use empty arrays for missing list fields.
Do not include Markdown or explanations.
Ensure the entire JSON object is complete.`,
      },
      {
        role: "user",
        content: `Parse this resume into the required JSON structure:\n\n${resumeText}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;

  console.log("Resume response length:", content?.length ?? 0);
  console.log("Finish reason:", response.choices[0]?.finish_reason);

  if (!content || !content.trim()) {
    throw new Error(
      "Groq returned an empty resume response. Check the finish reason above."
    );
  }

  let parsed;

  try {
    const cleaned = content
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");

    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("Invalid JSON returned by Groq:", content);
    throw new Error("Groq returned invalid resume JSON.");
  }

  const listKeys = [
    "education",
    "skills",
    "technicalSkills",
    "projects",
    "experience",
    "certifications",
    "strengths",
  ];

  const requiredKeys = ["name", "summary", ...listKeys];

  for (const key of requiredKeys) {
    if (!(key in parsed)) {
      parsed[key] = listKeys.includes(key) ? [] : "";
    }
  }

  console.log("Resume parsed successfully.");

  return parsed;
}

// Generate a normal, non-streaming answer
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
      max_completion_tokens: 1000,
      reasoning_effort: "low",
      include_reasoning: false,
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

    if (!answer || !answer.trim()) {
      throw new Error("No answer received from Groq.");
    }

    return answer.trim();
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
}

// Generate a streaming answer
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
      max_completion_tokens: 1000,
      reasoning_effort: "low",
      include_reasoning: false,
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
