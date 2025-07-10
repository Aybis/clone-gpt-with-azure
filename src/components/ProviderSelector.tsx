import React, { useState } from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import { AIProvider } from '../types/ai-providers';
import { getProviderInfo, getAllProviders } from '../config/ai-providers';

interface ProviderSelectorProps {
  currentProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  isConfigured: boolean;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  currentProvider,
  onProviderChange,
  isConfigured
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const providers = getAllProviders();
  const currentProviderInfo = getProviderInfo(currentProvider);

  const getProviderStatus = (provider: AIProvider) => {
    // You can add logic here to check if each provider is configured
    // For now, we'll just show the current one as configured
    return provider === currentProvider && isConfigured;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors text-sm font-medium w-full"
      >
        <span className="text-lg">{currentProviderInfo.icon}</span>
        <div className="flex-1 text-left">
          <div className="font-medium">{currentProviderInfo.name}</div>
          <div className="text-xs text-zinc-500">
            {isConfigured ? 'Connected' : 'Mock Mode'}
          </div>
        </div>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-zinc-300 z-50 overflow-hidden">
            <div className="p-1">
              <div className="px-3 py-2 text-xs text-zinc-500 font-medium flex items-center gap-2 border-b border-zinc-200">
                <Settings size={12} />
                AI Providers
              </div>
              
              {providers.map((provider) => {
                const info = getProviderInfo(provider);
                const isCurrentProvider = provider === currentProvider;
                const isProviderConfigured = getProviderStatus(provider);
                
                return (
                  <button
                    key={provider}
                    onClick={() => {
                      onProviderChange(provider);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-3 hover:bg-zinc-50 transition-colors text-left ${
                      isCurrentProvider ? 'bg-zinc-50' : ''
                    }`}
                  >
                    <span className="text-lg mt-0.5">{info.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-zinc-900">{info.name}</span>
                        {isCurrentProvider && (
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                            isProviderConfigured 
                              ? 'text-green-600 bg-green-100' 
                              : 'text-yellow-600 bg-yellow-100'
                          }`}>
                            {isProviderConfigured ? 'Active' : 'Mock'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 mb-1">{info.description}</div>
                      <div className="text-xs text-zinc-400">
                        {isProviderConfigured ? 'Ready to use' : 'Configure in .env file'}
                      </div>
                    </div>
                    {isCurrentProvider && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="border-t border-zinc-200 p-3 bg-zinc-50">
              <div className="text-xs text-zinc-600">
                <p className="font-medium mb-1">Configuration Required</p>
                <p>Set VITE_AI_PROVIDER and provider-specific keys in your .env file.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProviderSelector;