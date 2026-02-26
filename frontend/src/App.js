import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import StructureAnalyser from './StructureAnalyser';
import StructureBuilder from './StructureBuilder';

function App() {
  const [activeTab, setActiveTab] = useState('builder');

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="App-nav">
            <Link to="/builder" onClick={() => setActiveTab('builder')} className={activeTab === 'builder' ? 'active' : ''}>
              Structure Builder
            </Link>
            <Link to="/analyser" onClick={() => setActiveTab('analyser')} className={activeTab === 'analyser' ? 'active' : ''}>
              Structure Analyser
            </Link>
          </nav>
        </header>
        <main className="App-content">
          <Routes>
            <Route path="/analyser" element={<StructureAnalyser />} />
            <Route path="/builder" element={<StructureBuilder />} />
            <Route path="/" element={<StructureBuilder />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
