export const AGENT_NETWORK_TOOLS_SPECS = [
  {
    name: 'list_events',
    endpoint: '/api/calendar/events',
    method: 'GET',
    description: 'Retrieves a list of calendar events. Optionally filters events scheduled on a specific date.',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: {
          type: 'STRING',
          description: 'Optional date filter in YYYY-MM-DD format.'
        }
      }
    }
  },
  {
    name: 'check_availability',
    endpoint: '/api/calendar/availability',
    method: 'GET',
    description: 'Checks schedule conflicts and availability for a specified date and time interval range.',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: {
          type: 'STRING',
          description: 'The target date in YYYY-MM-DD format.'
        },
        timeSlot: {
          type: 'STRING',
          description: 'The explicit time range interval slot to check (e.g., "11.00", "9.00 AM – 10.30 PM").'
        }
      },
      required: ['date', 'timeSlot']
    }
  },
  {
    name: 'create_event',
    endpoint: '/api/calendar/events',
    method: 'POST',
    description: 'Schedules and provisions a new calendar event entry on a specified date and time block.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: {
          type: 'STRING',
          description: 'The explicit summary title text description of the event.'
        },
        date: {
          type: 'STRING',
          description: 'The target scheduling date parameter in YYYY-MM-DD format.'
        },
        time: {
          type: 'STRING',
          description: 'The specific timeframe block string (e.g., "9.00 AM – 10.30 PM").'
        },
        color: {
          type: 'STRING',
          description: 'Optional categorization color label accent matching system themes (e.g., "blue", "green", "beige").'
        }
      },
      required: ['title', 'date', 'time']
    }
  },
  {
    name: 'delete_event',
    endpoint: '/api/calendar/events/:id',
    method: 'DELETE',
    description: 'Cancels and removes a target operational calendar event from the persistent registry by its system ID key.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'STRING',
          description: 'The specific database event identifier reference to drop.'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'list_emails',
    endpoint: '/api/emails',
    method: 'GET',
    description: 'Retrieves active mailbox arrays. Optionally partitions entries filtered strictly by systemic folder labels.',
    parameters: {
      type: 'OBJECT',
      properties: {
        folder: {
          type: 'STRING',
          description: 'Target mailbox category directory filter segment.',
          enum: ['Inbox', 'Sent', 'Drafts', 'Archive', 'Trash']
        }
      }
    }
  },
  {
    name: 'search_emails',
    endpoint: '/api/emails/search',
    method: 'GET',
    description: 'Queries communication history sequences across text tokens, body blocks, metadata fragments, or structured search operators.',
    parameters: {
      type: 'OBJECT',
      properties: {
        q: {
          type: 'STRING',
          description: 'The literal string sequence query or structural token payload to execute match actions against.'
        }
      },
      required: ['q']
    }
  },
  {
    name: 'send_email',
    endpoint: '/api/emails',
    method: 'POST',
    description: 'Dispatches or initiates an email sequence, mapping payloads dynamically into directory locations.',
    parameters: {
      type: 'OBJECT',
      properties: {
        recipientEmail: {
          type: 'STRING',
          description: 'The target destination electronic mailing endpoint reference address.'
        },
        subject: {
          type: 'STRING',
          description: 'Header text or core title descriptor line for the context payload structure.'
        },
        body: {
          type: 'STRING',
          description: 'The descriptive contextual plaintext string representation payload mapping message lines.'
        },
        folder: {
          type: 'STRING',
          description: 'Optional destination folder override if drafting vs sending directly.',
          enum: ['Inbox', 'Sent', 'Drafts', 'Archive', 'Trash']
        }
      },
      required: ['recipientEmail', 'subject', 'body']
    }
  },
  {
    name: 'archive_email',
    endpoint: '/api/emails/:id/archive',
    method: 'PUT',
    description: 'Safely transfers an email sequence reference into the global archive repository timeline block.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'STRING',
          description: 'The primary tracking record system ID of the email payload entry to change.'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'mark_as_read',
    endpoint: '/api/emails/:id/read',
    method: 'PUT',
    description: 'Modifies the read/unread boolean processing state flags tracking standard envelope records.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'STRING',
          description: 'The unique sequence ID key representing the item row target.'
        },
        read: {
          type: 'BOOLEAN',
          description: 'Explicit operational state payload boolean parameter representing visibility markers (true = read, false = unread).'
        }
      },
      required: ['id', 'read']
    }
  },
  {
    name: 'delete_email',
    endpoint: '/api/emails/:id',
    method: 'DELETE',
    description: 'Moves active logs to intermediate trash storage repositories, or enforces permanent truncation if target is already in Trash.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'STRING',
          description: 'The target dataset execution pointer tracking ID key to process deletion actions upon.'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'restore_email',
    endpoint: '/api/emails/:id/restore',
    method: 'PUT',
    description: 'Rolls back system delete hooks by recovering standard message logs from Trash directories back into active Inbox timelines.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: {
          type: 'STRING',
          description: 'The identification database tracking row index key string element to recover.'
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