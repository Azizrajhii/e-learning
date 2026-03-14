const axios = require('axios');

// List of fallback models in order of preference
const MODEL_ENDPOINTS = [
  'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
  'https://api-inference.huggingface.co/models/facebook/blenderbot-1B-distill',
  'https://api-inference.huggingface.co/models/gpt2'
];

const ChatBox = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    if (!process.env.HF_API_KEY) {
      console.error('HF_API_KEY is missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    let lastError = null;

    // Try each model endpoint until one works
    for (const endpoint of MODEL_ENDPOINTS) {
      try {
        console.log(`Trying model: ${endpoint}`);
        
        const response = await axios.post(
          endpoint,
          { inputs: message },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HF_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        const reply = response.data?.generated_text || 
                     response.data[0]?.generated_text || 
                     "I received your message but couldn't generate a response.";

        return res.json({ 
          reply,
          conversationId: Date.now(),
          modelUsed: endpoint.split('/').pop()
        });

      } catch (error) {
        console.error(`Error with model ${endpoint}:`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        lastError = error;
        // Continue to next model if this one fails
      }
    }

    // If all models failed
    throw lastError || new Error('All model endpoints failed');

  } catch (error) {
    console.error('Final ChatBox error:', error.message);
    
    const fallbackResponses = [
      "I'm experiencing technical difficulties. Please try again later.",
      "Our AI services are temporarily unavailable.",
      "I can't process your request right now. Try again in a few minutes."
    ];

    return res.status(error.response?.status || 503).json({
      error: 'Service unavailable',
      reply: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        status: error.response?.status
      } : undefined
    });
  }
};

module.exports = { ChatBox };