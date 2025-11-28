export enum BlockType {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  PARAGRAPH = 'paragraph',
  IMAGE = 'image',
  CODE = 'code',
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    language?: string;
    caption?: string;
    isRunning?: boolean;
    height?: number;
  };
}

export interface Document {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
}

export interface UserState {
  documents: Document[];
  currentDocId: string | null;
}