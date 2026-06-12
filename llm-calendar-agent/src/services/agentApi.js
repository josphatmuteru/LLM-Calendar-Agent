export async function streamAgentChat(messages, onThinking, onContent, onDone) {
  const response = await fetch('http://localhost:3000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages})
  });

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += value;
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() || ''; // Retain partial chunks

    for (const block of blocks) {
      if (!block.trim()) continue;

      const lines = block.split('\n');
      const eventLine = lines.find(l => l.startsWith('event: '));
      const dataLine = lines.find(l => l.startsWith('data: '));

      if (eventLine && dataLine) {
        const eventType = eventLine.replace('event: ', '').trim();
        const token = JSON.parse(dataLine.replace('data: ', '').trim());

        if (eventType === 'thinking') onThinking(token);
        if (eventType === 'content') onContent(token);
        if (eventType === 'done') {
          onDone();
          return;
        }
      }
    }
  }
}




export async function sendMessage(message) {
console.log(message)

const response = await fetch(
  "http://localhost:3000/chat",
   {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message
    })
  }


)

console.log(response.json)
  
return response.json()

}


