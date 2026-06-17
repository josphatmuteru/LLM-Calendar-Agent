import express from 'express';
import { runAgentLoop } from '../agent/runner.js';

const router = express.Router();

router.post('/', async (req, res) => {
  // Set SSE Headers required for active chunk streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { messages } = req.body;

  try {
    // Run core engine loop passing response pipeline handle
  const messagess = [
    {
      role: "system",
      content: `
You are a helpful calendar assistant.
Answer clearly and concisely.
The date today is 2026-06-17
      `
    },
    ...messages
  ];

    await runAgentLoop(messagess || [], res);
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify(err.message)}\n\n`);
  } finally {
    // Safely inform client that communication stream is closed
   // res.write('event: done\ndata: {}\n\n');
    res.end();
  }
});

export default router;