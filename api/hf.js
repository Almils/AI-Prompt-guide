import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt2',
      { inputs: prompt },
      { headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` } }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Hugging Face API error:', error);
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
}