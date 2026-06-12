import { sendToOllama } from '../llm/ollama.js';

// Define tools
const weatherTool = {
  type: 'function',
  function: {
    name: 'get_current_weather',
    description: 'Get current weather or temperature for a given city.',
    parameters: {
      type: 'object',
      required: ['city'],
      properties: { city: { type: 'string', description: 'City name' } }
    }
  }
};

const clothingTool = {
  type: 'function',
  function: {
    name: 'get_clothing_advice',
    description: 'Get clothing advice based on conditions.',
    parameters: {
      type: 'object',
      required: ['condition'],
      properties: { condition: { type: 'string', description: 'Weather condition' } }
    }
  }
};
  const messages = [
    {
      role: "system",
      content: `
You are a helpful calendar assistant.
Answer clearly and concisely.
      `
    }
  ];
const toolRegistry = [weatherTool, clothingTool];

// Mock API Call functions
async function mockWeather(city) {
  return { city, temperature: 14, condition: 'Rainy' };
}
async function mockClothing(condition) {
  return { outfit: 'Raincoat and heavy boots', accessories: 'Umbrella' };
}



export async function runAgentLoop(messages, res) {
    console.log(messages)
  // Call your lower ollama wrapper
  const responseStream = await sendToOllama(messages, toolRegistry);
  let toolCalls = null;

  for await (const chunk of responseStream) {
    // 1. Immediately stream internal reasoning paths to the frontend
    if (chunk.message.thinking) {
      res.write(`event: thinking\ndata: ${JSON.stringify(chunk.message.thinking)}\n\n`);
    } 
    // 2. Stream base response content tokens
    else if (chunk.message.content) {
      res.write(`event: content\ndata: ${JSON.stringify(chunk.message.content)}\n\n`);
    }

    // 3. Keep records of tool intents if model emits them
    if (chunk.message.tool_calls?.length) {
      toolCalls = chunk.message.tool_calls;
    }
  }

  // 4. Intercept Tool Call Execution Loops
  if (toolCalls && toolCalls.length > 0) {
    // Append assistant tool intent into state array
    messages.push({ role: 'assistant', tool_calls: toolCalls });

    for (const call of toolCalls) {
      let toolResult = null;
      
      // Let the frontend know a tool is firing in the thoughts timeline
      res.write(`event: thinking\ndata: ${JSON.stringify(`\n⚡ [Tool Firing]: Running ${call.function.name}...\n`)}\n\n`);

      if (call.function.name === 'get_current_weather') {
        toolResult = await mockWeather(call.function.arguments.city);
      } else if (call.function.name === 'get_clothing_advice') {
        toolResult = await mockClothing(call.function.arguments.condition);
      }

      if (toolResult) {
        messages.push({
          role: 'tool',
          tool_name: call.function.name,
          content: JSON.stringify(toolResult)
        });
      }
    }

    // 5. Tail Recurse: Feed data variables directly back into the engine
    return runAgentLoop(messages, res);
  }
}
