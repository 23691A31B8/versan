
import React, { useState, useEffect } from 'react';
import { AnalysisResult, AnalysisStatus } from './types';
import { analyzeText } from './services/geminiService';
import AnalysisView from './components/AnalysisView';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('plagiarism_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Save history to local storage when it changes
  useEffect(() => {
    localStorage.setItem('plagiarism_history', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    if (inputText.trim().length < 50) {
      setError("Please enter at least 50 characters for a more accurate analysis.");
      return;
    }

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);

    try {
      const analysisResult = await analyzeText(inputText);
      setResult(analysisResult);
      setHistory(prev => [analysisResult, ...prev].slice(0, 10)); // Keep last 10
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const resetAnalysis = () => {
    setInputText('');
    setResult(null);
    setStatus(AnalysisStatus.IDLE);
    setError(null);
  };

  const handleHistoryItemClick = (item: AnalysisResult) => {
    setResult(item);
    setStatus(AnalysisStatus.COMPLETED);
    setInputText(item.originalText);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-shield-alt text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">VeriText</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Originality & Integrity</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <a href="#" className="text-slate-600 hover:text-indigo-600 text-sm font-medium">Research</a>
            <a href="#" className="text-slate-600 hover:text-indigo-600 text-sm font-medium">Standards</a>
            <button className="bg-slate-50 text-slate-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors">
              Help Center
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {status === AnalysisStatus.COMPLETED && result ? (
          <AnalysisView result={result} onReset={resetAnalysis} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Originality Check</h2>
                    <p className="text-slate-500 text-sm mt-1">Paste your text below to analyze for plagiarism.</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">Word Count</p>
                    <p className="text-lg font-bold text-indigo-600">{inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</p>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter your document content here (minimum 50 characters)..."
                    className="w-full h-80 p-5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all resize-none text-slate-700 leading-relaxed font-normal"
                    disabled={status === AnalysisStatus.ANALYZING}
                  />
                  {status === AnalysisStatus.ANALYZING && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center z-10">
                      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-indigo-900 font-bold animate-pulse text-lg">Scanning Database...</p>
                      <p className="text-slate-500 text-sm mt-1">Comparing segments across the web</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-600">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs">
                    <i className="fas fa-info-circle"></i>
                    <span>Supports up to 5,000 words. Using Gemini 3 Flash.</span>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={status === AnalysisStatus.ANALYZING || !inputText.trim()}
                    className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
                      status === AnalysisStatus.ANALYZING || !inputText.trim()
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
                    }`}
                  >
                    Check Originality
                  </button>
                </div>
              </div>

              {/* Tips Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: 'fa-globe', title: 'Global Search', desc: 'Checks against billions of web pages.' },
                  { icon: 'fa-microchip', title: 'AI Driven', desc: 'Advanced NLP pattern recognition.' },
                  { icon: 'fa-lock', title: 'Secure', desc: 'Your data is never stored publicly.' }
                ].map((tip, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <i className={`fas ${tip.icon} text-indigo-600 text-sm`}></i>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase">{tip.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar: History & Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                  <i className="fas fa-history text-slate-400 mr-2"></i>
                  Recent Checks
                </h3>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleHistoryItemClick(item)}
                        className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                      >
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-indigo-600">{item.originalText.substring(0, 50)}...</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.similarityScore > 20 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {100 - item.similarityScore}% Unique
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400">
                    <p className="text-xs">No recent history.</p>
                  </div>
                )}
              </div>

              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold text-lg leading-tight mb-2">Academic Integrity Matters.</h3>
                  <p className="text-indigo-100 text-sm mb-4">VeriText helps researchers and students maintain original standards in writing.</p>
                  <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
                    Read Policy Guide
                  </button>
                </div>
                <i className="fas fa-quote-right absolute -bottom-4 -right-2 text-indigo-500/20 text-8xl"></i>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">© 2024 VeriText Originality Systems. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-xs">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-xs">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-xs">API Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
