export type FolderType = 'Inbox' | 'Sent' | 'Drafts' | 'Archive' | 'Trash';

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string; // format "YYYY-MM-DD"
  color: 'blue' | 'green' | 'beige' | string;
}

export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  dateStr: string;
  folder: FolderType;
  read: boolean;
}

[{
  id: 'string',
  title: "string",
  time: "string",
  date: 'string', // format "YYYY-MM-DD"
  color: 'string'
}]

[{
  id: "string",
  senderName: "string",
  senderEmail: "string",
  recipientEmail: "string",
  subject: "string",
  body: "string",
  timestamp: "string",
  dateStr: "string",
  folder: "FolderType",
  read: "boolean",
}
]







