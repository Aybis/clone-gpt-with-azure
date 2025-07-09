import React from 'react';
import { X, Crown, Check, Zap } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
  isLoading: boolean;
  currentCount: number;
  limit: number;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  isLoading,
  currentCount,
  limit
}) => {
  if (!isOpen) return null;

  const handleUpgrade = async () => {
    try {
      await onUpgrade();
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-bounce-in">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-zinc-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-500" />
          </button>
          
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Crown size={32} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            Upgrade to Plus
          </h2>
          <p className="text-zinc-600">
            You've reached your chat limit ({currentCount}/{limit})
          </p>
        </div>

        {/* Features */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={14} className="text-green-600" />
              </div>
              <span className="text-zinc-700">Unlimited chat conversations</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={14} className="text-green-600" />
              </div>
              <span className="text-zinc-700">Priority AI response speed</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={14} className="text-green-600" />
              </div>
              <span className="text-zinc-700">Advanced AI models access</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={14} className="text-green-600" />
              </div>
              <span className="text-zinc-700">Export chat history</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap size={20} className="text-blue-600" />
                <span className="text-2xl font-bold text-zinc-900">$9.99</span>
                <span className="text-zinc-600">/month</span>
              </div>
              <p className="text-sm text-zinc-600">Cancel anytime • 7-day free trial</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Upgrading...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Crown size={18} />
                  Start Free Trial
                </div>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 text-zinc-600 hover:text-zinc-800 font-medium transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-zinc-500 text-center">
            By upgrading, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;