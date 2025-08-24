// Simple test script to verify API endpoint
async function testAPI() {
  const testMessages = [
    {
      id: "test1",
      role: "user", 
      content: "Hi, I'm feeling anxious today"
    }
  ];

  try {
    console.log("Testing API with messages:", testMessages);
    
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: testMessages })
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log("Response data:", data);

    if (response.ok) {
      console.log("✅ API test successful!");
      console.log("AI Reply:", data.reply);
    } else {
      console.log("❌ API test failed!");
      console.log("Error:", data.error);
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
testAPI();
