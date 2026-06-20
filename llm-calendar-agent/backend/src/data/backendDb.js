// Baseline fallback data for calendar and email
const DEFAULT_CALENDAR_EVENTS = [
  { id: 'e1', title: 'Stand up', time: '9.00 AM – 10.30 PM', date: '2026-06-18', color: 'blue' },
  { id: 'e2', title: 'Client call', time: '11.00 AM – 12.30 AM', date: '2026-06-18', color: 'green' },
  { id: 'e3', title: 'Another Activity', time: '3.00 AM – 5.30 PM', date: '2026-06-18', color: 'beige' },
  { id: 'e4', title: 'Planning Session', time: '10.00 AM – 11.30 AM', date: '2026-06-13', color: 'blue' },
  { id: 'e5', title: 'Review Tasks', time: '4.00 PM – 5.00 PM', date: '2026-06-13', color: 'beige' },
  { id: 'e6', title: 'Design Sync', time: '9.00 AM – 10.30 AM', date: '2026-06-04', color: 'blue' },
  { id: 'e7', title: 'Coffee Catchup', time: '2.00 PM – 3.00 PM', date: '2026-06-04', color: 'beige' },
  { id: 'e8', title: 'Product Demo', time: '1.00 PM – 2.30 PM', date: '2026-06-11', color: 'green' },
  { id: 'e9', title: 'Grocery Run', time: '11.00 AM – 12.00 PM', date: '2026-06-14', color: 'beige' },
  { id: 'e10', title: 'Weekend Brunch', time: '11.30 AM – 1.30 PM', date: '2026-06-20', color: 'green' },
  { id: 'e11', title: 'Project Kickoff', time: '10.00 AM – 11.30 AM', date: '2026-06-23', color: 'blue' },
  { id: 'e12', title: 'Dentist Visit', time: '3.00 PM – 4.00 PM', date: '2026-06-23', color: 'beige' }
];

const DEFAULT_EMAILS = [
  {
    id: '1',
    senderName: 'Sarah Johnson',
    senderEmail: 'sarah.johnson@company.com',
    recipientEmail: 'you@company.com',
    subject: 'Project Update',
    body: 'Hi Team,\n\nI wanted to share the latest progress on the project. We completed the testing phase and are moving into deployment next week.\n\nPlease review the attached documentation before our meeting.\n\nRegards,\nSarah',
    timestamp: '9:15 AM',
    dateStr: 'Jun 13, 2026',
    folder: 'Inbox',
    read: false,
  },
  {
    id: '2',
    senderName: 'Acme Corp',
    senderEmail: 'billing@acme.corp',
    recipientEmail: 'you@company.com',
    subject: 'Urgent: Invoice #10294 Payment Required',
    body: 'Dear Customer,\n\nThis is a friendly reminder that invoice #10294 is due today. Please log into the company payment portal to execute your transaction.\n\nFor any questions or adjustments, please contact billing.\n\nBest regards,\nAcme Accounting',
    timestamp: 'Yesterday',
    dateStr: 'Jun 12, 2026',
    folder: 'Inbox',
    read: true,
  }
];

// Backend in-memory state stores
let emails = [...DEFAULT_EMAILS];
let events = [...DEFAULT_CALENDAR_EVENTS];

// 1. Convert any erratic time string ("10.00 AM", "16.30 AM", "14:00") into minutes from midnight
function timeToMinutes(timeStr) {
  const clean = timeStr.trim().toLowerCase().replace(/[^a-z0-9:.]/g, '');
  
  // Extract numbers and optional am/pm indicator
  const match = clean.match(/^(\d+)[.:](\d+)?(?:(am|pm))?$/) || clean.match(/^(\d+)(am|pm)$/);
  if (!match) throw new Error(`Invalid time token: ${timeStr}`);

  let hour = parseInt(match[1], 10);
  let minute = match[2] && !['am', 'pm'].includes(match[2]) ? parseInt(match[2], 10) : 0;
  const ampm = match[3] || (['am', 'pm'].includes(match[2]) ? match[2] : null);

  // Robust AM/PM Auto-Correction (Fixes "16.30 AM" -> 16:30)
  if (hour >= 12 && ampm === 'am') {
    // Treat as 24-hour time override. Ignore the 'AM' typo.
  } else if (ampm === 'pm' && hour < 12) {
    hour += 12;
  } else if (ampm === 'am' && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
}

// 2. Parse a single string into a structural start and end interval
function parseTimeInterval(timeRangeStr) {
  // Normalize dashes (hyphen, en-dash, em-dash)
  const normalizedStr = timeRangeStr.replace(/[–—-]/g, '-');
  const parts = normalizedStr.split('-').map(p => p.trim());

  const start = timeToMinutes(parts[0]);
  let end;

  if (parts.length > 1 && parts[1]) {
    end = timeToMinutes(parts[1]);
  } else {
    // If only a single time is provided ("10.00 AM"), default to a 60-minute slot
    end = start + 60; 
  }

  // Handle accidental reverse ranges (e.g. if parsed incorrectly, enforce start < end)
  return { start, end: end < start ? start + 60 : end };
}

/**
 * Server database adapters that represent real executable operations on both endpoints
 */
export const backendDb = {
  // Get entire database state (for initial sync/scenarios sync)
  getState: () => {
    return { emails, events };
  },

  // Seed with specifically defined scenarios data
  seedState: (newEmails, newEvents) => {
    emails = [...newEmails];
    events = [...newEvents];
    return { success: true, countEmails: emails.length, countEvents: events.length };
  },

  // Clear or reset database state
  resetToDefaults: () => {
    emails = [...DEFAULT_EMAILS];
    events = [...DEFAULT_CALENDAR_EVENTS];
    return { success: true };
  },

  // --- Real calendar implementations ---
  list_events: (args) => {
    if (args && args.date) {
      return events.filter(e => e.date === args.date);
    }
    return events;
  },

  // 3. Main Availability Checking Function
  check_availability: (args) => {
    try {
      const targetInterval = parseTimeInterval(args.timeSlot);

      // Filter events by date match (Assuming dates are sanitized to 'YYYY-MM-DD')
      const sameDayEvents = events.filter(e => e.date === args.date);

      // Check if any event intervals overlap with our target interval
      const conflicts = sameDayEvents.filter(event => {
        try {
          const eventInterval = parseTimeInterval(event.time);

          // Standard overlapping interval formula: 
          // An overlap happens if Max(Start1, Start2) < Min(End1, End2)
          const overlapStart = Math.max(targetInterval.start, eventInterval.start);
          const overlapEnd = Math.min(targetInterval.end, eventInterval.end);

          return overlapStart < overlapEnd;
        } catch {
          return false; // Skip malformed database rows
        }
      });

      return {
        available: conflicts.length === 0,
        conflicts
      };
    } catch (error) {
      return { available: false, conflicts: [] };
    }
  },

  create_event: (args) => {
    const newEvent = {
      id: 'e' + (events.length + 1) + Math.random().toString(36).substring(2, 6),
      title: args.title,
      date: args.date,
      time: args.time,
      color: args.color || 'blue'
    };
    events.push(newEvent);
    return newEvent;
  },

  delete_event: (args) => {
    const originalLength = events.length;
    events = events.filter(e => e.id !== args.id);
    if (events.length === originalLength) {
      return { success: false, message: `Event with ID ${args.id} not found.` };
    }
    return { success: true, message: `Event #${args.id} successfully cancelled and removed.` };
  },

  // --- Real email implementations ---
  list_emails: (args) => {
    if (args && args.folder) {
      return emails.filter(e => e.folder.toLowerCase() === args.folder?.toLowerCase());
    }
    return emails;
  },

  /**
   * Robustly parses and filters emails using tokenized queries and search operators.
   */
  search_emails: (args) => {
    const queryStr = args.query || "";
    
    // 1. Regular expression to extract tokens like key:value, key:"longer value", or standalone terms
    const tokenRegex = /(?:(\b\w+):(?:([^"\s]+)|"([^"]+)"))|(?:([^"\s]+)|"([^"]+)")/g;
    
    const filters = {
      from: [],
      subject: [],
      body: [],
      generic: []
    };

    let match;
    while ((match = tokenRegex.exec(queryStr)) !== null) {
      const key = match[1]?.toLowerCase();
      const value = (match[2] || match[3] || match[4] || match[5] || "").toLowerCase().trim();

      if (!value) continue;

      if (key === "from") {
        filters.from.push(value);
      } else if (key === "subject") {
        filters.subject.push(value);
      } else if (key === "body") {
        filters.body.push(value);
      } else {
        filters.generic.push(value);
      }
    }

    if (
      filters.from.length === 0 &&
      filters.subject.length === 0 &&
      filters.body.length === 0 &&
      filters.generic.length === 0
    ) {
      return emails;
    }

    // 2. Filter the emails list against our parsed tokens
    return emails.filter((e) => {
      const senderName = e.senderName.toLowerCase();
      const senderEmail = e.senderEmail.toLowerCase();
      const subject = e.subject.toLowerCase();
      const body = e.body.toLowerCase();

      // Check specific 'from:' conditions (ALL must match if provided)
      if (filters.from.length > 0) {
        const matchFrom = filters.from.every(term => 
          senderName.includes(term) || senderEmail.includes(term)
        );
        if (!matchFrom) return false;
      }

      // Check specific 'subject:' conditions (ALL must match if provided)
      if (filters.subject.length > 0) {
        const matchSubject = filters.subject.every(term => subject.includes(term));
        if (!matchSubject) return false;
      }

      // Check specific 'body:' conditions (ALL must match if provided)
      if (filters.body.length > 0) {
        const matchBody = filters.body.every(term => body.includes(term));
        if (!matchBody) return false;
      }

      // Check generic search terms (ALL must match, but can match ANY field)
      if (filters.generic.length > 0) {
        const matchGeneric = filters.generic.every(term => 
          senderName.includes(term) ||
          senderEmail.includes(term) ||
          subject.includes(term) ||
          body.includes(term)
        );
        if (!matchGeneric) return false;
      }

      return true;
    });
  },

  send_email: (args) => {
    const newEmail = {
      id: 'em' + Math.random().toString(36).substring(2, 9),
      senderName: 'Me',
      senderEmail: 'you@company.com',
      recipientEmail: args.recipientEmail,
      subject: args.subject,
      body: args.body,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      dateStr: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      folder: 'Sent',
      read: true
    };
    emails.unshift(newEmail);
    return newEmail;
  },

  archive_email: (args) => {
    const index = emails.findIndex(e => e.id === args.id);
    if (index === -1) {
      return { success: false, message: `Email with ID ${args.id} not found.` };
    }
    emails[index].folder = 'Archive';
    return { success: true, message: `Email #${args.id} successfully moved to Archive folder.` };
  },

  delete_email: (args) => {
    const index = emails.findIndex(e => e.id === args.id);
    if (index === -1) {
      return { success: false, message: `Email with ID ${args.id} not found.` };
    }

    if (emails[index].folder === 'Trash') {
      emails = emails.filter(e => e.id !== args.id);
      return { success: true, message: `Email #${args.id} permanently deleted.` };
    } else {
      emails[index].folder = 'Trash';
      return { success: true, message: `Email #${args.id} moved to Trash.` };
    }
  },

  mark_as_read: (args) => {
    const index = emails.findIndex(e => e.id === args.id);
    if (index === -1) return { success: false };
    emails[index].read = args.read;
    return { success: true };
  },

  restore_email: (args) => {
    const index = emails.findIndex(e => e.id === args.id);
    if (index === -1) {
      return { success: false, message: `Email with ID ${args.id} not found.` };
    }
    emails[index].folder = 'Inbox';
    return { success: true, message: `Email #${args.id} successfully restored to Inbox.` };
  }
};