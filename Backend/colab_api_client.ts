// Updated API service to connect to your Colab model

class BiodiversityApiService {
    private static instance: BiodiversityApiService;
    private baseUrl: string;

    private constructor() {
        // This will be the ngrok URL from your Colab notebook
        // Update this URL when you run the Colab server
        this.baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://your-ngrok-url.ngrok-free.app'  // Replace with actual ngrok URL
            : 'http://localhost:5000';
    }

    public static getInstance(): BiodiversityApiService {
        if (!BiodiversityApiService.instance) {
            BiodiversityApiService.instance = new BiodiversityApiService();
        }
        return BiodiversityApiService.instance;
    }

    public setColabUrl(ngrokUrl: string) {
        this.baseUrl = ngrokUrl;
        console.log(`🔗 API URL updated to: ${this.baseUrl}`);
    }

    async checkHealth(): Promise<{ status: string; model: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            if (!response.ok) {
                throw new Error(`Health check failed: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }

    async analyzeAudio(file: File): Promise<BiodiversityAnalysisResult> {
        try {
            const formData = new FormData();
            formData.append('audio', file);

            console.log(`📤 Uploading ${file.name} to Colab model...`);

            const response = await fetch(`${this.baseUrl}/analyze`, {
                method: 'POST',
                body: formData,
                headers: {
                    // Don't set Content-Type, let browser set it for FormData
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Analysis failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('📊 Analysis completed:', result);

            return {
                biodiversity_score: result.biodiversity_score,
                filename: result.filename,
                spectrogram: result.spectrogram,
                distribution_data: result.distribution_data,
                heatmap: result.heatmap,
                raw_adi: result.raw_adi
            };

        } catch (error) {
            console.error('Analysis failed:', error);
            throw error;
        }
    }
}

export interface BiodiversityAnalysisResult {
    biodiversity_score: number;
    filename: string;
    spectrogram?: string;
    distribution_data?: any;
    heatmap?: string;
    raw_adi?: number;
}

export default BiodiversityApiService;