
import { SavedAnalysis, MeetingAnalysis } from '../types';

const BASE_KEY = 'm2a_analysis_history';

const getKey = (userId?: string) => userId ? `${BASE_KEY}_${userId}` : BASE_KEY;

export const storageService = {
  saveAnalysis: (analysis: MeetingAnalysis, sourceName: string, userId?: string): SavedAnalysis => {
    const history = storageService.getHistory(userId);
    const newEntry: SavedAnalysis = {
      ...analysis,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      sourceName
    };

    const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
    localStorage.setItem(getKey(userId), JSON.stringify(updatedHistory));
    return newEntry;
  },

  getHistory: (userId?: string): SavedAnalysis[] => {
    try {
      const data = localStorage.getItem(getKey(userId));
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  },

  deleteAnalysis: (id: string, userId?: string) => {
    const history = storageService.getHistory(userId);
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(getKey(userId), JSON.stringify(updatedHistory));
  },

  updateAnalysis: (updatedAnalysis: SavedAnalysis, userId?: string) => {
    const history = storageService.getHistory(userId);
    const index = history.findIndex(item => item.id === updatedAnalysis.id);

    if (index !== -1) {
      history[index] = updatedAnalysis;
      localStorage.setItem(getKey(userId), JSON.stringify(history));
    }
  }
};
