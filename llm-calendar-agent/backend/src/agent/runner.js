import { sendToOllama } from '../llm/ollama.js';


const AGENT_NETWORK_TOOLS_SPECS = [
  {
    name: 'list_emails',
    endpoint: '/api/agent/tools/list_emails',
    method: 'POST',
    description: 'Retrieves a list of emails. Optionally filters by a specific folder (Inbox, Sent, Drafts, Archive, Trash).',
    parameters: {
      type: 'OBJECT',
      properties: {
        folder: {
          type: 'STRING',
          description: 'The target folder to read from. e.g. "Inbox", "Sent", "Drafts", "Archive", "Trash"',
          enum: ['Inbox', 'Sent', 'Drafts', 'Archive', 'Trash']
        }
      }
    }
  },
  {
    name: 'search_emails',
    endpoint: '/api/agent/tools/search_emails',
    method: 'POST',
    description: 'Searches the entire email logs for a keyword query. Searches in subject, sender details, and message body text.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'The keyword search term.'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'send_email',
    endpoint: '/api/agent/tools/send_email',
    method: 'POST',
    description: 'Dispatches or drafts a brand new outgoing email conversation. Moves it to the "Sent" folder.',
    parameters: {
      type: 'OBJECT',
      properties: {
        recipientEmail: {
          type: 'STRING',
          description: 'The email address of the receiver.'
        },
        subject: {
          type: 'STRING',
          description: 'Heading or subject line.'
        },
        body: {
          type: 'STRING',
          description: 'Markdown-compatible body content.'
        }
      },
      required: ['recipientEmail', 'subject', 'body']
    }
  },
  {
    name: 'archive_email',
    endpoint: '/api/agent/tools/archive_email',
    method: 'POST',
    description: 'Archives a target email by its unique ID, removing it from Inbox.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'STRING',
          description: 'The unique ID identifier of the target email'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_email',
    endpoint: '/api/agent/tools/delete_email',
    method: 'POST',
    description: 'Safely deletes an email by placing it inside Trash, or deletes it permanently if it resides in Trash.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'STRING',
          description: 'Unique ID identifier of the email.'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'mark_as_read',
    endpoint: '/api/agent/tools/mark_as_read',
    method: 'POST',
    description: 'Modifies the read/unread status on a specific email conversation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'STRING',
          description: 'Unique ID of the email.'
        },
        read: {
          type: 'BOOLEAN',
          description: 'True for read, false for unread.'
        }
      },
      required: ['id', 'read']
    }
  },
  {
    name: 'list_events',
    endpoint: '/api/agent/tools/list_events',
    method: 'POST',
    description: 'Retrieves active scheduled calendar events. Optionally filters down to a specific date.',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: {
          type: 'STRING',
          description: 'The search date (YYYY-MM-DD format). Defaults to all events if omitted.'
        }
      }
    }
  },
  {
    name: 'check_availability',
    endpoint: '/api/agent/tools/check_availability',
    method: 'POST',
    description: 'Checks for conflicts and busy status in your planner for a given date and time range.',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: {
          type: 'STRING',
          description: 'Requested schedule date (YYYY-MM-DD format).'
        },
        timeSlot: {
          type: 'STRING',
          description: 'Requested time slot filter (e.g., "11.00 AM").'
        }
      },
      required: ['date', 'timeSlot']
    }
  },
  {
    name: 'create_event',
    endpoint: '/api/agent/tools/create_event',
    method: 'POST',
    description: 'Schedules and books a new event onto the calendar planner.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: {
          type: 'STRING',
          description: 'Title of the event.'
        },
        date: {
          type: 'STRING',
          description: 'Target scheduling date (YYYY-MM-DD format).'
        },
        time: {
          type: 'STRING',
          description: 'Target time range (e.g., "9.00 AM – 10.30 AM").'
        },
        color: {
          type: 'STRING',
          description: 'Optional aesthetic theme color accent.',
          enum: ['blue', 'green', 'beige']
        }
      },
      required: ['title', 'date', 'time']
    }
  },
  {
    name: 'delete_event',
    endpoint: '/api/agent/tools/delete_event',
    method: 'POST',
    description: 'Cancels or removes a scheduled calendar event by its unique ID.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'STRING',
          description: 'Unique ID identifier of the event.'
        }
      },
      required: ['id']
    }
  }
];


export const AGENT_FUNCTION_DECLARATIONS = [
  // --- Email App Tools ---
  {
    type: 'function',
    function: {
      name: 'list_emails',
      description: 'Retrieves a list of emails. Optionally filters by a specific folder (Inbox, Sent, Drafts, Archive, Trash).',
      parameters: {
        type: 'object',
        properties: {
          folder: {
            type: 'string',
            description: 'The target folder to read from.',
            enum: ['Inbox', 'Sent', 'Drafts', 'Archive', 'Trash']
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_emails',
      description: "Searches the user's emails by keyword query. Looks inside sender name, email, subject, and text body.",
      parameters: {
        type: 'object',
        required: ['query'],
        properties: {
          query: {
            type: 'string',
            description: 'The search term or keyword.'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'send_email',
      description: 'Sends a brand new outgoing email or reply. Appends the event to the "Sent" folder.',
      parameters: {
        type: 'object',
        required: ['recipientEmail', 'subject', 'body'],
        properties: {
          recipientEmail: {
            type: 'string',
            description: 'The email address of the receiver.'
          },
          subject: {
            type: 'string',
            description: 'The subject title of the message.'
          },
          body: {
            type: 'string',
            description: 'The markdown-friendly body content of the email.'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'archive_email',
      description: 'Moves an email to the Archive folder, removing it from Inbox.',
      parameters: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            description: 'The exact unique ID of the target email.'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_email',
      description: 'Moves an email to Trash, or permanently deletes it if it is already in the Trash folder.',
      parameters: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            description: 'The exact unique ID of the email to delete.'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'mark_as_read',
      description: 'Toggles the read or unread status of an email.',
      parameters: {
        type: 'object',
        required: ['id', 'read'],
        properties: {
          id: {
            type: 'string',
            description: 'The exact unique ID of the email.'
          },
          read: {
            type: 'boolean',
            description: 'Set to true if read, false if unread.'
          }
        }
      }
    }
  },

  // --- Calendar App Tools ---
  {
    type: 'function',
    function: {
      name: 'list_events',
      description: 'Retrieves a list of scheduled calendar events. Can filter by a specific date.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'The date to search (YYYY-MM-DD format). Defaults to all events if omitted.'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Checks if a specific date and time slot is available on the calendar before scheduling.',
      parameters: {
        type: 'object',
        required: ['date', 'timeSlot'],
        properties: {
          date: {
            type: 'string',
            description: 'The date to check (YYYY-MM-DD format).'
          },
          timeSlot: {
            type: 'string',
            description: 'The requested time range (e.g., "11.00 AM").'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_event',
      description: 'Schedules a brand new event onto the calendar planner.',
      parameters: {
        type: 'object',
        required: ['title', 'date', 'time'],
        properties: {
          title: {
            type: 'string',
            description: 'The friendly title or heading of the meeting/appointment.'
          },
          date: {
            type: 'string',
            description: 'The date of the event (YYYY-MM-DD format).'
          },
          time: {
            type: 'string',
            description: 'The time slot range of the event (e.g., "9.00 AM – 10.30 AM").'
          },
          color: {
            type: 'string',
            description: 'Optional visual highlight color tag.',
            enum: ['blue', 'green', 'beige']
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_event',
      description: 'Removes or cancels a scheduled event by its unique event ID.',
      parameters: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            description: 'The unique ID identifier of the event (e.g. "e3").'
          }
        }
      }
    }
  }
];

// Base URL configuration for your local backend network service
const BASE_SERVER_URL = 'http://localhost:3003';

/**
 * Creates a fast O(1) hash map dictionary directly from your specs array
 */
const toolSpecsMap = new Map(
  AGENT_NETWORK_TOOLS_SPECS.map(spec => [spec.name, spec])
);

/**
 * Resolves tool function schemas and dispatches request packets to your backend
 * @param {string} toolName - Name of function returned from LLM (e.g. 'check_availability')
 * @param {Object} args - Arguments generated by LLM text logic
 */
async function executeDynamicTool(toolName, args) {
  const spec = toolSpecsMap.get(toolName);
  

console.log("//////gggggggg///////gggggg///////ggg/g/g/g/", toolName, spec )

  if (!spec) {
    throw new Error(`Tool "${toolName}" is not registered in AGENT_NETWORK_TOOLS_SPECS.`);
  }

  const targetUrl = `${BASE_SERVER_URL}${spec.endpoint}`;
  const options = {
    method: spec.method || 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Safe payload builder based on defined HTTP verbs
  if (options.method === 'GET') {
    const queryParams = new URLSearchParams(args).toString();
    return fetch(`${targetUrl}?${queryParams}`, { method: 'GET' }).then(res => res.json());
  }

  // POST/PUT: Send arguments directly as the main request body JSON object
  options.body = JSON.stringify(args || {});

  console.log("request", targetUrl, " ",  " " , options);

  const response = await fetch(targetUrl, options);
  
  if (!response.ok) {
    throw new Error(`Network tool execution failed on ${spec.endpoint}. Status: ${response.status}`);
  }
const results = await response.json()
console.log("results", results);
  return  results;
}



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
You are a helpful weather and fashion assistant.
Answer clearly and concisely.
      `
    }
  ];
const toolRegistry = [clothingTool, weatherTool];

// Mock API Call functions
async function mockWeather(city) {
  return { city, temperature: 14, condition: 'Rainy' };
}
async function mockClothing(condition) {
  return { outfit: 'Raincoat and heavy boots', accessories: 'Umbrella' };
}


export async function runAgentLoop(messages, res) {
  const MAX_ITERATIONS = 10;

  try {
    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      let toolCalls = [];

      const responseStream = await sendToOllama(
        messages,
        AGENT_FUNCTION_DECLARATIONS
      );

      for await (const chunk of responseStream) {
        // Stream reasoning
        if (chunk.message?.thinking) {
          res.write(
            `event: thinking\ndata: ${JSON.stringify(
              chunk.message.thinking
            )}\n\n`
          );
        }

        // Stream visible response tokens
        if (chunk.message?.content) {
          res.write(
            `event: content\ndata: ${JSON.stringify(
              chunk.message.content
            )}\n\n`
          );
        }

        // Collect ALL tool calls emitted during streaming
        if (chunk.message?.tool_calls?.length) {
          toolCalls.push(...chunk.message.tool_calls);
        }
      }

      // No tool calls -> agent is finished
      if (toolCalls.length === 0) {
        res.write(`event: done\ndata: {}\n\n`);
        res.end();
        return;
      }

      // Save assistant tool request
      messages.push({
        role: "assistant",
        tool_calls: toolCalls
      });

      // Execute tool calls
      const toolMessages = await Promise.all(
        toolCalls.map(async (call) => {
          const toolName = call.function?.name;

          let toolArgs;

          try {
            toolArgs =
              typeof call.function?.arguments === "string"
                ? JSON.parse(call.function.arguments)
                : call.function?.arguments || {};
          } catch {
            toolArgs = {};
          }

          res.write(
            `event: thinking\ndata: ${JSON.stringify(
              `⚡ Running ${toolName}...`
            )}\n\n`
          );

          let toolResult;

          try {
            toolResult = await executeDynamicTool(
              toolName,
              toolArgs
            );
          } catch (error) {
            toolResult = {
              success: false,
              error: error.message
            };
          }

          // Optional: stream result preview
          res.write(
            `event: thinking\ndata: ${JSON.stringify(
              `✓ ${toolName} completed`
            )}\n\n`
          );

          return {
            role: "tool",
            tool_name: toolName,
            tool_call_id: call.id,
            content: JSON.stringify(toolResult)
          };
        })
      );

      messages.push(...toolMessages);
    }

    // Safety cutoff
    res.write(
      `event: error\ndata: ${JSON.stringify(
        "Maximum agent iterations reached."
      )}\n\n`
    );

    res.end();
  } catch (error) {
    console.error("Agent loop error:", error);

    res.write(
      `event: error\ndata: ${JSON.stringify(
        error.message
      )}\n\n`
    );

    res.end();
  }
}


// export async function runAgentLoop(messages, res) {
//   console.log(messages);
//   // Call lower ollama wrapper
//   const responseStream = await sendToOllama(messages, AGENT_FUNCTION_DECLARATIONS);
//   let toolCalls = null;

//   for await (const chunk of responseStream) {
//     // 1. Immediately stream internal reasoning paths to the frontend
//     if (chunk.message.thinking) {
//       res.write(`event: thinking\ndata: ${JSON.stringify(chunk.message.thinking)}\n\n`);
//     } 
//     // 2. Stream base response content tokens
//     else if (chunk.message.content) {
//       res.write(`event: content\ndata: ${JSON.stringify(chunk.message.content)}\n\n`);
//     }

//     // 3. Keep records of tool intents if model emits them
//     if (chunk.message.tool_calls?.length) {
//       toolCalls = chunk.message.tool_calls;
//     }
//   }

//   // 4. Intercept Tool Call Execution Loops
//   if (toolCalls && toolCalls.length > 0) {
//     // Append assistant tool intent into state array
//     messages.push({ role: 'assistant', tool_calls: toolCalls });

//     for (const call of toolCalls) {
//       let toolResult = null;
//       const toolName = call.function.name;
//       const toolArgs = call.function.arguments;
      
//       // Let the frontend know a tool is firing in the thoughts timeline
//       res.write(`event: thinking\ndata: ${JSON.stringify(`\n⚡ [Tool Firing]: Running ${toolName}...\n`)}\n\n`);

//       try {
//         // Dynamic tool resolver handles methods (POST/GET) and routing rules internally
//         toolResult = await executeDynamicTool(toolName, toolArgs);
//       } catch (error) {
//         toolResult = { success: false, error: `Tool execution failed: ${error.message}` };
//       }

//       messages.push({
//         role: 'tool',
//         tool_name: toolName,
//         content: JSON.stringify(toolResult)
//       });
//     }

//     // 5. Tail Recurse: Feed data variables directly back into the engine
//     return runAgentLoop(messages, res);
//   }
// }



// export async function runAgentLoop(messages, res) {
//     console.log(messages)
//   // Call your lower ollama wrapper
//   const responseStream = await sendToOllama(messages, toolRegistry);
//   let toolCalls = null;

//   for await (const chunk of responseStream) {
//     // 1. Immediately stream internal reasoning paths to the frontend
//     if (chunk.message.thinking) {
//       res.write(`event: thinking\ndata: ${JSON.stringify(chunk.message.thinking)}\n\n`);
//     } 
//     // 2. Stream base response content tokens
//     else if (chunk.message.content) {
//       res.write(`event: content\ndata: ${JSON.stringify(chunk.message.content)}\n\n`);
//     }

//     // 3. Keep records of tool intents if model emits them
//     if (chunk.message.tool_calls?.length) {
//       toolCalls = chunk.message.tool_calls;
//     }
//   }

//   // 4. Intercept Tool Call Execution Loops
//   if (toolCalls && toolCalls.length > 0) {
//     // Append assistant tool intent into state array
//     messages.push({ role: 'assistant', tool_calls: toolCalls });

//     for (const call of toolCalls) {
//       let toolResult = null;
      
//       // Let the frontend know a tool is firing in the thoughts timeline
//       res.write(`event: thinking\ndata: ${JSON.stringify(`\n⚡ [Tool Firing]: Running ${call.function.name}...\n`)}\n\n`);

//       if (call.function.name === 'get_current_weather') {
//         toolResult = await mockWeather(call.function.arguments.city);
//       } else if (call.function.name === 'get_clothing_advice') {
//         toolResult = await mockClothing(call.function.arguments.condition);
//       }

//       if (toolResult) {
//         messages.push({
//           role: 'tool',
//           tool_name: call.function.name,
//           content: JSON.stringify(toolResult)
//         });
//       }
//     }

//     // 5. Tail Recurse: Feed data variables directly back into the engine
//     return runAgentLoop(messages, res);
//   }
// }
