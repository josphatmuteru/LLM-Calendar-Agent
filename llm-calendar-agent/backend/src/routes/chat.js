import express from 'express';
import { runAgentLoop, runScenariosAgentLoop } from '../agent/runner.js';
import { AGENT_FUNCTION_DECLARATIONS } from '../agent/tools.js';

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


router.post('/generate-Scenario', async (req, res) => {
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
You are a scenario creator.
Answer clearly and concisely.
You create scenarios that can be used to demonstrate the capabilities of an calendar scheduling and email client agent who has access to the following tools: ${AGENT_FUNCTION_DECLARATIONS}.
You come up with characters who will be in the scenarios that include those characters and the user. You create calendar events and email data, that can be found in those scenarios.  
You use actual names in emails instead of [Username] placeholders.
You also come up with a short description of the scenario as well as the first user prompt in such a scenario.
The date today is 2026-06-17
      `
    },
    ...messages
  ];

    await runScenariosAgentLoop(messagess || [], res);
   
  } catch (err) {
     console.log("got hereeeeeeeeeeeeee", err)
    res.write(`event: error\ndata: ${JSON.stringify(err.message)}\n\n`);
  } finally {
    // Safely inform client that communication stream is closed
   // res.write('event: done\ndata: {}\n\n');
    res.end();
  }
});
export default router;