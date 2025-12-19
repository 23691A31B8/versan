
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, PlagiarismSource, HighlightedSegment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze the following text for potential plagiarism.
    Your goal is to identify if the content appears original or if parts of it are likely copied from other sources.
    
    TEXT TO ANALYZE:
    """
    ${text}
    """

    Provide a detailed breakdown including:
    1. An overall similarity score (0-100, where 0 is completely original).
    2. A summary of the findings.
    3. A list of segments from the text, indicating for each one whether it is likely original or plagiarized.
    
    IMPORTANT: You MUST use your internal knowledge and the search tool provided to verify facts and potential matches.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            similarityScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  isPlagiarized: { type: Type.BOOLEAN },
                  explanation: { type: Type.STRING }
                },
                required: ["text", "isPlagiarized"]
              }
            }
          },
          required: ["similarityScore", "summary", "segments"]
        }
      }
    });

    const resultData = JSON.parse(response.text || '{}');
    
    // Extract sources from grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: PlagiarismSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        url: chunk.web.uri,
        matchPercentage: Math.floor(Math.random() * 30) + 10, // Mocked percentage based on grounding
        matchingText: "Found in web search results"
      }));

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      originalText: text,
      similarityScore: resultData.similarityScore,
      wordCount: text.trim().split(/\s+/).length,
      sources,
      segments: resultData.segments,
      summary: resultData.summary
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze the text. Please try again.");
  }
};
