import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://192.168.100.35:11434' });

export async function sendToOllama(messages, tools = []) {

    console.log("//////////////////////////////////",messages,  tools)
  // Returns a raw streaming generator object
  return await ollama.chat({
    model: "gemma4",
    messages: messages,
    tools: tools,
    think: true,
    stream: true
  });
}

export async function sendToOllamaNoStream(messages, tools = []) {


  // Returns a raw streaming generator object
  return await ollama.chat({
    model: "gemma4",
    messages: messages,
    tools: tools,
        think: true,
    stream: true
  });
}
