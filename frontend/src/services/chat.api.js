const API_URL =
  "https://hireme-ai-backend-u4a0.onrender.com/api/v1/chat/stream";

export async function streamChat(question, onChunk) {
  console.log(
    "Sending request to:",
    API_URL
  );

  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      question: question,
    }),
  });

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "Backend error:",
      response.status,
      errorText
    );

    throw new Error(
      `Server error ${response.status}: ${errorText}`
    );
  }

  if (!response.body) {
    throw new Error(
      "Streaming is not supported."
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder("utf-8");

  try {
    while (true) {
      const {
        value,
        done,
      } = await reader.read();

      if (done) {
        const remaining =
          decoder.decode();

        if (remaining) {
          onChunk(remaining);
        }

        break;
      }

      const chunk =
        decoder.decode(value, {
          stream: true,
        });

      if (chunk) {
        console.log(
          "RECEIVED CHUNK:",
          chunk
        );

        onChunk(chunk);
      }
    }
  } finally {
    reader.releaseLock();
  }
}