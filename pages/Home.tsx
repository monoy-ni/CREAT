import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';
import { Plus, FileText, Trash2, Code, Eye, Edit3 } from 'lucide-react';
import { BlockType } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { documents, createDocument, deleteDocument, loading } = useDocuments();

  const handleCreate = () => {
    const id = createDocument();
    navigate(`/doc/${id}`);
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                        <Code size={24} strokeWidth={3} />
                    </div>
                    CREAT
                </h1>
                <p className="text-gray-500 mt-2">Interactive documentation for builders.</p>
            </div>
            <button 
                onClick={handleCreate}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
            >
                <Plus size={20} />
                New Document
            </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => {
                // Find first code block for preview snippet if available
                const hasCode = doc.blocks.some(b => b.type === BlockType.CODE);

                return (
                    <div 
                        key={doc.id}
                        className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-brand-200 transition-all cursor-pointer relative flex flex-col h-[280px]"
                        onClick={() => navigate(`/doc/${doc.id}`)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${hasCode ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                                {hasCode ? <Code size={20} /> : <FileText size={20} />}
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); }}
                                className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{doc.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">
                             {doc.blocks.find(b => b.type === BlockType.PARAGRAPH)?.content || "No preview text available."}
                        </p>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                            <div className="text-xs text-gray-400 font-medium">
                                {new Date(doc.updatedAt).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/post/${doc.id}`); }}
                                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                                    title="View Live Blog"
                                >
                                    <Eye size={18} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/doc/${doc.id}`); }}
                                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                                    title="Edit"
                                >
                                    <Edit3 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {/* Empty State */}
            {documents.length === 0 && (
                <div className="col-span-full py-20 text-center">
                    <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                        <FileText size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
                    <p className="text-gray-500 mt-2">Create your first interactive doc to get started.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Home;