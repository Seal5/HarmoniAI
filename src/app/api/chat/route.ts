import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    console.log("🔥 API called with messages:", messages);
    console.log("🧠 User context:", context);

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages must be an array" },
        { status: 400 }
      );
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Create context-aware system instruction
    let systemInstruction = "You are Harmoni, a compassionate AI therapeutic companion. Provide empathetic, supportive responses that help users process their emotions and thoughts. Be warm, understanding, and non-judgmental. Offer gentle guidance and coping strategies when appropriate, but always encourage users to seek professional help for serious mental health concerns.";
    
    // Add PHQ-9 context if available
    if (context && context.hasCompletedPHQ9) {
      const { phq9Score, severity } = context;
      
      systemInstruction += `\n\nIMPORTANT CONTEXT: This user recently completed a PHQ-9 depression assessment with a score of ${phq9Score}/27 indicating ${severity?.toLowerCase()} symptoms. `;
      
      switch (severity) {
        case 'MINIMAL':
          systemInstruction += "They are doing relatively well but may benefit from preventive mental health strategies and ongoing support.";
          break;
        case 'MILD':
          systemInstruction += "They may be experiencing some depressive symptoms. Focus on validation, coping strategies, and gentle encouragement.";
          break;
        case 'MODERATE':
          systemInstruction += "They are experiencing moderate depressive symptoms. Provide supportive strategies while gently encouraging professional help if symptoms persist.";
          break;
        case 'MODERATELY_SEVERE':
        case 'SEVERE':
          systemInstruction += "They are experiencing significant depressive symptoms. While providing support, consistently encourage professional mental health care and be alert to crisis situations.";
          break;
      }
      
      systemInstruction += " Tailor your responses to their current mental health state, but don't constantly reference their assessment unless relevant to the conversation.";
    }

    // Format messages for Gemini
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    console.log("🤖 Sending to Gemini:", geminiMessages);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1000,
          },
          systemInstruction: {
            parts: [{
              text: systemInstruction
            }]
          },
        }),
      }
    );

    const geminiData = await geminiResponse.json();
    console.log("📥 Gemini response:", geminiData);

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiData.error?.message || "Unknown error"}`);
    }

    const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to listen. Could you tell me more?";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    
    // Provide helpful fallback responses for common issues
    let fallbackReply = "I apologize, but I'm having trouble responding right now. Please try again in a moment. I'm here to support you.";
    
    if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
      fallbackReply = "I'm experiencing high demand right now. While I work to resolve this, please know that I'm here for you. Feel free to continue sharing your thoughts - sometimes just expressing yourself can be helpful. Is there something specific you'd like to talk about today?";
    } else if (error.message.includes('API key')) {
      fallbackReply = "I'm having a technical issue connecting to my systems. In the meantime, I want you to know that your feelings are valid and you're not alone. What's on your mind today?";
    }
    
    // Return a helpful response instead of an error to keep the conversation flowing
    return NextResponse.json({ 
      reply: fallbackReply,
      isError: true, // Flag to indicate this is an error fallback
      errorType: error.message.includes('quota') ? 'quota_exceeded' : 'api_error'
    });
  }
}
