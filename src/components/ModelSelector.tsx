import React, { useState } from 'react';
import { ChevronDown, Zap, Info } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  description: string;
  subtitle?: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const models: Model[] = [
    {
      id: 'gpt-4',
      name: 'GPT-4o',
      description: 'Great for most tasks',
      subtitle: 'Great for most tasks'
    },
    {
      id: 'o3',
      name: 'o3',
      description: 'Uses advanced reasoning',
      subtitle: 'Uses advanced reasoning'
    },
    {
      id: 'o4-mini',
      name: 'o4-mini',
      description: 'Fastest at advanced reasoning',
      subtitle: 'Fastest at advanced reasoning'
    },
    {
      id: 'o4-mini-high',
      name: 'o4-mini-high',
      description: 'Great at coding and visual reasoning',
      subtitle: 'Great at coding and visual reasoning'
    }
  ];

  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-white hover:bg-gray-700 rounded-lg transition-colors"
      >
        <span className="font-medium text-sm">{currentModel.name}</span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
          <div className="p-1">
            <div className="px-3 py-2 text-xs text-gray-400 font-medium flex items-center gap-2">
              <Info size={12} />
              Models
            </div>
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelSelect(model.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors ${
                  selectedModel === model.id ? 'bg-gray-700' : ''
                }`}
              >
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{model.name}</div>
                  <div className="text-xs text-gray-400">{model.subtitle}</div>
                </div>
                {selectedModel === model.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-700 p-1">
            <button className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 transition-colors text-left">
              <span className="text-sm text-gray-300">More models</span>
              <ChevronDown size={12} className="text-gray-400 ml-auto rotate-270" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;