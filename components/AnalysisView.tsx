
import React from 'react';
import { AnalysisResult } from '../types';
import OriginalityMeter from './OriginalityMeter';

interface AnalysisViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onReset }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Score Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Originality Report</h3>
          <OriginalityMeter score={result.similarityScore} />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 p-4 rounded-xl text-center">
              <p className="text-sm text-slate-500">Words Analyzed</p>
              <p className="text-xl font-bold text-slate-800">{result.wordCount}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-center">
              <p className="text-sm text-slate-500">Similarity Score</p>
              <p className="text-xl font-bold text-red-500">{result.similarityScore}%</p>
            </div>
          </div>
        </div>

        {/* Right: Sources Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-hidden">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Potential Sources</h3>
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
            {result.sources.length > 0 ? (
              result.sources.map((source, index) => (
                <div key={index} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 transition-colors group">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-slate-800 line-clamp-1">{source.title}</h4>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                      {source.matchPercentage}% Match
                    </span>
                  </div>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 truncate block mb-2 hover:underline">
                    {source.url}
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <i className="fas fa-check-circle text-3xl mb-2 text-green-500"></i>
                <p>No matches found in web search.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Highlight View */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
          <i className="fas fa-highlighter text-indigo-500 mr-2"></i>
          Content Breakdown
        </h3>
        <div className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
          {result.segments.map((segment, index) => (
            <span
              key={index}
              className={`px-0.5 rounded transition-all duration-200 ${
                segment.isPlagiarized 
                  ? 'bg-red-100 border-b-2 border-red-400 cursor-help' 
                  : 'bg-green-50'
              }`}
              title={segment.explanation}
            >
              {segment.text}
            </span>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <h4 className="font-semibold text-indigo-900 mb-2">Executive Summary</h4>
          <p className="text-indigo-800 text-sm leading-relaxed">{result.summary}</p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onReset}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium flex items-center"
          >
            <i className="fas fa-redo mr-2"></i>
            Check New Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
