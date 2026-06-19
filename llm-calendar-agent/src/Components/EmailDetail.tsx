import { Email } from '../types';
import { Reply, Forward, Archive, Trash, RefreshCw } from 'lucide-react';

interface EmailDetailProps {
  email: Email | null;
  onReply: (email: Email) => void;
  onForward: (email: Email) => void;
  onArchive: (email: Email) => void;
  onDelete: (email: Email) => void;
  onRestore: (email: Email) => void;
}

export default function EmailDetail({
  email,
  onReply,
  onForward,
  onArchive,
  onDelete,
  onRestore,
}: EmailDetailProps) {
  if (!email) {
    return (
      <div id="email-detail-empty" className="flex flex-col items-center justify-center p-4 sm:p-8 border border-slate-200 rounded-lg text-center w-full max-w-[533px] h-full bg-slate-50/50">
        <div id="logo-icon-box" className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
          <Reply className="w-6 h-6 rotate-180" />
        </div>
        <h4 className="text-[#222222] font-semibold text-sm mb-1">No Email Selected</h4>
        <p className="text-[#666666] text-xs max-w-sm leading-relaxed">
          Select any conversation from the list above to view its metadata, full body history, and available workflow integrations.
        </p>
      </div>
    );
  }

  const isTrash = email.folder === 'Trash';
  const isArchive = email.folder === 'Archive';

  return (
    <div id={`email-detail-card-${email.id}`} className="border border-[#1d3766]/20 rounded-lg p-4 sm:p-5 bg-white shadow-xs flex flex-col w-full max-w-[533px] h-full min-h-0 justify-between">
      {/* Email Header */}
      <div id={`detail-header-${email.id}`} className="mb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug tracking-tight mb-2">
          {email.subject}
        </h3>
        
        <div id="headers-meta-grid" className="flex items-center justify-between text-xs text-slate-600 font-sans border-b border-slate-100 pb-2.5">
          <div id="header-addresses-box" className="flex flex-col gap-0.5">
            <div className="truncate max-w-[200px] sm:max-w-xs">
              <span className="font-semibold text-slate-400">From:</span>{' '}
              <span className="font-medium text-[#222222]">
                {email.senderName} &lt;{email.senderEmail}&gt;
              </span>
            </div>
            <div className="truncate max-w-[200px] sm:max-w-xs">
              <span className="font-semibold text-slate-400">To:</span>{' '}
              <span className="text-slate-700">You &lt;{email.recipientEmail}&gt;</span>
            </div>
          </div>
          <div id="header-date-box" className="text-right text-[#666666] font-mono text-[10px] sm:text-xs">
            {email.dateStr}
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div id="detail-body-scroll" className="flex-1 overflow-y-auto pr-1 text-xs text-slate-700 leading-relaxed font-sans mb-3 min-h-0">
        <div id="email-body-content" className="whitespace-pre-wrap">
          {email.body}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div id="detail-actions-footer" className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-auto">
        <div id="main-actions-group" className="flex items-center gap-1.5">
          {/* Reply Button - Primary action */}
          <button
            id={`action-btn-reply-${email.id}`}
            onClick={() => onReply(email)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#2f5fb5] text-white font-sans text-xs font-semibold rounded-lg hover:bg-[#204994] transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-[#2f5fb5]/50 whitespace-nowrap"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          {/* Forward Button */}
          <button
            id={`action-btn-forward-${email.id}`}
            onClick={() => onForward(email)}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-[#1d3766]/30 bg-white text-[#222222] font-sans text-xs font-medium rounded-lg hover:bg-[#f8f9fb] hover:border-[#1d3766] transition-all cursor-pointer whitespace-nowrap"
          >
            <Forward className="w-3.5 h-3.5 text-[#2f5fb5]" />
            <span>Forward</span>
          </button>
        </div>

        <div id="secondary-actions-group" className="flex items-center gap-1.5">
          {/* Archive / Recover Button */}
          {isArchive ? (
            <button
               id={`action-btn-unarchive-${email.id}`}
              onClick={() => onRestore(email)}
              title="Restore to Inbox"
              className="flex items-center gap-1 px-2.5 py-1.5 border border-[#1d3766]/30 bg-white text-[#222222] font-sans text-xs font-medium rounded-lg hover:bg-[#f8f9fb] hover:border-[#1d3766] transition-all cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">To Inbox</span>
            </button>
          ) : !isTrash ? (
            <button
              id={`action-btn-archive-${email.id}`}
              onClick={() => onArchive(email)}
              title="Archive Email"
              className="flex items-center gap-1 px-2.5 py-1.5 border border-[#1d3766]/30 bg-white text-[#222222] font-sans text-xs font-medium rounded-lg hover:bg-[#f8f9fb] hover:border-[#1d3766] transition-all cursor-pointer whitespace-nowrap"
            >
              <Archive className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Archive</span>
            </button>
          ) : null}

          {/* Delete Button */}
          {!isTrash ? (
            <button
              id={`action-btn-trash-${email.id}`}
              onClick={() => onDelete(email)}
              title="Move to Trash"
              className="flex items-center justify-center p-1.5 border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Trash className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id={`action-btn-restore-${email.id}`}
              onClick={() => onRestore(email)}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-emerald-200 bg-white text-emerald-700 font-sans text-xs font-medium rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
