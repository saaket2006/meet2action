
import { SavedAnalysis, MeetingAnalysis } from '../types';

const STORAGE_KEY = 'm2a_analysis_history';

export const storageService = {
  saveAnalysis: (analysis: MeetingAnalysis, sourceName: string): SavedAnalysis => {
    const history = storageService.getHistory();
    const newEntry: SavedAnalysis = {
      ...analysis,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      sourceName
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return newEntry;
  },

  getHistory: (): SavedAnalysis[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  },

  deleteAnalysis: (id: string) => {
    const history = storageService.getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  }
};
