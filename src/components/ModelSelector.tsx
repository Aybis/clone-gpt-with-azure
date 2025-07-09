import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

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
      id: 'gpt-4o',
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
        className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
      >
        <span>{currentModel.name}</span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-1">
              <div className="px-3 py-2 text-xs text-gray-500 font-medium flex items-center gap-2 border-b border-gray-100">
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
                  className={`w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${
                    selectedModel === model.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{model.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{model.subtitle}</div>
                  </div>
                  {selectedModel === model.id && (
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 p-1">
              <button className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 transition-colors text-left">
                <span className="text-sm text-gray-700">More models</span>
                <ChevronDown size={12} className="text-gray-400 ml-auto" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector;