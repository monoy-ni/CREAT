import React, { useRef, useEffect, useState } from 'react';
import { Block, BlockType } from '../types';
import CodeRunner from './CodeRunner';
import { generateBlockContent } from '../services/geminiService';
import { 
  Trash2, 
  Image as ImageIcon, 
  Code as CodeIcon, 
  Type, 
  Sparkles, 
  MoreVertical,
  Play,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface BlockItemProps {
  block: Block;
  isFocused: boolean;
  onUpdate: (id: string, content: string, metadata?: any) => void;
  onFocus: (id: string) => void;
  onAddBlock: (afterId: string, type?: BlockType) => void;
  onRemoveBlock: (id: string) => void;
  onTypeChange: (id: string, type: BlockType) => void;
}

const BlockItem: React.FC<BlockItemProps> = ({
  block,
  isFocused,
  onUpdate,
  onFocus,
  onAddBlock,
  onRemoveBlock,
  onTypeChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [block.content, block.type]);

  // Handle focus
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
      // Only set cursor to end if it's a fresh focus action (optimization omitted for simplicity)
    }
  }, [isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (block.type !== BlockType.CODE) {
        e.preventDefault();
        onAddBlock(block.id);
      }
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onRemoveBlock(block.id);
    } else if (e.key === '/') {
       // A simplistic "slash command" hint could go here
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(block.id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const content = await generateBlockContent(aiPrompt, block.type, block.content);
      onUpdate(block.id, content);
      setShowAiInput(false);
      setAiPrompt('');
    } catch (err) {
      alert("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  // Render logic based on block type
  const renderInput = () => {
    switch (block.type) {
      case BlockType.H1:
        return 'text-4xl font-bold text-gray-900 placeholder-gray-300';
      case BlockType.H2:
        return 'text-2xl font-semibold text-gray-800 placeholder-gray-300 mt-4';
      case BlockType.H3:
        return 'text-xl font-medium text-gray-800 placeholder-gray-300 mt-2';
      case BlockType.CODE:
        return 'font-mono text-sm bg-gray-900 text-green-400 p-4 rounded-md w-full resize-none outline-none leading-relaxed';
      case BlockType.PARAGRAPH:
      default:
        return 'text-lg text-gray-700 font-serif leading-relaxed placeholder-gray-300';
    }
  };

  return (
    <div className="group relative mb-2 transition-all duration-200">
      
      {/* Block Controls (Left Side) */}
      <div className="absolute -left-12 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
        <div className="relative">
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
            >
                <MoreVertical size={16} />
            </button>
            
            {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded shadow-xl z-50 py-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Turn into</div>
                    <button onClick={() => { onTypeChange(block.id, BlockType.PARAGRAPH); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"><Type size={14}/> Text</button>
                    <button onClick={() => { onTypeChange(block.id, BlockType.H1); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"><Type size={14} className="font-bold"/> Heading 1</button>
                    <button onClick={() => { onTypeChange(block.id, BlockType.H2); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"><Type size={14} className="font-semibold"/> Heading 2</button>
                    <button onClick={() => { onTypeChange(block.id, BlockType.CODE); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"><CodeIcon size={14}/> Code</button>
                    <button onClick={() => { onTypeChange(block.id, BlockType.IMAGE); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"><ImageIcon size={14}/> Image</button>
                    <div className="border-t my-1"></div>
                    <button onClick={() => { onRemoveBlock(block.id); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 size={14}/> Delete</button>
                </div>
            )}
        </div>
        <button 
            onClick={() => setShowAiInput(!showAiInput)}
            className="p-1 hover:bg-purple-100 rounded text-purple-400 hover:text-purple-600"
            title="Ask AI"
        >
            <Sparkles size={16} />
        </button>
      </div>

      {/* AI Prompt Input */}
      {showAiInput && (
        <div className="mb-2 p-2 bg-purple-50 rounded-lg border border-purple-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Sparkles size={16} className="text-purple-500" />
            <input 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={block.type === BlockType.CODE ? "Describe the code you want (e.g. 'A blue button that bounces')..." : "Ask AI to write something..."}
                className="flex-1 bg-transparent outline-none text-sm text-purple-900 placeholder-purple-300"
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                autoFocus
            />
            <button 
                onClick={handleAiGenerate} 
                disabled={isGenerating}
                className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
            >
                {isGenerating ? '...' : 'Generate'}
            </button>
        </div>
      )}

      {/* Content Area */}
      {block.type === BlockType.IMAGE ? (
        <div className="relative group/image">
          {block.content ? (
            <img src={block.content} alt="User uploaded" className="max-w-full rounded-lg shadow-sm" />
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2 text-sm text-gray-500">
                <label className="cursor-pointer text-brand-600 font-medium hover:text-brand-500">
                  Upload an image
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          )}
        </div>
      ) : block.type === BlockType.CODE ? (
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group/code">
                <textarea
                    ref={textareaRef}
                    value={block.content}
                    onChange={(e) => onUpdate(block.id, e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => onFocus(block.id)}
                    className={`${renderInput()} code-scroll w-full`}
                    placeholder="Enter HTML/CSS/JS here..."
                    spellCheck={false}
                    rows={5}
                />
                <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-500 font-mono bg-gray-800/50 px-2 py-1 rounded">HTML/CSS/JS</span>
                </div>
            </div>
            <div className="flex-1 min-h-[200px]">
                 <div className="bg-gray-100 rounded-t-lg px-4 py-2 text-xs font-semibold text-gray-500 border-b flex justify-between items-center">
                    <span>PREVIEW</span>
                    <Play size={12} className="text-green-500" fill="currentColor"/>
                 </div>
                 <CodeRunner code={block.content} />
            </div>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => onUpdate(block.id, e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => onFocus(block.id)}
          className={`w-full bg-transparent outline-none resize-none overflow-hidden ${renderInput()}`}
          placeholder={block.type === BlockType.H1 ? "Untitled" : "Type '/' for commands"}
          rows={1}
        />
      )}
    </div>
  );
};

export default BlockItem;