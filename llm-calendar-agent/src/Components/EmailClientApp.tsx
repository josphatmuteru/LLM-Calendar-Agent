import { useState, useEffect } from 'react';
import { Email, FolderType } from '../types';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import EmailDetail from './EmailDetail';
import ComposeModal from './ComposeModal';
import { Mail, CheckCircle, Info, Feather } from 'lucide-react';







const INITIAL_EMAILS: Email[] = [
  {
    id: '1',
    senderName: 'Sarah Johnson',
    senderEmail: 'sarah.johnson@company.com',
    recipientEmail: 'you@company.com',
    subject: 'Project Update',
    body: `Hi Team,

I wanted to share the latest progress on the project. We completed the testing phase and are moving into deployment next week.

Please review the attached documentation before our meeting.

Regards,
Sarah`,
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
    body: `Dear Customer,

This is a friendly reminder that invoice #10294 is due today. Please log into the company payment portal to execute your transaction. 

For any questions or adjustments, please contact billing.

Best regards,
Acme Accounting`,
    timestamp: 'Yesterday',
    dateStr: 'Jun 12, 2026',
    folder: 'Inbox',
    read: true,
  },
  {
    id: '3',
    senderName: 'Marketing Team',
    senderEmail: 'marketing@company.com',
    recipientEmail: 'you@company.com',
    subject: 'Weekly Newsletter Feedback',
    body: `Hi everyone,

We are planning to launch a weekly newsletter for internal updates. Please let us know your suggestions for the layout visual structure and what departments you'd like represented.

Thanks,
Marketing Team`,
    timestamp: 'Jun 12',
    dateStr: 'Jun 12, 2026',
    folder: 'Inbox',
    read: true,
  },
  {
    id: '4',
    senderName: 'HR Department',
    senderEmail: 'hr@company.com',
    recipientEmail: 'you@company.com',
    subject: 'Welcome New Team Members!',
    body: `Let us warmly welcome John and Chloe who joined the engineering team this week!

Be sure to say hello and assist with their onboarding checklist.

Best,
HR Team`,
    timestamp: 'Jun 10',
    dateStr: 'Jun 10, 2026',
    folder: 'Sent',
    read: true,
  },
  {
    id: '5',
    senderName: 'Me',
    senderEmail: 'you@company.com',
    recipientEmail: 'boss@company.com',
    subject: '[Draft] Project Proposal: API Gateway Strategy',
    body: `Drafting notes on the new API gateway migration strategy. 

We will transition off the legacy reverse proxy by installing modern Node.js edge load balancers, and setup standard port bindings to route traffic on 3000.`,
    timestamp: 'Jun 09',
    dateStr: 'Jun 09, 2026',
    folder: 'Drafts',
    read: true,
  },
  {
    id: '6',
    senderName: 'David Miller',
    senderEmail: 'david.miller@company.com',
    recipientEmail: 'you@company.com',
    subject: 'Q3 Roadmap & Engineering Capacity',
    body: `Hi team, let's get together on Monday at 10 AM to walk through our engineering capacity and deliverables for Q3. We need to lock down the scope for our core services.

Regards,
David`,
    timestamp: 'Jun 08',
    dateStr: 'Jun 08, 2026',
    folder: 'Archive',
    read: true,
  },
  {
    id: '7',
    senderName: 'Promo Team',
    senderEmail: 'spamteam@promos.com',
    recipientEmail: 'you@company.com',
    subject: 'Unsubscribe! Get cheap luxury beach vacations!',
    body: `You won a free trip to a tropical island paradise! Just click this suspicious link to claim your coordinates.

Luxury beaches are waiting for your arrival today!`,
    timestamp: 'Jun 05',
    dateStr: 'Jun 05, 2026',
    folder: 'Trash',
    read: true,
  }
];

export default function EmailClientApp() {
  const [emails, setEmails] = useState<Email[]>(() => {
    const saved = localStorage.getItem('company_emails_client');
    return saved ? JSON.parse(saved) : INITIAL_EMAILS;
  });

  const [selectedFolder, setSelectedFolder] = useState<FolderType>('Inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>('1');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composePreset, setComposePreset] = useState<{ to: string; subject: string; body: string }>({
    to: '',
    subject: '',
    body: '',
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
const baseUrl = import.meta.env.VITE_API_BASE_URL || ''; 
  // Sync state with server backend and localStorage
  const syncWithServer = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/emails`);
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        setEmails(json.data);
        localStorage.setItem('company_emails_client', JSON.stringify(json.data));
      }
    } catch (err) {
      console.error('Failed to sync emails with server:', err);
    }
  };

  useEffect(() => {
    syncWithServer();
    const interval = setInterval(syncWithServer, 2000);
    return () => clearInterval(interval);
  }, []);

  // Sync state with local storage/server when altered by scenario transitions or AI Agent custom tools
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('company_emails_client');
      if (saved) {
        setEmails(JSON.parse(saved));
        // Reset selected email to the first one available in the folder
        const list = JSON.parse(saved) as Email[];
        if (list.length > 0) {
          setSelectedEmailId(list[0].id);
        } else {
          setSelectedEmailId(null);
        }
      }
      syncWithServer();
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('agent-tools-update', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('agent-tools-update', handleSync);
    };
  }, []);

  // Toast auto-expiry
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Find the currently selected email object
  const currentEmail = emails.find((e) => e.id === selectedEmailId) || null;

  // Helper to mark email as read
  const markAsRead = async (id: string) => {
    try {
      await fetch(`${baseUrl}/api/emails/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
      syncWithServer();
    } catch (err) {
      console.error('Failed to mark email as read on server:', err);
    }
  };

  // Switch folder workflow
  const handleSelectFolder = (folder: FolderType) => {
    setSelectedFolder(folder);
    const folderEmails = emails.filter((e) => e.folder === folder);
    if (folderEmails.length > 0) {
      setSelectedEmailId(folderEmails[0].id);
      if (folder === 'Inbox') {
        markAsRead(folderEmails[0].id);
      }
    } else {
      setSelectedEmailId(null);
    }
  };

  // Select email workflow
  const handleSelectEmail = (email: Email) => {
    setSelectedEmailId(email.id);
    if (!email.read) {
      markAsRead(email.id);
    }
  };

  // Open empty compose
  const handleOpenCompose = () => {
    setComposePreset({ to: '', subject: '', body: '' });
    setIsComposeOpen(true);
  };

  // Send or Draft creation handler
  const handleSendEmail = async (to: string, subject: string, body: string, isDraft = false) => {
    try {
      const res = await fetch(`${baseUrl}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: to,
          subject,
          body,
          folder: isDraft ? 'Drafts' : 'Sent'
        })
      });
      const json = await res.json();
      if (json && json.success) {
        setIsComposeOpen(false);
        handleSelectFolder(isDraft ? 'Drafts' : 'Sent');
        setToast({
          message: isDraft ? 'Email saved to Drafts folder.' : 'Email sent successfully!',
          type: isDraft ? 'info' : 'success',
        });
        syncWithServer();
      }
    } catch (err) {
      console.error('Failed to send/save email on server:', err);
    }
  };

  // Reply handler prefilled
  const handleReply = (original: Email) => {
    setComposePreset({
      to: original.senderEmail,
      subject: original.subject.startsWith('Re:') ? original.subject : `Re: ${original.subject}`,
      body: `\n\n-------------\nFrom: ${original.senderName} (${original.senderEmail})\nOn ${original.dateStr} wrote:\n> ${original.body.split('\n').join('\n> ')}`,
    });
    setIsComposeOpen(true);
  };

  // Forward handler prefilled
  const handleForward = (original: Email) => {
    setComposePreset({
      to: '',
      subject: original.subject.startsWith('Fwd:') ? original.subject : `Fwd: ${original.subject}`,
      body: `\n\n-------------\nForwarded message:\nFrom: ${original.senderName} (${original.senderEmail})\nDate: ${original.dateStr}\nSubject: ${original.subject}\nTo: ${original.recipientEmail}\n\n${original.body}`,
    });
    setIsComposeOpen(true);
  };

  // Archive handler
  const handleArchive = async (target: Email) => {
    try {
      await fetch(`${baseUrl}/api/emails/${target.id}/archive`, {
        method: 'PUT'
      });
      setToast({ message: 'Email moved to Archive.', type: 'info' });
      
      // Select the next email inside the same active folder
      const remaining = emails.filter((e) => e.folder === selectedFolder && e.id !== target.id);
      if (remaining.length > 0) {
        setSelectedEmailId(remaining[0].id);
      } else {
        setSelectedEmailId(null);
      }
      syncWithServer();
    } catch (err) {
      console.error('Failed to archive email on server:', err);
    }
  };

  // Trash/Delete handler
  const handleDelete = async (target: Email) => {
    try {
      await fetch(`${baseUrl}/api/emails/${target.id}`, {
        method: 'DELETE'
      });
      setToast({ message: target.folder === 'Trash' ? 'Email permanently deleted.' : 'Email moved to Trash.', type: 'info' });

      // Select the next email
      const remaining = emails.filter((e) => e.folder === selectedFolder && e.id !== target.id);
      if (remaining.length > 0) {
        setSelectedEmailId(remaining[0].id);
      } else {
        setSelectedEmailId(null);
      }
      syncWithServer();
    } catch (err) {
      console.error('Failed to delete email on server:', err);
    }
  };

  // Restore/Move to inbox handler
  const handleRestore = async (target: Email) => {
    try {
      await fetch(`${baseUrl}/api/emails/${target.id}/restore`, {
        method: 'PUT'
      });
      setToast({ message: 'Email restored to Inbox.', type: 'success' });

      // Select the next email
      const remaining = emails.filter((e) => e.folder === selectedFolder && e.id !== target.id);
      if (remaining.length > 0) {
        setSelectedEmailId(remaining[0].id);
      } else {
        setSelectedEmailId(null);
      }
      syncWithServer();
    } catch (err) {
      console.error('Failed to restore email on server:', err);
    }
  };

  return (
    <div id="app-viewport-wrapper" className="w-full max-w-[100%] flex flex-col items-center">
      
      {/* Centered Application Card Frame */}
      <div 
        id="app-main-card" 
        className="w-full h-[540px] bg-white border border-[#1d3766] rounded-lg shadow-md p-4 sm:p-6 flex flex-col relative overflow-hidden"
      >
        {/* Dynamic Compose Modal Sheet */}
        <ComposeModal
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          onSend={handleSendEmail}
          initialTo={composePreset.to}
          initialSubject={composePreset.subject}
          initialBody={composePreset.body}
        />

        {/* Dynamic Expiring Toast Notification */}
        {toast && (
          <div 
            id="toast-notification"
            className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg border text-xs font-semibold flex items-center gap-2 z-40 transition-all duration-300 animate-bounce`}
            style={{
              backgroundColor: toast.type === 'success' ? '#f0fdf4' : '#f0f9ff',
              borderColor: toast.type === 'success' ? '#bbf7d0' : '#bae6fd',
              color: toast.type === 'success' ? '#166534' : '#0369a1',
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <Info className="w-4 h-4 text-[#2f5fb5]" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Card Header */}
        <div id="card-header" className="flex items-center justify-between border-b border-[#1d3766]/10 pb-4 md:pb-5 mb-4 md:mb-5 shrink-0">
          <div id="header-left-title" className="flex items-center gap-3">
            <div id="company-logo-avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1d3766]/5 border border-[#1d3766]/20 flex items-center justify-center text-[#2f5fb5]">
              <Mail className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <h1 id="selected-folder-title" className="text-2xl sm:text-[34px] font-sans font-extrabold text-[#222222] tracking-tight transition-all">
              {selectedFolder}
            </h1>
          </div>

          {/* Action Header Button: Compose */}
          <button
            id="compose-action-btn"
            onClick={handleOpenCompose}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#2f5fb5] text-white font-sans text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#1d4691] transition-all cursor-pointer shadow-sm shadow-[#2f5fb5]/10 active:scale-98 animate-none"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Compose</span>
          </button>
        </div>

        {/* Mobile Horizontal Navigation Tabs */}
        <div id="mobile-folder-nav" className="flex md:hidden items-center gap-2 overflow-x-auto pb-3 mb-3 shrink-0 no-scrollbar border-b border-slate-100">
          {(['Inbox', 'Sent', 'Drafts', 'Archive', 'Trash'] as FolderType[]).map((folderName) => {
            const isSelected = folderName === selectedFolder;
            let badgeCount = null;
            if (folderName === 'Inbox') {
              const count = emails.filter((e) => e.folder === 'Inbox' && !e.read).length;
              if (count > 0) badgeCount = count;
            } else if (folderName === 'Drafts') {
              const count = emails.filter((e) => e.folder === 'Drafts').length;
              if (count > 0) badgeCount = count;
            }

            return (
              <button
                id={`mobile-folder-btn-${folderName.toLowerCase()}`}
                key={folderName}
                onClick={() => handleSelectFolder(folderName)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-[#3d3d3d] text-white border-transparent shadow-xs'
                    : 'bg-[#f4f4f4] text-[#222222] border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{folderName}</span>
                {badgeCount !== null && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-white text-[#3d3d3d]' : 'bg-[#1d3766]/10 text-[#1d3766]'}`}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Card Body - Dual Section split layout */}
        <div id="card-body-layout" className="flex-1 flex gap-6 overflow-hidden min-h-0">
          
          {/* Left Sidebar (30% Width on Desktop, Hidden on Mobile) */}
          <div id="sidebar-section" className="hidden md:flex md:w-[30%] border-r border-[#1d3766]/10 pr-6 flex-col justify-between h-full shrink-0">
            <Sidebar
              currentFolder={selectedFolder}
              onSelectFolder={handleSelectFolder}
              emails={emails}
            />
          </div>

          {/* Right Main Content Area (100% on Mobile, 70% Width on Desktop) */}
          <div id="main-content-section" className="w-full md:w-[70%] flex flex-col gap-4 md:gap-5 h-full overflow-hidden">
            
            {/* Top Region: Email List scroll stack */}
            <div id="email-list-wrapper" className="flex-none">
              <EmailList
                emails={emails}
                selectedEmailId={selectedEmailId}
                onSelectEmail={handleSelectEmail}
                folder={selectedFolder}
              />
            </div>

            {/* Bottom Region Detail view divider */}
            <div id="detail-border-separator" className="border-t border-dashed border-slate-200" />

            {/* Bottom Region: Email Detail view */}
            <div id="email-detail-wrapper" className="flex-1 min-h-0">
              <EmailDetail
                email={currentEmail}
                onReply={handleReply}
                onForward={handleForward}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onRestore={handleRestore}
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
