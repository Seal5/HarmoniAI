export async function geminiChat({ messages }: { messages: { role: string; content: string }[] }) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json();
  console.log("📩 AI Backend Response:", data);

  if (!response.ok) {
    throw new Error("Failed to get response from AI backend");
  }

  if (!data.reply) {
    throw new Error("No AI reply received from backend");
  }

  return data;
}
