import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Post from './pages/Post';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doc/:id" element={<Editor />} />
        <Route path="/post/:id" element={<Post />} />
      </Routes>
    </HashRouter>
  );
};

export default App;