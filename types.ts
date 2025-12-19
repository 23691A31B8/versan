
export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface PlagiarismSource {
  title: string;
  url: string;
  matchPercentage: number;
  matchingText: string;
}

export interface HighlightedSegment {
  text: string;
  isPlagiarized: boolean;
  sourceUrl?: string;
  explanation?: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  originalText: string;
  similarityScore: number;
  wordCount: number;
  sources: PlagiarismSource[];
  segments: HighlightedSegment[];
  summary: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
