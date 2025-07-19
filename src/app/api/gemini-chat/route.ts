import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: messages.map((m: any) => ({ text: m.content })),
        },
      ],
    }),
  })

  const result = await geminiRes.json()
  const reply = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response."

  return NextResponse.json({ reply })
}
