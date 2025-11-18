import React, { useState, useCallback } from 'react';
import { generateColorPalette } from './services/geminiService';
import { ColorPalette } from './types';

// --- Helper Components defined outside the main App component ---

const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.981A10.503 10.503 0 0118 16.5a10.5 10.5 0 01-10.5-10.5c0-1.741.43-3.4 1.197-4.947a.75.75 0 01.831-.334zm6.472 1.06a.75.75 0 01.981.981 8.97 8.97 0 00-.69 3.463a9 9 0 00-9-9 8.97 8.97 0 00-3.463.69.75.75 0 01-.981-.981A10.503 10.503 0 016 4.5a10.5 10.5 0 0110.5 10.5c1.741 0 3.4-.43 4.947-1.197a.75.75 0 01.334-.831z"
      clipRule="evenodd"
    />
    <path d="M11.63 5.93a.75.75 0 01.316-.938l3.42-2.022a.75.75 0 01.938.316l2.022 3.42a.75.75 0 01-.316.938l-3.42 2.022a.75.75 0 01-.938-.316l-2.022-3.42a.75.75 0 010-.316.75.75 0 01.316-.622zM8.57 8.204a.75.75 0 01.316-.938l2.973-1.76a.75.75 0 01.938.316l1.76 2.974a.75.75 0 01-.316.938l-2.973 1.76a.75.75 0 01-.938-.316l-1.76-2.974a.75.75 0 010-.316.75.75 0 01.316-.622z" />
  </svg>
);

const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-pink-500"></div>
    <p className="text-gray-500">Conjuring up some colors...</p>
  </div>
);

interface PaletteDisplayProps {
  palette: ColorPalette;
}
const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ palette }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      <div className="flex flex-wrap justify-center items-start gap-4 md:gap-6 mb-8">
        {palette.colors.map((color) => (
          <div key={color} className="flex flex-col items-center group space-y-2">
            <div
              className="w-20 h-20 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: color }}
            />
            <span className="mt-2 text-sm font-mono text-gray-600">
              {color}
            </span>
            <button
              onClick={() => handleCopy(color)}
              className="px-4 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-pink-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition-all duration-200 w-24 text-center"
            >
              {copiedColor === color ? 'Copied!' : 'Copy Hex'}
            </button>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-pink-600 mb-2">Aesthetic Justification</h3>
        <p className="text-gray-700 leading-relaxed">{palette.justification}</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [mood, setMood] = useState('');
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mood.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setPalette(null);

    try {
      const result = await generateColorPalette(mood);
      setPalette(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [mood, isLoading]);

  return (
    <main className="min-h-screen bg-[#F5F5F5] text-gray-800 flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(192,_132,_252,_0.05),_transparent_40%)]"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
              Smart Color Palette
            </span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Generate beautiful color schemes from a single word.</p>
        </header>

        <form onSubmit={handleGenerate} className="w-full max-w-lg mb-12">
          <div className="relative flex items-center">
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Ketikkan Mood Desain Anda (e.g., Rustic, Futuristik)"
              className="w-full pl-5 pr-28 py-4 text-lg bg-white/80 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300 placeholder-gray-400 text-gray-800 truncate"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !mood.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center gap-2 h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <MagicWandIcon className="w-5 h-5" />
              <span>Generate</span>
            </button>
          </div>
        </form>

        <div className="w-full flex items-center justify-center min-h-[300px]">
          {isLoading && <Loader />}
          {error && <p className="text-red-500 bg-red-100/50 px-4 py-2 rounded-md">{error}</p>}
          {palette && <PaletteDisplay palette={palette} />}
          {!isLoading && !palette && !error && (
            <div className="text-gray-500">
              <p>Enter a mood or keyword to begin.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default App;