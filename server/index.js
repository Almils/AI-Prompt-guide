import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/hf', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/distilgpt2',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Hugging Face API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch AI response', details: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});