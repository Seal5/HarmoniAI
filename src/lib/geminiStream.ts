export async function streamGeminiResponse(
  messages: { role: "user" | "model"; content: string }[],
  onChunk: (chunkText: string) => void
) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1024,
          stopSequences: [],
        },
      }),
    }
  )

  if (!response.body) throw new Error("No response body")

  const reader = response.body.getReader()
  const decoder = new TextDecoder("utf-8")
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split("\n")

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const json = JSON.parse(line.replace("data: ", ""))
        const chunkText = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
        if (chunkText) {
          onChunk(chunkText)
        }
      }
    }

    buffer = lines[lines.length - 1] // keep incomplete line for next loop
  }
}
