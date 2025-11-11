// API service for connecting to the Flask backend or Google Colab
import axios from 'axios';

// Backend API configuration - Using Google Colab with ngrok
let API_BASE_URL = 'https://hemathermal-zoological-madalene.ngrok-free.dev'; // Google Colab server via ngrok
let USE_COLAB = true; // Using Colab server

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL, // Now defaults to Colab URL
  timeout: 120000, // 2 minutes timeout for analysis
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Types for API responses
export interface BiodiversityAnalysisResult {
  biodiversity_score: number;
  adi_score: number;
  spectrogram_b64: string;
  gradcam_b64?: string; // Optional since it's new
  distribution_data: {
    histogram: {
      x: number[];
      y: number[];
      type: string;
      name: string;
      marker: {
        color: string;
        opacity: number;
      };
    };
    user_score: {
      x: number[];
      y: number[];
      type: string;
      mode: string;
      name: string;
      line: {
        color: string;
        width: number;
      };
    };
    benchmarks: Array<{
      x: number[];
      y: number[];
      type: string;
      mode: string;
      name: string;
      line: {
        dash: string;
        width: number;
      };
    }>;
  };
  benchmarks: {
    [key: string]: number;
  };
  filename: string;
  duration: number;
  sample_rate: number;
  file_size_mb: number;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
}

// API service class
class BiodiversityApiService {
  
  /**
   * Switch to using Google Colab model
   */
  switchToColab(_ngrokUrl: string): void {
    // Don't change URL - keep using the correct one
    console.log(`🔗 Staying with correct Colab API: ${API_BASE_URL}`);
  }

  /**
   * Switch back to Colab backend (fallback method)
   */
  switchToRender(): void {
    // Don't change URL - keep using the correct one
    console.log(`🔗 Staying with correct Colab API: ${API_BASE_URL}`);
  }

  /**
   * Get current API configuration
   */
  getCurrentConfig(): { url: string; isColab: boolean } {
    return {
      url: API_BASE_URL,
      isColab: USE_COLAB
    };
  }

  /**
   * Check if the backend server is healthy
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await api.get<HealthCheckResponse>('/health');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Health check failed: ${error.message}`);
      }
      throw new Error('Health check failed: Unknown error');
    }
  }

  /**
   * Analyze an audio file for biodiversity
   */
  async analyzeAudio(audioFile: File): Promise<BiodiversityAnalysisResult> {
    try {
      // Validate file
      this.validateAudioFile(audioFile);

      // Create FormData
      const formData = new FormData();
      formData.append('audio', audioFile);

      // Make request with progress tracking
      const response = await api.post<BiodiversityAnalysisResult>('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${progress}%`);
          }
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.error || error.message;
        throw new Error(`Analysis failed: ${errorMsg}`);
      }
      throw new Error('Analysis failed: Unknown error');
    }
  }

  /**
   * Get server information
   */
  async getServerInfo(): Promise<any> {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Server info failed: ${error.message}`);
      }
      throw new Error('Server info failed: Unknown error');
    }
  }

  /**
   * Validate audio file before upload
   */
  private validateAudioFile(file: File): void {
    // Check file size (50MB limit)
    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`File size must be less than 50MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Check file type
    const allowedTypes = [
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/flac',
      'audio/m4a',
      'audio/ogg',
      'audio/webm',
    ];

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['wav', 'mp3', 'flac', 'm4a', 'ogg', 'webm'];

    const isValidType = allowedTypes.some(type => file.type.includes(type.split('/')[1]));
    const isValidExtension = allowedExtensions.includes(fileExtension || '');

    if (!isValidType && !isValidExtension) {
      throw new Error(`Invalid file type. Supported formats: ${allowedExtensions.join(', ').toUpperCase()}`);
    }
  }

  /**
   * Check if backend is available
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const biodiversityApi = new BiodiversityApiService();

// Export for testing
export { BiodiversityApiService };