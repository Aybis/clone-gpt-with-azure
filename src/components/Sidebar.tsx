import React, { useState } from 'react';
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
  Library,
  Code,
  Sparkles,
  Zap,
  FolderOpen,
  Database,
  BookOpen,
  Smartphone,
  Eye
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
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onClose
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
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
        >
          <Plus size={18} />
          <span className="font-medium">New chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${
                  activeChat === chat.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => {
                  onChatSelect(chat.id);
                  onClose();
                }}
              >
                <MessageSquare size={16} className="text-gray-500 flex-shrink-0" />
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
                      className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <div className="text-sm font-medium truncate text-gray-900">{chat.title}</div>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(chat.id, chat.title);
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600"
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
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Ama</div>
            <div className="text-xs text-gray-500">Free plan</div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </>
  );

  const DesktopSidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white"
        >
          <Edit3 size={18} />
          <span className="font-medium">New chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-700">
        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
          <Search size={18} />
          <span>Search chats</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="p-3 border-b border-gray-700">
        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
            <Library size={18} />
            <span>Library</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
            <Code size={18} />
            <span>Codex</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
            <Sparkles size={18} />
            <span>Sora</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
            <Zap size={18} />
            <span>GPTs</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
            <User size={18} />
            <span>Sammy Toyota Sales Assist...</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span>Whimsical Diagrams</span>
          </button>
        </nav>
      </div>

      {/* Projects */}
      <div className="p-3 border-b border-gray-700">
        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
            <FolderOpen size={18} />
            <span>New project</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
            <Smartphone size={18} />
            <span>iOS Dev</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
            <Database size={18} />
            <span>Datasets</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
            <BookOpen size={18} />
            <span>Story Book</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
            <Sparkles size={18} />
            <span>Maya-AI</span>
          </button>
        </nav>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Chats</h3>
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
                  activeChat === chat.id ? 'bg-gray-800' : ''
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
                      className="w-full bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
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
                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
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
      <div className="p-3 border-t border-gray-700 flex-shrink-0">
        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-white">
          <div className="flex items-center gap-3 flex-1">
            <Eye size={18} />
            <span>View plans</span>
          </div>
        </button>
        <div className="text-xs text-gray-400 mt-2 px-3">
          Unlimited access, team features, and more
        </div>
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
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-80 h-screen flex flex-col shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isOpen ? 'bg-white border-r border-gray-200' : 'lg:bg-gray-900 lg:border-r lg:border-gray-700 bg-white border-r border-gray-200'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <div className="lg:hidden">
          <MobileSidebarContent />
        </div>
        <div className="hidden lg:block">
          <DesktopSidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;