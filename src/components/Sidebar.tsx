import React, { useState } from 'react';
import ProviderStatus from './ProviderStatus';
import { 
  MessageSquare, 
  Search, 
  Plus,
  Edit3,
  Trash2,
  Menu,
  X,
  User,
  Settings,
} from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

interface SidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRename = (chatId: string, currentTitle: string) => {
    setEditingChat(chatId);
    setEditTitle(currentTitle);
  };

  const saveRename = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingChat(null);
    setEditTitle('');
  };

  const cancelRename = () => {
    setEditingChat(null);
    setEditTitle('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const MobileSidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-zinc-300">
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-zinc-400 hover:bg-zinc-200 transition-colors text-zinc-700"
        >
          <Plus size={18} />
          <span className="font-medium">New chat</span>
        </button>
      </div>

      {/* Provider Status */}
      <div className="p-4 border-b border-zinc-300">
        <ProviderStatus />
      </div>

      {/* Search */}
      <div className="p-4 border-b border-zinc-300">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </form>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer ${
                  activeChat === chat.id ? 'bg-zinc-200' : ''
                }`}
                onClick={() => {
                  onChatSelect(chat.id);
                  onClose();
                }}
              >
                <MessageSquare size={16} className="text-zinc-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {editingChat === chat.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(chat.id);
                        if (e.key === 'Escape') cancelRename();
                      }}
                      onBlur={() => saveRename(chat.id)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <div className="text-sm font-medium truncate text-zinc-900">{chat.title}</div>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(chat.id, chat.title);
                    }}
                    className="p-1 hover:bg-zinc-300 rounded text-zinc-500 hover:text-zinc-700"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-zinc-300 rounded text-zinc-500 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-zinc-900">Ama</div>
            <div className="text-xs text-zinc-500">Free plan</div>
          </div>
          <button className="p-1 hover:bg-zinc-200 rounded text-zinc-500">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </>
  );

  const DesktopSidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-3 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium">ChatGPT</span>
          <button
            onClick={onToggleCollapse}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-700 transition-colors text-white"
        >
          <Edit3 size={18} />
          <span className="font-medium">New chat</span>
        </button>
      </div>

      {/* Provider Status */}
      <div className="p-3 border-b border-zinc-700">
        <ProviderStatus />
      </div>

      {/* Search */}
      <div className="p-3 border-b border-zinc-700">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-white placeholder-zinc-400"
            />
          </div>
        </form>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Chats</h3>
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer ${
                  activeChat === chat.id ? 'bg-zinc-700' : ''
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex-1 min-w-0">
                  {editingChat === chat.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(chat.id);
                        if (e.key === 'Escape') cancelRename();
                      }}
                      onBlur={() => saveRename(chat.id)}
                      className="w-full bg-zinc-600 border border-zinc-500 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                      autoFocus
                    />
                  ) : (
                    <div className="text-sm text-white truncate">{chat.title}</div>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(chat.id, chat.title);
                    }}
                    className="p-1 hover:bg-zinc-600 rounded text-zinc-400 hover:text-white"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-zinc-600 rounded text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-700 flex-shrink-0">
        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-base font-medium text-white">Ama</div>
            <div className="text-xs text-zinc-400">Free plan</div>
          </div>
          <button className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0 h-screen flex flex-col shadow-sm
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-80 lg:opacity-100'}
        w-80
        ${isOpen ? 'bg-zinc-100 border-r border-zinc-300' : 'lg:bg-zinc-800 lg:border-r lg:border-zinc-700 bg-zinc-100 border-r border-zinc-300'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-700"
        >
          <X size={20} />
        </button>

        <div className={`lg:hidden ${isCollapsed ? 'lg:hidden' : ''}`}>
          <MobileSidebarContent />
        </div>
        <div className={`hidden lg:flex lg:flex-col lg:h-full ${isCollapsed ? 'lg:hidden' : ''}`}>
          <DesktopSidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;