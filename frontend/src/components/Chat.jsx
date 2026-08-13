const handleSend = async (question) => {
  setLoading(true);

  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      content: question,
    },
    {
      role: "assistant",
      content: "",
    },
  ]);

  try {
    await streamChat(question, (chunk) => {
      console.log("RECEIVED CHUNK:", chunk);

      setMessages((prev) => {
        const updated = [...prev];

        const lastIndex =
          updated.length - 1;

        updated[lastIndex] = {
          ...updated[lastIndex],
          content:
            updated[lastIndex].content +
            chunk,
        };

        return updated;
      });
    });
  } catch (error) {
    console.error(
      "🔥 CHAT ERROR:",
      error
    );

    setMessages((prev) => {
      const updated = [...prev];

      const lastIndex =
        updated.length - 1;

      updated[lastIndex] = {
        ...updated[lastIndex],
        content:
          `Error: ${error.message}`,
      };

      return updated;
    });
  } finally {
    setLoading(false);
  }
};