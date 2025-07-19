export async function se(messages: { role: "user" | "model", content: string }[]) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const formattedMessages = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }))

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: formattedMessages,
      }),
    },
  )

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
}
