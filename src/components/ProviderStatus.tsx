import React, { useEffect, useState } from 'react';
import { useAI } from '../hooks/useAI';
import ProviderSelector from './ProviderSelector';
import { CheckCircle, XCircle, AlertCircle, Settings, Loader } from 'lucide-react';

const ProviderStatus: React.FC = () => {
  const { 
    testConnection, 
    getServiceInfo, 
    isConnected, 
    isMockMode, 
    isConfigured, 
    providerInfo,
    currentProvider,
    changeProvider
  } = useAI();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Test connection on component mount
    const runConnectionTest = async () => {
      setIsTestingConnection(true);
      await testConnection();
      setIsTestingConnection(false);
    };

    runConnectionTest();
  }, [testConnection]);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    await testConnection();
    setIsTestingConnection(false);
  };

  const serviceInfo = getServiceInfo();

  const getStatusIcon = () => {
    if (isTestingConnection) {
      return <Loader size={16} className="animate-spin text-blue-500" />;
    }

    if (isMockMode) {
      return <AlertCircle size={16} className="text-yellow-500" />;
    }

    if (isConnected) {
      return <CheckCircle size={16} className="text-green-500" />;
    }

    return <XCircle size={16} className="text-red-500" />;
  };

  const getStatusText = () => {
    if (isTestingConnection) {
      return 'Testing connection...';
    }

    if (isMockMode) {
      return `Mock Mode - ${providerInfo.name}`;
    }

    if (isConnected) {
      return `Connected to ${providerInfo.name}`;
    }

    return `${providerInfo.name} - Not connected`;
  };

  const getStatusColor = () => {
    if (isMockMode) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (isConnected) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div>
      {/* Provider Selector */}
      <div className="mb-4">
        <ProviderSelector
          currentProvider={currentProvider}
          onProviderChange={changeProvider}
          isConfigured={isConfigured}
        />
      </div>
      
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-zinc-700">
            {getStatusText()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 hover:bg-zinc-200 rounded text-zinc-500"
          >
            <Settings size={14} />
          </button>
          
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test
          </button>
        </div>
      </div>

      {showDetails && (
        <div className={`mt-3 p-3 rounded-lg border ${getStatusColor()}`}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="font-medium">Provider:</span>
              <span>{serviceInfo.providerName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Mode:</span>
              <span>{serviceInfo.mode}</span>
            </div>
            
            {serviceInfo.mode !== 'mock' && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium">Configured:</span>
                  <span>{isConfigured ? 'Yes' : 'No'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Endpoint:</span>
                  <span className="truncate ml-2 max-w-32">
                    {serviceInfo.endpoint || 'Not set'}
                  </span>
                </div>
                
                {serviceInfo.deploymentName && (
                  <div className="flex justify-between">
                    <span className="font-medium">Deployment:</span>
                    <span>{serviceInfo.deploymentName}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="font-medium">API Key:</span>
                  <span>{serviceInfo.hasApiKey ? '••••••••' : 'Not set'}</span>
                </div>
              </>
            )}
            
            {isMockMode && (
              <div className="text-xs text-yellow-700 mt-2">
                <p>Using mock responses for development.</p>
                <p>Configure {providerInfo.name} in .env file for production.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderStatus;