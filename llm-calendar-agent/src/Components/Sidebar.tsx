import React from 'react';
import { FolderType, Email } from '../types';
import { Inbox, Send, FileText, Archive, Trash2 } from 'lucide-react';

interface SidebarProps {
  currentFolder: FolderType;
  onSelectFolder: (folder: FolderType) => void;
  emails: Email[];
}

export default function Sidebar({ currentFolder, onSelectFolder, emails }: SidebarProps) {
  // Navigation folders config
  const folders: { type: FolderType; label: string; icon: React.ReactNode }[] = [
    { type: 'Inbox', label: 'Inbox', icon: <Inbox id="icon-inbox" className="w-4 h-4" /> },
    { type: 'Sent', label: 'Sent', icon: <Send id="icon-sent" className="w-4 h-4" /> },
    { type: 'Drafts', label: 'Drafts', icon: <FileText id="icon-drafts" className="w-4 h-4" /> },
    { type: 'Archive', label: 'Archive', icon: <Archive id="icon-archive" className="w-4 h-4" /> },
    { type: 'Trash', label: 'Trash', icon: <Trash2 id="icon-trash" className="w-4 h-4" /> },
  ];

  // Calculate stats dynamically
  const getBadgeValue = (type: FolderType) => {
    if (type === 'Inbox') {
      const unreadCount = emails.filter((e) => e.folder === 'Inbox' && !e.read).length;
      return unreadCount > 0 ? unreadCount : null;
    }
    if (type === 'Drafts') {
      const totalDrafts = emails.filter((e) => e.folder === 'Drafts').length;
      return totalDrafts > 0 ? totalDrafts : null;
    }
    return null;
  };

  return (
    <div id="sidebar-container" className="flex flex-col gap-4">
      <div id="folders-title" className="text-xs font-semibold uppercase tracking-wider text-[#666666] font-mono mb-1">
        Folders
      </div>
      <div id="folders-list" className="flex flex-col gap-2">
        {folders.map(({ type, label, icon }) => {
          const isSelected = type === currentFolder;
          const badgeValue = getBadgeValue(type);

          return (
            <button
              id={`folder-btn-${type.toLowerCase()}`}
              key={type}
              onClick={() => onSelectFolder(type)}
              className={`flex items-center justify-between w-full text-left transition-all duration-200 rounded-lg px-4 py-3 border text-sm font-medium ${
                isSelected
                  ? 'bg-[#3d3d3d] text-white border-[#1d3766] shadow-sm'
                  : 'bg-[#f4f4f4] text-[#222222] border-[#1d3766]/30 hover:border-[#1d3766] hover:bg-[#f8f9fb]'
              }`}
            >
              <div id={`folder-label-group-${type.toLowerCase()}`} className="flex items-center gap-2.5">
                <span className={isSelected ? 'text-white' : 'text-[#2f5fb5]'}>
                  {icon}
                </span>
                <span className="font-sans">{label}</span>
              </div>
              
              {badgeValue !== null && (
                <span
                  id={`folder-badge-${type.toLowerCase()}`}
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                    isSelected
                      ? 'bg-white text-[#3d3d3d]'
                      : 'bg-[#1d3766]/10 text-[#1d3766]'
                  }`}
                >
                  {badgeValue}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div id="sidebar-aesthetic-note" className="mt-auto border-t border-[#1d3766]/10 pt-4 flex flex-col gap-2">
        <div id="aesthetic-company-key" className="text-xs font-mono text-[#666666]">
          System Status: Online
        </div>
        <div id="aesthetic-company-tag" className="text-[10px] font-mono text-[#666666]/70 leading-relaxed">
          SECURE CLIENT LITE v1.2<br />
          Enterprise Network Node
        </div>
      </div>
    </div>
  );
}
