
import React, { useState } from 'react';
import { generateLogoImage, animateLogo } from './services/geminiService';
import { AspectRatio } from './types';
import { LoadingSpinner, SparklesIcon, VideoIcon, ResetIcon, QuestionMarkCircleIcon, CloseIcon } from './components/icons';

const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('A minimalist fox icon for a tech startup');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    
    const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
    const [videoLoadingMessage, setVideoLoadingMessage] = useState<string>('');

    const [error, setError] = useState<string | null>(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
    
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

    const renderContent = () => {
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
            <main className="w-full max-w-4xl relative">
                <button 
                    onClick={() => setIsHelpModalOpen(true)}
                    className="absolute -top-4 right-0 md:-top-2 md:-right-2 text-gray-400 hover:text-indigo-400 transition-colors duration-200 z-10 p-2"
                    aria-label="Help"
                >
                    <QuestionMarkCircleIcon className="w-8 h-8" />
                </button>

                 {error && <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 text-center" role="alert">{error}</div>}
                 {renderContent()}
            </main>
            {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
            <style jsx global>{`
                .bg-dots-pattern {
                    background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
};

const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
        >
            <div 
                className="bg-gray-800 border border-indigo-500/30 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative transform transition-all duration-300 scale-95 animate-modal-in"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close help"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 id="help-modal-title" className="text-2xl font-bold text-indigo-400 mb-4">How It Works</h2>
                <div className="space-y-4 text-gray-300">
                    <div>
                        <h3 className="font-semibold text-lg text-white mb-1">Step 1: Design Your Logo</h3>
                        <p>Start by writing a detailed description of the logo you want in the text box. The more specific you are, the better the result! For example, try "A majestic lion head logo, geometric style, gold on a black background".</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-white mb-1">Step 2: Generate the Image</h3>
                        <p>Click the "Generate Logo" button. The AI will take a moment to create a unique logo based on your description.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-white mb-1">Step 3: Animate Your Logo</h3>
                        <p>Once your logo appears, choose your desired video aspect ratio (16:9 for landscape or 9:16 for portrait). Then, click "Animate Logo". This process can take a few minutes as the AI brings your logo to life.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg text-white mb-1">Step 4: View & Start Over</h3>
                        <p>Your animated logo will appear in a video player. You can watch it, and when you're ready to create another, just click "Start Over".</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Got it!
                </button>
            </div>
            <style jsx global>{`
                @keyframes modal-in {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-in {
                    animation: modal-in 0.3s ease-out forwards;
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
