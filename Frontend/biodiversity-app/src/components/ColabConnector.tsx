// Colab connection component for switching between Render and Colab APIs
import React, { useState, useEffect } from 'react';
import { biodiversityApi } from '../services/api';

interface ColabConnectorProps {
  onConnectionChange?: (isConnected: boolean, isColab: boolean) => void;
}

const ColabConnector: React.FC<ColabConnectorProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isColab, setIsColab] = useState(true);
  const [status, setStatus] = useState('Connecting to Colab...');
  const [isLoading, setIsLoading] = useState(false);

  // Check connection on component mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await biodiversityApi.healthCheck();
      setIsConnected(true);
      setStatus('✅ Connected to Colab server');
      onConnectionChange?.(true, true);
    } catch {
      setIsConnected(false);
      setStatus('❌ Failed to connect to Colab');
      onConnectionChange?.(false, true);
    }
  };

  const connectToColab = async () => {
    setIsLoading(true);
    try {
      // Test connection with the configured URL
      const health = await biodiversityApi.healthCheck();
      
      setIsConnected(true);
      setIsColab(true);
      setStatus('✅ Connected to Colab server');
      onConnectionChange?.(true, true);
      
      console.log('✅ Colab connection successful:', health);
      
    } catch (error) {
      setIsConnected(false);
      setIsColab(false);
      setStatus('❌ Failed to connect to Colab');
      onConnectionChange?.(false, false);
      
      console.log('❌ Failed to connect to Colab:', error);
      
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-connect on component mount
  useEffect(() => {
    connectToColab();
  }, []);

  return null; // Component doesn't render anything visible
};

export default ColabConnector;