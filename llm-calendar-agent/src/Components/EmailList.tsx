import { useState } from 'react';
import { Email } from '../types';
import { Search, Mail, MailOpen, Inbox } from 'lucide-react';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
  folder: string;
}

export default function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
  folder,
}: EmailListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter based on folder AND search query
  const filteredEmails = emails
    .filter((email) => email.folder === folder)
    .filter((email) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        email.senderName.toLowerCase().includes(searchLower) ||
        email.senderEmail.toLowerCase().includes(searchLower) ||
        email.subject.toLowerCase().includes(searchLower) ||
        email.body.toLowerCase().includes(searchLower)
      );
    });

  return (
    <div id="email-list-container" className="flex flex-col h-full bg-white">
      {/* Search Header */}
      <div id="email-search-wrapper" className="relative mb-3">
        <label htmlFor="email-search-input" className="sr-only">Search Team Emails</label>
        <div id="search-icon-container" className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="email-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${folder.toLowerCase()}...`}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2f5fb5] focus:bg-white transition-all font-sans"
        />
        {searchQuery && (
          <button
            id="clear-search-btn"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600 font-mono"
          >
            Clear
          </button>
        )}
      </div>

      {/* Emails Stack */}
      <div id="email-items-scroll-box" className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 max-h-[160px]">
        {filteredEmails.length === 0 ? (
          <div id="email-list-empty" className="flex flex-col items-center justify-center py-6 px-4 border border-dashed border-slate-200 rounded-lg text-center bg-slate-50">
            <Inbox className="w-6 h-6 text-slate-300 mb-1.5" />
            <span className="text-slate-500 text-xs font-medium">
              {searchQuery ? 'No matching emails found' : `Your ${folder.toLowerCase()} is empty`}
            </span>
          </div>
        ) : (
          filteredEmails.map((email) => {
            const isSelected = email.id === selectedEmailId;
            return (
              <button
                id={`email-item-card-${email.id}`}
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`w-full text-left transition-all duration-200 p-2 sm:p-2.5 border rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative ${
                  isSelected
                    ? 'border-[#2f5fb5] bg-[#f8f9fb]/80 ring-1 ring-[#2f5fb5]/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* Header Row: Sender & Timestamp */}
                <div id={`email-header-row-${email.id}`} className="flex justify-between items-baseline mb-0.5">
                  <div id={`sender-group-${email.id}`} className="flex items-center gap-1 min-w-0">
                    {/* Unread Indicator dot */}
                    {!email.read && (
                      <span id={`unread-dot-${email.id}`} className="w-1.5 h-1.5 rounded-full bg-[#2f5fb5]" title="Unread" />
                    )}
                    <span className={`truncate text-xs ${!email.read ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                      {email.senderName}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#666666] font-mono shrink-0 font-medium">
                    {email.timestamp}
                  </span>
                </div>

                {/* Subject Row */}
                <div id={`subject-row-${email.id}`} className={`text-[11px] truncate mb-0.5 ${!email.read ? 'font-semibold text-slate-950' : 'text-[#222222]'}`}>
                  {email.subject}
                </div>

                {/* Body Preview */}
                <p id={`preview-text-${email.id}`} className="text-[11px] text-[#666666] line-clamp-1 pointer-events-none">
                  {email.body.replace(/\n+/g, ' ')}
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
