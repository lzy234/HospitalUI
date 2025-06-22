export interface VideoInfo {
  taskId: string;
  url: string;
  fileName: string;
}

export interface ParseResult {
  transcript: string;
  meta: Record<string, any>;
}

export interface ReferenceItem {
  fileId: string;
  fileName: string;
  uploadTime: string;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  loading?: boolean;
}

export interface GlobalState {
  video: VideoInfo | null;
  transcript: string;
  references: ReferenceItem[];
  messages: Message[];
  loading: {
    upload: boolean;
    parse: boolean;
    chat: boolean;
    export: boolean;
  };
} 