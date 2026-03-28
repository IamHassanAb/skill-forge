import { useState } from 'react';
import ConfidenceBadge from './ConfidenceBadge';
import Sidebar from './Sidebar';

export default function APIKeyScreen({ onKeySubmit, error, isLoading }) {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim() && !isLoading) {
      onKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Scanline Effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(transparent 50%, rgba(0, 0, 0, 0.25) 50%)',
          backgroundSize: '100% 4px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-md w-full z-10 flex flex-col items-center space-y-8 animate-in fade-in duration-700">
        <div className="text-center flex flex-col items-center space-y-4">
          <div className="text-6xl mb-2 drop-shadow-md">📸</div>
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-accent tracking-tighter drop-shadow-sm">
            SkillForge
          </h1>
          <p className="text-zinc-400 text-lg font-medium">
            Your Personal Photography Trainer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="flex flex-col space-y-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Groq API key"
              className={`bg-zinc-900 border ${error ? 'border-red-500/50' : 'border-zinc-700'} text-white font-mono p-3 rounded-lg w-full focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-zinc-600 disabled:opacity-50`}
              disabled={isLoading}
              required
            />
            {error && (
              <p className="text-red-400 font-mono text-xs pl-1">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !apiKey.trim()}
            className="bg-accent text-black font-bold font-mono px-6 py-3 rounded-lg w-full hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Begin Training'}
          </button>
        </form>
      </div>
    </div>
  );
}
