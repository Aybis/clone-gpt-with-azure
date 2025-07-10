import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { getAvailableModels, getAllModels, getProviderInfo, isSpecificProviderConfigured } from '../config/ai-providers';
import { AIModel, AIProvider } from '../types/ai-providers';

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  onProviderChange?: (provider: AIProvider) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelSelect, onProviderChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentProvider, providerInfo } = useAI();

  // Get models grouped by provider
  const allModels = getAllModels();
  
  // Group models by provider for display
  const configuredProviders = ['azure', 'openai', 'gemini'].filter(provider => 
    isSpecificProviderConfigured(provider as AIProvider)
  ) as AIProvider[];
  
  const modelsByProvider = configuredProviders.reduce((acc, provider) => {
    const models = getAvailableModels(provider);
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[provider] = models;
    return acc;
  }, {} as Record<AIProvider, AIModel[]>);

  const currentModel = allModels.find(m => m.id === selectedModel);

  const formatCost = (cost?: number) => {
    if (!cost) return 'Free tier';
    return `$${cost.toFixed(4)}/1K tokens`;
  };

  const getProviderColor = (provider: AIProvider) => {
    const info = getProviderInfo(provider);
    switch (info.color) {
      case 'blue': return 'text-blue-600 bg-blue-50';
      case 'green': return 'text-green-600 bg-green-50';
      case 'purple': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
      >
        <span className="text-lg">{providerInfo.icon}</span>
        <span>{currentModel?.name || 'Select Model'}</span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-zinc-300 z-50 overflow-hidden max-h-96 overflow-y-auto">
            <div className="p-1">
              <div className="px-3 py-2 text-xs text-zinc-500 font-medium flex items-center gap-2 border-b border-zinc-200">
                <Info size={12} />
                Available AI Models
              </div>
              

              {/* All Configured Providers */}
              {Object.entries(modelsByProvider).map(([provider, models]) => {
                const info = getProviderInfo(provider as AIProvider);
                const isCurrentProvider = provider === currentProvider;
                
                return (
                  <div key={provider} className="py-2 border-t border-zinc-100">
                    <div className="px-3 py-1 text-xs font-medium text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                      <span>{info.icon}</span>
                      {info.name} {isCurrentProvider && '(Current)'}
                    </div>
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          onModelSelect(model.id);
                          if (onProviderChange && model.provider !== currentProvider) {
                            onProviderChange(model.provider);
                          }
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 p-3 hover:bg-zinc-50 transition-colors text-left ${
                          selectedModel === model.id ? 'bg-zinc-50' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-zinc-900">{model.name}</span>
                            <span className={`px-1.5 py-0.5 text-xs rounded-full ${getProviderColor(model.provider)}`}>
                              {info.icon}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500 mb-1">{model.description}</div>
                          <div className="text-xs text-zinc-400">
                            {formatCost(model.costPer1kTokens)} • {model.maxTokens.toLocaleString()} tokens
                          </div>
                        </div>
                        {selectedModel === model.id && (
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-zinc-200 p-3 bg-zinc-50">
              <div className="text-xs text-zinc-600">
                <p className="font-medium mb-1">{configuredProviders.length} Provider{configuredProviders.length !== 1 ? 's' : ''} Available</p>
                <p>Switch between providers by selecting their models above.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector;