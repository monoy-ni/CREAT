import { useState, useEffect, useCallback } from 'react';
import { Document, Block, BlockType } from '../types';

const STORAGE_KEY = 'creat_documents_v1';

const createInitialBlock = (): Block => ({
  id: crypto.randomUUID(),
  type: BlockType.PARAGRAPH,
  content: '',
});

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDocuments(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse documents", e);
      }
    } else {
      // Seed with a welcome document if empty
      const welcomeDoc: Document = {
        id: crypto.randomUUID(),
        title: 'Welcome to CREAT',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        blocks: [
          { id: crypto.randomUUID(), type: BlockType.H1, content: 'Welcome to CREAT' },
          { id: crypto.randomUUID(), type: BlockType.PARAGRAPH, content: 'This is a block-based editor designed for developers and creators. You can write text, insert images, and most importantly, run code directly!' },
          { id: crypto.randomUUID(), type: BlockType.H2, content: 'Live Code Execution' },
          { id: crypto.randomUUID(), type: BlockType.PARAGRAPH, content: 'Try editing the code below to see the changes instantly.' },
          { 
            id: crypto.randomUUID(), 
            type: BlockType.CODE, 
            content: `<style>
  .box {
    width: 100px;
    height: 100px;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 12px;
    animation: spin 3s infinite linear;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: sans-serif;
    font-weight: bold;
  }
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
</style>
<div class="box">CREAT</div>`, 
            metadata: { height: 200 } 
          },
        ]
      };
      setDocuments([welcomeDoc]);
    }
    setLoading(false);
  }, []);

  // Save to local storage whenever documents change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    }
  }, [documents, loading]);

  const createDocument = useCallback(() => {
    const newDoc: Document = {
      id: crypto.randomUUID(),
      title: 'Untitled',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blocks: [createInitialBlock()],
    };
    setDocuments(prev => [newDoc, ...prev]);
    return newDoc.id;
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates, updatedAt: Date.now() } : doc
    ));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const getDocument = useCallback((id: string) => {
    return documents.find(doc => doc.id === id);
  }, [documents]);

  return {
    documents,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    loading
  };
};