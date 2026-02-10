
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Home } from './pages/Home';
import { Scholars } from './pages/Scholars';
import { Papers } from './pages/Papers';
import { Search } from './pages/Search';
import { Comparison } from './pages/Comparison';
import { Institutions } from './pages/Institutions';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('landing');

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <Landing setActiveTab={setActiveTab} />;
      case 'home':
        return <Home setActiveTab={setActiveTab} />;
      case 'institutions':
        return <Institutions />;
      case 'comparison':
        return <Comparison />;
      case 'scholars':
        return <Scholars />;
      case 'papers':
        return <Papers />;
      case 'search':
        return <Search />;
      default:
        return <Landing setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
