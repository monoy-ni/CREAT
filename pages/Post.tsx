import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';
import { Block, BlockType } from '../types';
import CodeRunner from '../components/CodeRunner';
import { Edit3, ArrowLeft, Calendar, User, Code } from 'lucide-react';

const Post: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocument, loading } = useDocuments();
  const [doc, setDoc] = useState(getDocument(id!));

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

  if (loading || !doc) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-100 selection:text-brand-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <div className="p-1.5 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors">
              <ArrowLeft size={16} />
            </div>
            Back to Home
          </button>
          
          <button 
            onClick={() => navigate(`/doc/${doc.id}`)}
            className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-full transition-colors"
          >
            <Edit3 size={16} />
            Edit Article
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            {doc.title}
          </h1>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span>Author</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span>{new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="space-y-8">
          {doc.blocks.map((block) => (
            <ReadBlockItem key={block.id} block={block} />
          ))}
        </article>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-12 mt-12 border-t border-gray-100 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} CREAT. Built with Gemini & React.</p>
      </footer>
    </div>
  );
};

const ReadBlockItem: React.FC<{ block: Block }> = ({ block }) => {
  if (!block.content && block.type !== BlockType.IMAGE) return null;

  switch (block.type) {
    case BlockType.H1:
      // Note: H1 is usually reserved for the title, but we handle it just in case
      return <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900">{block.content}</h2>;
    
    case BlockType.H2:
      return <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-800">{block.content}</h2>;
    
    case BlockType.H3:
      return <h3 className="text-xl font-semibold mt-8 mb-3 text-gray-800">{block.content}</h3>;
    
    case BlockType.PARAGRAPH:
      return <p className="text-lg leading-relaxed text-gray-700">{block.content}</p>;
    
    case BlockType.IMAGE:
      if (!block.content) return null;
      return (
        <figure className="my-8">
          <img 
            src={block.content} 
            alt="Article content" 
            className="w-full rounded-xl shadow-lg border border-gray-100"
          />
        </figure>
      );

    case BlockType.CODE:
      return (
        <div className="my-10 space-y-4">
           {/* Visual output */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               Live Preview
             </div>
             <div className="p-1">
                <CodeRunner code={block.content} height={block.metadata?.height || 300} />
             </div>
           </div>

           {/* Code Source (Collapsible style or just displayed) */}
           <div className="rounded-lg bg-gray-900 overflow-hidden shadow-inner">
             <div className="px-4 py-2 bg-gray-800/50 flex items-center gap-2 text-xs text-gray-400 border-b border-gray-800">
               <Code size={14} />
               <span>Source Code</span>
             </div>
             <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
               <code>{block.content}</code>
             </pre>
           </div>
        </div>
      );

    default:
      return null;
  }
};

export default Post;