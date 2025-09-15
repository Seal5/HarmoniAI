import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("🔍 Request received, parsing body...");
    
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("❌ Failed to parse request body as JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    console.log("📦 Parsed request body:", JSON.stringify(body, null, 2));
    
    const { messages } = body;
    console.log("📝 Extracted messages:", messages);
    console.log("📝 Messages type:", typeof messages);
    console.log("📝 Is array?", Array.isArray(messages));

    // Check if messages is an array
    if (!Array.isArray(messages)) {
      console.error("❌ Messages is not an array:", messages);
      console.error("❌ Type of messages:", typeof messages);
      console.error("❌ Full body received:", body);
      return NextResponse.json(
        { error: "Invalid request: messages must be an array", received: messages },
        { status: 400 }
      );
    }

    console.log("✅ Received messages:", messages); // Debugging line to log messages

    const GEMINI_MODEL = "models/gemini-1.5-pro-latest";
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      throw new Error("Gemini API key not found in environment variables");
    }

    // Format messages for Gemini API with proper role mapping
    const formattedContents = messages.map((m: any) => {
      // Map roles: "model" stays "model", everything else becomes "user"
      const role = m.role === "model" ? "model" : "user";
      return {
        role: role,
        parts: [{ text: m.content }],
      };
    });

    console.log("🔧 Formatted contents for Gemini:", JSON.stringify(formattedContents, null, 2));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: formattedContents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          systemInstruction: {
            parts: [{
              text: "You are Harmoni, a compassionate AI therapeutic companion. Provide empathetic, supportive responses that help users process their emotions and thoughts. Be warm, understanding, and non-judgmental. Offer gentle guidance and coping strategies when appropriate, but always encourage users to seek professional help for serious mental health concerns."
            }]
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
