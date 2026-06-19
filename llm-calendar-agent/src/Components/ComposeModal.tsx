import React, { useState, useEffect } from 'react';
import { Send, Save, ArrowLeft, AlertCircle } from 'lucide-react';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (to: string, subject: string, body: string, isDraft?: boolean) => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
}

export default function ComposeModal({
  isOpen,
  onClose,
  onSend,
  initialTo = '',
  initialSubject = '',
  initialBody = '',
}: ComposeModalProps) {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState('');

  // Update form if initial values change (e.g., clicking Reply triggers modal update)
  useEffect(() => {
    setTo(initialTo);
    setSubject(initialSubject);
    setBody(initialBody);
    setError('');
  }, [initialTo, initialSubject, initialBody, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!isDraft && !to.trim()) {
      setError('Please specify a recipient email.');
      return;
    }
    if (!isDraft && !subject.trim()) {
      setError('Please specify a subject.');
      return;
    }
    if (!body.trim()) {
      setError('Please write some content before sending.');
      return;
    }

    onSend(to, subject, body, isDraft);
    setTo('');
    setSubject('');
    setBody('');
    setError('');
  };

  return (
    <div id="compose-modal-overlay" className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 rounded-lg p-6">
      <div id="compose-dialog-box" className="bg-white w-full max-w-xl rounded-lg border border-[#1d3766] shadow-xl flex flex-col max-h-[580px]">
        {/* Header */}
        <div id="compose-header" className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div id="compose-header-left" className="flex items-center gap-2">
            <button
              id="compose-back-btn"
              onClick={onClose}
              className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-sans font-bold text-slate-900 text-base">
              {initialSubject.startsWith('Re:') ? 'Compose Reply' : initialSubject.startsWith('Fwd:') ? 'Forward Message' : 'New Message'}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">
            SECURE PORT: 3000
          </span>
        </div>

        {/* Form Container */}
        <form onSubmit={(e) => handleSubmit(e, false)} id="compose-form" className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {error && (
            <div id="compose-error-banner" className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Recipient Input */}
          <div id="compose-to-group" className="flex flex-col gap-1">
            <label htmlFor="to-input" className="text-xs font-semibold text-slate-600 font-sans">
              To <span className="text-rose-500">*</span>
            </label>
            <input
              id="to-input"
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2f5fb5] focus:bg-slate-50/30 transition-all"
            />
          </div>

          {/* Subject Input */}
          <div id="compose-subject-group" className="flex flex-col gap-1">
            <label htmlFor="subject-input" className="text-xs font-semibold text-slate-600 font-sans">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              id="subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject heading"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2f5fb5] focus:bg-slate-50/30 transition-all"
            />
          </div>

          {/* Message Body Input */}
          <div id="compose-body-group" className="flex-1 flex flex-col gap-1 min-h-[160px]">
            <label htmlFor="body-input" className="text-xs font-semibold text-slate-600 font-sans">
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="body-input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi Team,&#10;&#10;Please type your message here..."
              className="w-full flex-1 min-h-[140px] text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2f5fb5] focus:bg-slate-50/30 transition-all font-sans resize-none leading-relaxed"
            />
          </div>
        </form>

        {/* Action Bar */}
        <div id="compose-action-bar" className="px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-lg flex items-center justify-between">
          <button
            id="compose-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 bg-white font-sans text-xs font-semibold rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <div id="compose-action-right" className="flex items-center gap-2">
            {/* Save Draft Button */}
            <button
              id="compose-draft-btn"
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#1d3766]/30 bg-white text-[#222222] font-sans text-xs font-semibold rounded-lg hover:bg-slate-50 hover:border-[#1d3766] transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>

            {/* Send Button */}
            <button
              id="compose-send-btn"
              type="submit"
              onClick={(e) => handleSubmit(e, false)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2f5fb5] text-white font-sans text-xs font-semibold rounded-lg hover:bg-[#204994] transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
