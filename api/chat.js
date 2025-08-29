import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Claude API is ready!',
      usage: 'Send POST request with messages array',
      example: { messages: [{ role: 'user', content: 'Hello Claude!' }] }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug: Check if API key exists
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API key not found',
      debug: 'CLAUDE_API_KEY environment variable is missing'
    });
  }

  // Debug: Check API key format (don't log the actual key!)
  if (!apiKey.startsWith('sk-ant-')) {
    return res.status(500).json({ 
      error: 'API key format incorrect',
      debug: `Key starts with: ${apiKey.substring(0, 7)}...`
    });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const { messages, max_tokens = 1000 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens,
      messages,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Claude API Error:', error);
    res.status(500).json({ 
      error: 'Claude API error',
      message: error.message 
    });
  }
}
