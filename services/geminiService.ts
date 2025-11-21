
import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from '../types';

// FIX: Removed the global type definition for window.aistudio as it conflicts with
// a declaration likely provided by the execution environment.
const getGeminiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateLogoImage = async (prompt: string): Promise<string> => {
    try {
        const ai = getGeminiClient();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A professional, modern logo for a company. Description: '${prompt}'. Clean vector style, minimalist, high contrast, on a solid transparent background.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating logo image:", error);
        throw new Error("Failed to generate logo. Please try a different prompt.");
    }
};

export const animateLogo = async (
    imageBase64: string,
    aspectRatio: AspectRatio,
    updateLoadingMessage: (message: string) => void
): Promise<string> => {
    try {
        const ai = getGeminiClient(); // Create new instance to get latest key
        const base64Data = imageBase64.split(',')[1];

        updateLoadingMessage("Initiating animation sequence...");
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: 'A sleek, elegant, and short 3D animation of this logo. The animation should feel premium and modern.',
            image: {
                imageBytes: base64Data,
                mimeType: 'image/png',
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio
            }
        });

        const loadingMessages = [
            "Warming up the animation studio...",
            "Rendering initial frames...",
            "Adding visual effects...",
            "This can take a few minutes...",
            "Finalizing the animation...",
            "Almost there, polishing the details..."
        ];
        let messageIndex = 0;

        while (!operation.done) {
            updateLoadingMessage(loadingMessages[messageIndex % loadingMessages.length]);
            messageIndex++;
            await new Promise(resolve => setTimeout(resolve, 8000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        updateLoadingMessage("Animation complete! Fetching video...");

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation finished, but no download link was provided.");
        }

        // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }
        
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Error animating logo:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes("Requested entity was not found")) {
            throw new Error("Requested entity was not found.");
        }
        throw new Error("Failed to animate logo. Please try again.");
    }
};
