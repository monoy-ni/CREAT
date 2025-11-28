import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';
import BlockItem from '../components/BlockItem';
import { Block, BlockType } from '../types';
import { ChevronLeft, ExternalLink, Eye } from 'lucide-react';

const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocument, updateDocument, loading } = useDocuments();
  const [doc, setDoc] = useState(getDocument(id!));
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
        const found = getDocument(id!);
        if (found) {
            setDoc(found);
        } else {
            navigate('/');
        }
    }
  }, [id, loading, getDocument, navigate]);

  const handleUpdateBlock = (blockId: string, content: string, metadata?: any) => {
    if (!doc) return;
    const newBlocks = doc.blocks.map(b => 
      b.id === blockId ? { ...b, content, metadata: { ...b.metadata, ...metadata } } : b
    );
    
    // Update title if H1 changes (first H1)
    let newTitle = doc.title;
    const titleBlock = newBlocks.find(b => b.type === BlockType.H1);
    if (titleBlock) {
        newTitle = titleBlock.content.trim() || 'Untitled';
    }

    const updatedDoc = { ...doc, blocks: newBlocks, title: newTitle };
    setDoc(updatedDoc);
    updateDocument(doc.id, { blocks: newBlocks, title: newTitle });
  };

  const handleAddBlock = (afterId: string, type: BlockType = BlockType.PARAGRAPH) => {
    if (!doc) return;
    const currentIndex = doc.blocks.findIndex(b => b.id === afterId);
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      content: '',
    };
    const newBlocks = [...doc.blocks];
    newBlocks.splice(currentIndex + 1, 0, newBlock);
    
    const updatedDoc = { ...doc, blocks: newBlocks };
    setDoc(updatedDoc);
    updateDocument(doc.id, { blocks: newBlocks });
    setFocusedBlockId(newBlock.id);
  };

  const handleRemoveBlock = (blockId: string) => {
    if (!doc) return;
    if (doc.blocks.length <= 1) return; // Don't delete last block
    
    const currentIndex = doc.blocks.findIndex(b => b.id === blockId);
    const prevBlock = doc.blocks[currentIndex - 1];
    
    const newBlocks = doc.blocks.filter(b => b.id !== blockId);
    const updatedDoc = { ...doc, blocks: newBlocks };
    
    setDoc(updatedDoc);
    updateDocument(doc.id, { blocks: newBlocks });
    
    if (prevBlock) {
        setFocusedBlockId(prevBlock.id);
    }
  };

  const handleTypeChange = (blockId: string, type: BlockType) => {
    if (!doc) return;
    const newBlocks = doc.blocks.map(b => 
        b.id === blockId ? { ...b, type } : b
    );
    const updatedDoc = { ...doc, blocks: newBlocks };
    setDoc(updatedDoc);
    updateDocument(doc.id, { blocks: newBlocks });
  };

  if (loading || !doc) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <ChevronLeft size={20} />
                </button>
                <div className="text-sm text-gray-400 hidden sm:block">
                    Last edited {new Date(doc.updatedAt).toLocaleTimeString()}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-xs text-gray-400 font-medium hidden sm:block">
                    Changes saved locally
                </div>
                <button 
                  onClick={() => navigate(`/post/${doc.id}`)}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm"
                >
                  <Eye size={16} />
                  View Live
                </button>
            </div>
        </div>
      </header>

      {/* Editor Canvas */}
      <main className="max-w-4xl mx-auto px-4 py-12 md:px-12">
        <div className="space-y-1">
            {doc.blocks.map(block => (
                <BlockItem
                    key={block.id}
                    block={block}
                    isFocused={focusedBlockId === block.id}
                    onFocus={setFocusedBlockId}
                    onUpdate={handleUpdateBlock}
                    onAddBlock={handleAddBlock}
                    onRemoveBlock={handleRemoveBlock}
                    onTypeChange={handleTypeChange}
                />
            ))}
        </div>
        
        {/* Bottom area to catch clicks and add block at end */}
        <div 
            className="h-32 cursor-text" 
            onClick={() => {
                if (doc.blocks.length > 0) {
                    handleAddBlock(doc.blocks[doc.blocks.length - 1].id);
                }
            }}
        />
      </main>
    </div>
  );
};

export default Editor;