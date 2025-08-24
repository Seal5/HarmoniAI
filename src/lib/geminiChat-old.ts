export async function geminiChat({ messages }: { messages: { role: string; content: string }[] }) {
  console.log("✨ Frontend: Sending messages to API:", messages);
  
  // Validate messages before sending
  if (!messages || !Array.isArray(messages)) {
    throw new Error("Messages must be a valid array");
  }
  
  if (messages.length === 0) {
    throw new Error("Messages array cannot be empty");
  }
  
  const requestPayload = { messages };
  console.log("✨ Frontend: Request payload:", JSON.stringify(requestPayload, null, 2));
  
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(requestPayload),
  });

  const data = await response.json();
  console.log("📩 AI Backend Response:", data);

  if (!response.ok) {
    throw new Error(`Failed to get response from AI backend: ${data.error || response.statusText}`);
  }

  if (!data.reply) {
    throw new Error("No AI reply received from backend");
  }

  // Return the data in the format expected by the frontend
  return { data };
}
