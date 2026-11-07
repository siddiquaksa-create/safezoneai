import { AIAnalysisResult } from '../types';

export async function analyzeIncidentImage(
  imageData: string,
  location?: string,
  userNotes?: string
): Promise<AIAnalysisResult> {
  const response = await fetch('/api/gemini/analyze-incident', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageData,
      location,
      userNotes,
    }),
  });

  if (!response.ok) {
    throw new Error(`Server returned error ${response.status}`);
  }

  return response.json();
}

export async function sendChatMessage(
  message: string,
  language: 'en' | 'ta' = 'en',
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{
  reply: string;
  detectedLanguage: string;
  quickTips?: string[];
  isDemoFallback?: boolean;
}> {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      language,
      history,
    }),
  });

  if (!response.ok) {
    throw new Error(`Server returned error ${response.status}`);
  }

  return response.json();
}

export async function fetchLiveAlerts() {
  const response = await fetch('/api/alerts/live');
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts`);
  }
  return response.json();
}
