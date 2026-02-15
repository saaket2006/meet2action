
export interface ActionItem {
  task: string;
  assignee: string;
  deadline?: string;
  priority: 'High' | 'Medium' | 'Low';
  canExport: boolean;
  reasoning?: string; // provided by backend agent
}

export interface SummaryPoint {
  topic: string;
  content: string;
  reasoning?: string; // provided by backend agent
}

export interface MeetingAnalysis {
  intent: string;
  summary: SummaryPoint[];
  actionItems: ActionItem[];
  projectContextFound: boolean;
}

export interface SavedAnalysis extends MeetingAnalysis {
  id: string;
  createdAt: string;
  sourceName: string;
}

export type AnalysisStatus = 'idle' | 'analyzing' | 'reasoning' | 'success' | 'error';
export type View = 'main' | 'integrations';

export interface FileData {
  name: string;
  type: string;
  file: File;
}


export type AgentRole = 'IntentAnalyzer' | 'Summarizer' | 'ActionExtractor' | 'ReasoningAgent';
