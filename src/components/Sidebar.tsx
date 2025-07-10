import React, { useState } from 'react';
import ProviderStatus from './ProviderStatus';
import UpgradeModal from './UpgradeModal';
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
  Crown,
  Check
} from 'lucide-react';
import { UserSubscription } from '../services/database';

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
  onSignOut: () => void;
  user: any;
  subscription: UserSubscription | null;
  onUpgrade: () => Promise<void>;
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
  onSignOut,
  user,
  subscription,
  onUpgrade,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

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

  const handleNewChatClick = () => {
    if (subscription?.plan === 'free' && subscription.current_count >= subscription.chat_limit) {
      setShowUpgradeModal(true);
    } else {
      onNewChat();
      if (isOpen) onClose();
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await onUpgrade();
      setShowUpgradeModal(false);
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsUpgrading(false);
    }
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
          onClick={handleNewChatClick}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-zinc-400 hover:bg-zinc-200 transition-all transform hover:scale-105 active:scale-95 text-zinc-700"
        >
          <Plus size={18} />
          <span className="font-medium">New chat</span>
        </button>
        
        {/* Subscription Status */}
        {subscription && (
          <div className="mt-3 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {subscription.plan === 'plus' ? (
                  <Crown size={16} className="text-yellow-500" />
                ) : (
                  <div className="w-4 h-4 bg-zinc-400 rounded-full"></div>
                )}
                <span className="text-sm font-medium text-zinc-700">
                  {subscription.plan === 'plus' ? 'Plus' : 'Free'}
                </span>
              </div>
              {subscription.plan === 'free' && (
                <span className="text-xs text-zinc-500">
                  {subscription.current_count}/{subscription.chat_limit}
                </span>
              )}
            </div>
            {subscription.plan === 'free' && subscription.current_count >= subscription.chat_limit && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full mt-2 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 active:scale-95"
              >
                Upgrade to Plus
              </button>
            )}
          </div>
        )}
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
                    className="p-1 hover:bg-zinc-300 rounded text-zinc-500 hover:text-zinc-700 transition-all transform hover:scale-110 active:scale-95"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-zinc-300 rounded text-zinc-500 hover:text-red-600 transition-all transform hover:scale-110 active:scale-95"
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
            <div className="text-sm font-medium text-zinc-900">
              {user?.email || 'User'}
            </div>
            <div className="text-xs text-zinc-500">Authenticated</div>
          </div>
          <button 
            onClick={onSignOut}
            className="p-1 hover:bg-zinc-200 rounded text-zinc-500"
            title="Sign Out"
          >
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
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <X size={16} />
          </button>
        </div>
        <button
          onClick={handleNewChatClick}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-700 transition-all transform hover:scale-105 active:scale-95 text-white"
        >
          <Edit3 size={18} />
          <span className="font-medium">New chat</span>
        </button>
        
        {/* Subscription Status */}
        {subscription && (
          <div className="mt-3 p-3 rounded-lg bg-zinc-700 border border-zinc-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {subscription.plan === 'plus' ? (
                  <Crown size={16} className="text-yellow-400" />
                ) : (
                  <div className="w-4 h-4 bg-zinc-500 rounded-full"></div>
                )}
                <span className="text-sm font-medium text-white">
                  {subscription.plan === 'plus' ? 'Plus' : 'Free'}
                </span>
              </div>
              {subscription.plan === 'free' && (
                <span className="text-xs text-zinc-400">
                  {subscription.current_count}/{subscription.chat_limit}
                </span>
              )}
            </div>
            {subscription.plan === 'free' && subscription.current_count >= subscription.chat_limit && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full mt-2 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 active:scale-95"
              >
                Upgrade to Plus
              </button>
            )}
          </div>
        )}
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
                    className="p-1 hover:bg-zinc-600 rounded text-zinc-400 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-zinc-600 rounded text-zinc-400 hover:text-red-400 transition-all transform hover:scale-110 active:scale-95"
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
            <div className="text-base font-medium text-white">
              {user?.email || 'User'}
            </div>
            <div className="text-xs text-zinc-400">Authenticated</div>
          </div>
          <button 
            onClick={onSignOut}
            className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all transform hover:scale-105 active:scale-95"
            title="Sign Out"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        isLoading={isUpgrading}
        currentCount={subscription?.current_count || 0}
        limit={subscription?.chat_limit || 5}
      />
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