// Quick setup to switch your frontend to use Colab API
// Add this to your main component or App.tsx

import React, { useEffect, useState } from 'react';
import BiodiversityApiService from './colab_api_client';

const ColabConnector = () => {
    const [colabUrl, setColabUrl] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState('Not connected');

    const apiService = BiodiversityApiService.getInstance();

    const connectToColab = async () => {
        if (!colabUrl.trim()) {
            alert('Please enter your Colab ngrok URL');
            return;
        }

        try {
            apiService.setColabUrl(colabUrl);
            const health = await apiService.checkHealth();
            setIsConnected(true);
            setStatus(`Connected! Model: ${health.model}`);
            console.log('✅ Successfully connected to Colab model');
        } catch (error) {
            setIsConnected(false);
            setStatus(`Connection failed: ${error.message}`);
            console.error('❌ Failed to connect to Colab:', error);
        }
    };

    return (
        <div className="colab-connector p-4 border rounded mb-4">
            <h3 className="text-lg font-semibold mb-2">🔗 Connect to Colab Model</h3>
            
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Colab ngrok URL:
                    </label>
                    <input
                        type="url"
                        value={colabUrl}
                        onChange={(e) => setColabUrl(e.target.value)}
                        placeholder="https://your-ngrok-url.ngrok-free.app"
                        className="w-full p-2 border rounded"
                    />
                </div>
                
                <button
                    onClick={connectToColab}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Connect to Colab
                </button>
                
                <div className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
                    Status: {status}
                </div>
            </div>
            
            {isConnected && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                    ✅ Your frontend is now connected to your trained Colab model!
                    You can now upload audio files for real biodiversity analysis.
                </div>
            )}
        </div>
    );
};

export default ColabConnector;