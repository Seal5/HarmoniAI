import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const GEMINI_MODEL = "models/gemini-1.5-pro-latest";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages.map((m: any) => ({
            role: m.role,
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();
    console.log("🤖 Gemini API response:", JSON.stringify(data, null, 2));
    let reply = "No response received from Gemini.";
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    } else if (data?.error?.message) {
      reply = `Gemini API error: ${data.error.message}`;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("🔥 Server error in geminiChat API:", error);
    return NextResponse.json(
      { reply: "An error occurred while contacting Gemini API." },
      { status: 500 }
    );
  }
}
