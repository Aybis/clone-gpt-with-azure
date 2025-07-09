import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Library, 
  Code, 
  Sparkles, 
  Zap, 
  User,
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  Menu,
  X
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
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onRenameChat
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <button
          onClick={() => {
            onNewChat();
            setIsMobileOpen(false);
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          <span className="font-medium">New chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="p-3 border-b border-gray-700">
        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Library size={18} />
            <span>Library</span>
          </button>
          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Code size={18} />
            <span>Codex</span>
          </button>
          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Sparkles size={18} />
            <span>Sora</span>
          </button>
          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Zap size={18} />
            <span>GPTs</span>
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
                onClick={() => {
                  onChatSelect(chat.id);
                  setIsMobileOpen(false);
                }}
              >
                <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
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
                      className="w-full bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <>
                      <div className="text-sm font-medium truncate">{chat.title}</div>
                      <div className="text-xs text-gray-500 truncate">{chat.preview}</div>
                    </>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(chat.id, chat.title);
                    }}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-gray-700 rounded text-red-400"
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
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User size={16} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Ama</div>
            <div className="text-xs text-gray-400">Free plan</div>
          </div>
          <button className="p-1 hover:bg-gray-800 rounded">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-64 bg-gray-900 text-white h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;