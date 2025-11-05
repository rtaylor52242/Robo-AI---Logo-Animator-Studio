
import React, { useState, useEffect, useCallback } from 'react';
import { generateLogoImage, animateLogo } from './services/geminiService';
import { AspectRatio } from './types';
import { LoadingSpinner, SparklesIcon, VideoIcon, ResetIcon } from './components/icons';

const App: React.FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);
    const [prompt, setPrompt] = useState<string>('A minimalist fox icon for a tech startup');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    
    const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
    const [videoLoadingMessage, setVideoLoadingMessage] = useState<string>('');

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            } else {
                 // Fallback for environments where aistudio is not available
                setApiKeySelected(!!process.env.API_KEY);
            }
        };
        checkApiKey();
    }, []);

    const handleSelectKey = async () => {
        try {
            await window.aistudio.openSelectKey();
            // Optimistically assume key selection is successful.
            setApiKeySelected(true);
        } catch(e) {
            console.error("Error opening select key dialog:", e);
            setError("Could not open API key selection. Please ensure you are in a supported environment.");
        }
    };
    
    const handleGenerateLogo = async () => {
        if (!prompt.trim()) {
            setError('Please enter a description for your logo.');
            return;
        }
        setError(null);
        setIsGeneratingImage(true);
        try {
            const imageData = await generateLogoImage(prompt);
            setGeneratedImage(imageData);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleAnimateLogo = async () => {
        if (!generatedImage) return;
        setError(null);
        setIsGeneratingVideo(true);
        setVideoLoadingMessage('Starting animation process...');
        try {
            const videoUrl = await animateLogo(generatedImage, aspectRatio, setVideoLoadingMessage);
            setGeneratedVideoUrl(videoUrl);
        } catch (e) {
            if (e instanceof Error && e.message.includes("API key is invalid")) {
                 setApiKeySelected(false); // Reset key state to re-prompt user
            }
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    const handleReset = () => {
        setPrompt('A minimalist fox icon for a tech startup');
        setGeneratedImage(null);
        setGeneratedVideoUrl(null);
        setError(null);
        setIsGeneratingImage(false);
        setIsGeneratingVideo(false);
    };

    const renderApiKeyPrompt = () => (
        <div className="w-full max-w-lg mx-auto text-center">
            <div className="bg-gray-800 border border-indigo-500/30 shadow-2xl rounded-xl p-8">
                <h2 className="text-2xl font-bold text-indigo-400 mb-4">Welcome to Robo AI - Logo Animator Studio</h2>
                <p className="text-gray-300 mb-6">
                    To generate video animations with Veo, you need to select a personal API key. 
                    This will be used for billing your usage of the model.
                </p>
                <button
                    onClick={handleSelectKey}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                    Select API Key
                </button>
                <p className="text-xs text-gray-500 mt-4">
                    For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400">billing documentation</a>.
                </p>
            </div>
        </div>
    );
    
    const renderContent = () => {
        if (apiKeySelected === null) {
            return <div className="flex justify-center items-center h-full"><LoadingSpinner className="w-12 h-12" /></div>;
        }
        
        if (!apiKeySelected) {
            return renderApiKeyPrompt();
        }

        if (generatedVideoUrl) {
            return <VideoResult url={generatedVideoUrl} onReset={handleReset} />;
        }
        
        if (generatedImage) {
            return <VideoAnimator 
                image={generatedImage}
                isLoading={isGeneratingVideo}
                loadingMessage={videoLoadingMessage}
                onAnimate={handleAnimateLogo}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
            />;
        }

        return <LogoGenerator 
            prompt={prompt}
            setPrompt={setPrompt}
            isLoading={isGeneratingImage}
            onGenerate={handleGenerateLogo}
        />;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-dots-pattern">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                        Robo AI - Logo Animator Studio
                    </span>
                </h1>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                    Design your brand's identity and bring it to life with AI-powered generation and animation.
                </p>
            </header>
            <main className="w-full max-w-4xl">
                 {error && <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 text-center" role="alert">{error}</div>}
                 {renderContent()}
            </main>
            <style jsx global>{`
                .bg-dots-pattern {
                    background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
};


const LogoGenerator: React.FC<{
    prompt: string,
    setPrompt: (p: string) => void,
    isLoading: boolean,
    onGenerate: () => void,
}> = ({ prompt, setPrompt, isLoading, onGenerate }) => (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-indigo-500/20 shadow-2xl rounded-xl p-8 transition-all duration-300">
        <h2 className="text-2xl font-bold text-center text-indigo-400 mb-2">Step 1: Design Your Logo</h2>
        <p className="text-center text-gray-400 mb-6">Describe your company and the logo you envision.</p>
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A minimalist fox icon for a tech startup"
            className="w-full h-28 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
            disabled={isLoading}
        />
        <button
            onClick={onGenerate}
            disabled={isLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-indigo-800 disabled:cursor-not-allowed disabled:scale-100"
        >
            {isLoading ? (
                <>
                    <LoadingSpinner className="w-6 h-6" />
                    Generating...
                </>
            ) : (
                <>
                    <SparklesIcon />
                    Generate Logo
                </>
            )}
        </button>
    </div>
);

const VideoAnimator: React.FC<{
    image: string,
    isLoading: boolean,
    loadingMessage: string,
    onAnimate: () => void,
    aspectRatio: AspectRatio,
    setAspectRatio: (ar: AspectRatio) => void,
}> = ({ image, isLoading, loadingMessage, onAnimate, aspectRatio, setAspectRatio }) => (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-purple-500/20 shadow-2xl rounded-xl p-8 transition-all duration-300">
        <h2 className="text-2xl font-bold text-center text-purple-400 mb-6">Step 2: Animate Your Logo</h2>
        <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 flex-shrink-0">
                <img src={image} alt="Generated Logo" className="rounded-lg shadow-lg bg-white/10 p-2" />
            </div>
            <div className="w-full md:w-2/3 flex flex-col gap-6">
                <div>
                    <label className="block text-gray-300 font-semibold mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                        {(['16:9', '9:16'] as AspectRatio[]).map(ar => (
                             <button key={ar} onClick={() => setAspectRatio(ar)} disabled={isLoading} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed ${aspectRatio === ar ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {ar} {ar === '16:9' ? '(Landscape)' : '(Portrait)'}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={onAnimate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-purple-800 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isLoading ? (
                        <>
                           <LoadingSpinner className="w-6 h-6" />
                           {loadingMessage}
                        </>
                    ) : (
                        <>
                           <VideoIcon />
                           Animate Logo
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
);

const VideoResult: React.FC<{
    url: string,
    onReset: () => void
}> = ({ url, onReset }) => (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-green-500/20 shadow-2xl rounded-xl p-8 transition-all duration-300">
        <h2 className="text-2xl font-bold text-center text-green-400 mb-6">Your Animated Logo is Ready!</h2>
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video src={url} controls autoPlay loop className="w-full h-full object-contain" />
        </div>
        <button
            onClick={onReset}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 ease-in-out"
        >
            <ResetIcon />
            Start Over
        </button>
    </div>
);


export default App;